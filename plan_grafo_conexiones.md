# Plan de Implementación Senior: Grafo de Conexiones de Medios
### + Sistema de Imágenes Reales · Localización Automática por País

> **Clasificación:** Plan de Ingeniería de Producción  
> **Nivel:** Senior Full-Stack  
> **Alcance:** 3 módulos interdependientes, 4 fases de desarrollo  
> **Stack:** Next.js 15 · FastAPI · Supabase · react-force-graph · WebSocket

---

## Resumen Ejecutivo

Este plan unifica tres requerimientos que a primera vista parecen independientes pero que comparten infraestructura de datos y decisiones de arquitectura. Construirlos juntos desde el inicio evita refactorizaciones costosas:

1. **Grafo de Conexiones de Medios** (`/grafo`) — visualización interactiva de la red de vínculos entre medios: quién cita a quién, quién es el "paciente cero" de una narrativa, dónde viven las cámaras de eco
2. **Sistema de Imágenes Reales** — extracción y cache de imágenes OG de los artículos con el mismo look de Perplexity Discover
3. **Localización Automática** — inglés 100% para usuarios en EE.UU., detección por IP + preferencia explícita, afecta tanto la UI como el idioma del análisis de la IA

El principio rector de este plan: **cada decisión técnica debe tener costo operativo cero o cercano a cero**, sin sacrificar calidad de producción.

---

## Módulo 1: Sistema de Imágenes Reales

### 1.1 Por qué las imágenes de Perplexity Discover se ven tan bien

Perplexity no hace nada mágico — extrae el tag `og:image` del HTML de cada artículo. Es la imagen que el mismo periódico definió para previews en redes sociales. Son fotos editoriales de alta calidad porque los noticieros las cuidan para que se vean bien en Twitter/X y Facebook. La diferencia entre Perplexity y otras apps de noticias es que:

- **Extraen el og:image en el momento del scraping** (no usan thumbnails comprimidos)
- **Usan un proxy propio** para servir la imagen con headers correctos (evita hotlinking bloqueado)
- **Aplican blur-up loading** — primero cargan una versión micro (10px) y hacen fade-in a la imagen real
- **Tienen fallbacks elegantes** — si no hay imagen, usan el color dominante del logo del medio

### 1.2 Esquema de Datos

```sql
-- Nueva columna en la tabla articles existente
ALTER TABLE articles ADD COLUMN IF NOT EXISTS
  og_image_url         TEXT,           -- URL original del og:image
  og_image_cached_path TEXT,           -- Path en nuestro CDN/cache
  og_image_color       TEXT,           -- Color dominante en hex (#1a2b3c)
  og_image_blurhash    TEXT,           -- Blurhash para el blur-up effect
  og_image_width       INTEGER,
  og_image_height      INTEGER,
  og_image_alt         TEXT;           -- og:image:alt si existe
```

### 1.3 Pipeline de Extracción de Imágenes

**En el backend (FastAPI), durante el scraping de cada artículo:**

```python
# services/image_extractor.py

import httpx
from bs4 import BeautifulSoup
from blurhash import encode as blurhash_encode
from colorthief import ColorThief
from PIL import Image
import io
import hashlib

class ArticleImageExtractor:
    """
    Extrae og:image de artículos con fallback inteligente.
    Costo: $0 — todo local excepto el fetch inicial del artículo.
    """
    
    PRIORITY_TAGS = [
        ('meta', {'property': 'og:image:secure_url'}),
        ('meta', {'property': 'og:image'}),
        ('meta', {'name': 'twitter:image:src'}),
        ('meta', {'name': 'twitter:image'}),
        ('link',  {'rel': 'image_src'}),
    ]
    
    async def extract(self, html: str, base_url: str) -> dict:
        soup = BeautifulSoup(html, 'lxml')
        image_url = None
        
        # 1. Buscar en orden de prioridad
        for tag, attrs in self.PRIORITY_TAGS:
            el = soup.find(tag, attrs)
            if el:
                image_url = el.get('content') or el.get('href')
                if image_url:
                    break
        
        # 2. Fallback: primera imagen editorial grande dentro del artículo
        if not image_url:
            for img in soup.find_all('img', src=True):
                src = img.get('src', '')
                # Filtrar logos, íconos y trackers — solo imágenes editoriales
                if any(skip in src.lower() for skip in [
                    'logo', 'icon', 'avatar', 'pixel', 'tracking',
                    '1x1', 'spacer', 'ad', 'banner'
                ]):
                    continue
                # Verificar tamaño mínimo declarado
                w = int(img.get('width', 0) or 0)
                h = int(img.get('height', 0) or 0)
                if w >= 400 or h >= 250 or (w == 0 and h == 0):
                    image_url = img.get('src')
                    break
        
        if not image_url:
            return {"og_image_url": None}
        
        # 3. Normalizar URL relativa a absoluta
        if image_url.startswith('//'):
            image_url = 'https:' + image_url
        elif image_url.startswith('/'):
            from urllib.parse import urljoin
            image_url = urljoin(base_url, image_url)
        
        # 4. Procesar la imagen: blurhash + color dominante
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(image_url, follow_redirects=True)
                if resp.status_code != 200:
                    return {"og_image_url": image_url}
                
                img_bytes = resp.content
                img = Image.open(io.BytesIO(img_bytes))
                width, height = img.size
                
                # Blurhash (encode desde versión pequeña para velocidad)
                small = img.resize((32, 32))
                bh = blurhash_encode(list(small.getdata()), 32, 32, 4, 3)
                
                # Color dominante
                ct = ColorThief(io.BytesIO(img_bytes))
                r, g, b = ct.get_color(quality=5)
                color_hex = f'#{r:02x}{g:02x}{b:02x}'
                
                return {
                    "og_image_url": image_url,
                    "og_image_color": color_hex,
                    "og_image_blurhash": bh,
                    "og_image_width": width,
                    "og_image_height": height,
                }
        except Exception:
            return {"og_image_url": image_url}
```

### 1.4 Proxy de Imágenes en Next.js

Para evitar que los medios bloqueen hotlinking (muchos periódicos bloquean `Referer` externo):

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }  // Permitimos cualquier origen
    ],
    // Next.js Image Optimization actúa como proxy automáticamente
    // Redimensiona, optimiza y sirve desde nuestro CDN (Vercel Edge)
  }
}
```

```tsx
// components/ArticleCard/ArticleImage.tsx

'use client'
import Image from 'next/image'
import { useState } from 'react'
import { decode as blurhashDecode } from 'blurhash'
import { useEffect, useRef } from 'react'

interface ArticleImageProps {
  src: string | null
  alt: string
  blurhash?: string
  dominantColor?: string
  mediaName: string
  mediaLogoUrl?: string
}

export function ArticleImage({
  src, alt, blurhash, dominantColor = '#1a1a2e',
  mediaName, mediaLogoUrl
}: ArticleImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Render blurhash en canvas antes de que cargue la imagen real
  useEffect(() => {
    if (!blurhash || !canvasRef.current) return
    const pixels = blurhashDecode(blurhash, 32, 32)
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    const imageData = ctx.createImageData(32, 32)
    imageData.data.set(pixels)
    ctx.putImageData(imageData, 0, 0)
  }, [blurhash])
  
  // Fallback visual: gradiente con color dominante + logo del medio
  if (!src || error) {
    return (
      <div
        className="article-image-fallback"
        style={{ background: `linear-gradient(135deg, ${dominantColor}dd, ${dominantColor}55)` }}
        aria-label={`Imagen no disponible para ${mediaName}`}
      >
        {mediaLogoUrl && (
          <img
            src={mediaLogoUrl}
            alt={mediaName}
            className="media-logo-fallback"
          />
        )}
      </div>
    )
  }
  
  return (
    <div className="article-image-wrapper">
      {/* Blurhash placeholder — visible mientras carga la imagen real */}
      {!loaded && blurhash && (
        <canvas
          ref={canvasRef}
          width={32}
          height={32}
          className="blurhash-canvas"
          aria-hidden="true"
        />
      )}
      
      {/* Imagen real con proxy automático de Next.js */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        quality={85}
        className={`article-image ${loaded ? 'loaded' : 'loading'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        priority={false}  // Lazy load por defecto
      />
    </div>
  )
}
```

```css
/* styles/article-image.css */

.article-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
  background: #0d0d1a;
}

.blurhash-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  image-rendering: auto;
  transform: scale(1.05); /* Evita bordes duros del blur */
  filter: blur(12px);
}

.article-image {
  object-fit: cover;
  transition: opacity 0.4s ease;
}

.article-image.loading {
  opacity: 0;
}

.article-image.loaded {
  opacity: 1;
}

.article-image-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-logo-fallback {
  width: 60px;
  height: 60px;
  object-fit: contain;
  opacity: 0.6;
  filter: grayscale(40%);
}
```

### 1.5 Costo Operativo

- **Extracción de og:image:** $0 — parte del scraping existente
- **Procesamiento blurhash + color:** $0 — Python local en el servidor
- **Proxy y optimización de imagen:** $0 — Vercel Edge Image Optimization (incluido en free tier para proyectos OSS)
- **CDN de imágenes:** $0 — Cloudflare CDN en frente de Vercel

---

## Módulo 2: Localización Automática

### 2.1 Arquitectura de Decisión de Idioma

El idioma en VeritasAI opera en dos capas distintas que se deben tratar por separado:

- **Capa 1 — UI strings:** Labels, botones, menús, mensajes de error → `next-intl`
- **Capa 2 — Contenido generado por IA:** El análisis, la noticia neutralizada, el chatbot → system prompt dinámico

Un error común es mezclar ambas. La solución correcta es gestionar cada una con su herramienta apropiada.

```
Petición del usuario
       │
       ├─ Detectar idioma: IP → País → Locale
       │                              │
       │              ┌───────────────┴─────────────────┐
       │              │ EE.UU. (US)                     │ Otros
       │              │ → locale: 'en-US'               │ → locale: 'es-CO' / 'es-MX' / etc.
       │              └─────────────────────────────────┘
       │
       ├─ Capa 1 (UI): next-intl sirve los strings en el locale detectado
       │
       └─ Capa 2 (IA): El system prompt de todos los agentes recibe:
            `language_instruction: "Respond EXCLUSIVELY in American English"`
            o
            `language_instruction: "Responde EXCLUSIVAMENTE en español colombiano"`
```

### 2.2 Implementación del Sistema de Detección

```typescript
// lib/locale/detect.ts

export type SupportedLocale = 'en-US' | 'en-GB' | 'es-CO' | 'es-MX' | 'es-AR' | 'pt-BR'

const COUNTRY_TO_LOCALE: Record<string, SupportedLocale> = {
  'US': 'en-US',
  'GB': 'en-GB',
  'CA': 'en-US',   // Canadá anglófono → inglés
  'AU': 'en-US',
  'CO': 'es-CO',
  'MX': 'es-MX',
  'AR': 'es-AR',
  'CL': 'es-CO',   // Chile → español estándar colombiano como proxy
  'VE': 'es-CO',
  'PE': 'es-CO',
  'EC': 'es-CO',
  'BR': 'pt-BR',
}

export async function detectUserLocale(request: Request): Promise<SupportedLocale> {
  // 1. Prioridad máxima: preferencia guardada por el usuario (cookie)
  const savedLocale = getCookieFromRequest(request, 'veritas_locale')
  if (savedLocale && isValidLocale(savedLocale)) {
    return savedLocale as SupportedLocale
  }
  
  // 2. Header CF-IPCountry de Cloudflare (más confiable que ip-api)
  // Cloudflare lo añade automáticamente en el free tier
  const cfCountry = request.headers.get('CF-IPCountry')
  if (cfCountry && COUNTRY_TO_LOCALE[cfCountry]) {
    return COUNTRY_TO_LOCALE[cfCountry]
  }
  
  // 3. Fallback: Accept-Language del browser
  const acceptLang = request.headers.get('Accept-Language') || ''
  if (acceptLang.startsWith('en')) return 'en-US'
  if (acceptLang.includes('pt')) return 'pt-BR'
  
  // 4. Default: español colombiano
  return 'es-CO'
}
```

### 2.3 Configuración de next-intl

```
app/
├── [locale]/
│   ├── layout.tsx          ← Provider de locale
│   ├── page.tsx            ← Home feed
│   ├── article/[id]/
│   │   └── page.tsx
│   └── grafo/
│       └── page.tsx        ← Página del grafo
├── messages/
│   ├── en-US.json
│   ├── es-CO.json
│   ├── es-MX.json
│   └── pt-BR.json
└── middleware.ts            ← Detección y redirect
```

```typescript
// middleware.ts — Intercepta CADA request y asigna locale
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { detectUserLocale } from '@/lib/locale/detect'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Si la URL ya tiene locale (/en-US/...), no redirigir
  const pathnameHasLocale = [
    '/en-US', '/en-GB', '/es-CO', '/es-MX', '/es-AR', '/pt-BR'
  ].some(loc => pathname.startsWith(loc))
  
  if (pathnameHasLocale) return NextResponse.next()
  
  // Detectar locale y redirigir
  const locale = await detectUserLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  
  const response = NextResponse.redirect(url)
  // Guardar en cookie para futuros requests (30 días)
  response.cookies.set('veritas_locale', locale, { maxAge: 60 * 60 * 24 * 30 })
  
  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

### 2.4 Localización del Análisis de IA

La instrucción de idioma se inyecta en el system prompt de TODOS los agentes:

```python
# services/agents/base_agent.py

LANGUAGE_INSTRUCTIONS = {
    'en-US': "CRITICAL: Respond EXCLUSIVELY in American English. "
             "All analysis, explanations, and the neutralized article must be in English. "
             "Technical terms may be in English. Do NOT use Spanish under any circumstance.",
    'en-GB': "CRITICAL: Respond EXCLUSIVELY in British English.",
    'es-CO': "CRÍTICO: Responde EXCLUSIVAMENTE en español colombiano. "
             "Usa terminología periodística colombiana cuando sea relevante.",
    'es-MX': "CRÍTICO: Responde EXCLUSIVAMENTE en español mexicano.",
    'es-AR': "CRÍTICO: Responde EXCLUSIVAMENTE en español rioplatense.",
    'pt-BR': "CRÍTICO: Responde EXCLUSIVAMENTE em português brasileiro.",
}

class BaseAnalysisAgent:
    def __init__(self, locale: str = 'es-CO'):
        self.locale = locale
        self.language_instruction = LANGUAGE_INSTRUCTIONS.get(locale, LANGUAGE_INSTRUCTIONS['es-CO'])
    
    def build_system_prompt(self, base_prompt: str) -> str:
        return f"{self.language_instruction}\n\n{base_prompt}"
```

### 2.5 El Selector de Idioma en la UI

El usuario puede cambiar manualmente su idioma desde cualquier página:

```tsx
// components/LocaleSwitcher.tsx

'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

const LOCALES = [
  { code: 'en-US', label: '🇺🇸 English',     flag: '🇺🇸' },
  { code: 'es-CO', label: '🇨🇴 Español (CO)', flag: '🇨🇴' },
  { code: 'es-MX', label: '🇲🇽 Español (MX)', flag: '🇲🇽' },
  { code: 'pt-BR', label: '🇧🇷 Português',    flag: '🇧🇷' },
]

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  
  const switchLocale = (newLocale: string) => {
    // Reemplazar el segmento de locale en la URL actual
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    document.cookie = `veritas_locale=${newLocale}; max-age=${60*60*24*30}; path=/`
    router.push(newPath)
  }
  
  return (
    <div className="locale-switcher">
      {LOCALES.map(loc => (
        <button
          key={loc.code}
          className={`locale-btn ${locale === loc.code ? 'active' : ''}`}
          onClick={() => switchLocale(loc.code)}
          title={loc.label}
        >
          {loc.flag}
        </button>
      ))}
    </div>
  )
}
```

---

## Módulo 3: Grafo de Conexiones de Medios

### 3.1 Arquitectura General

El Grafo de Conexiones es la pieza de ingeniería más compleja de este plan. Requiere datos que se acumulan con el tiempo, un motor de análisis de grafos para calcular métricas de red, y una visualización frontend interactiva que no colapse el browser con 500 nodos.

La arquitectura tiene tres capas:

```
CAPA DE DATOS          CAPA ANALÍTICA           CAPA DE VISUALIZACIÓN
─────────────          ──────────────           ──────────────────────
Tabla media_links  →   Cron job nightly:    →   /grafo (Next.js)
(source → target)      · PageRank               react-force-graph-2d
                        · In/Out-degree          WebGL rendering
Tabla graph_metrics     · Community detection    Controles filtros
(métricas calculadas)   · Anomaly detection      Panel lateral
                        · Echo chamber score     Real-time WebSocket
```

### 3.2 Esquema de Base de Datos Completo

```sql
-- ────────────────────────────────────────────────────────────
-- TABLA 1: Vínculos individuales extraídos de cada artículo
-- ────────────────────────────────────────────────────────────
CREATE TABLE media_links (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- El artículo donde encontramos el link
    source_article_id   UUID REFERENCES articles(id) ON DELETE CASCADE,
    source_outlet_id    UUID REFERENCES media_outlets(id),
    source_domain       TEXT NOT NULL,
    
    -- El medio al que apunta el link
    target_domain       TEXT NOT NULL,
    target_outlet_id    UUID REFERENCES media_outlets(id),  -- NULL si no está en nuestro sistema
    target_url          TEXT NOT NULL,
    target_url_path     TEXT,  -- Solo el path, sin query params (para deduplicar)
    
    -- Contexto del link
    link_context        TEXT,  -- Las ~100 chars alrededor del link en el artículo
    link_anchor_text    TEXT,  -- El texto del <a> tag
    is_citation         BOOLEAN DEFAULT FALSE,  -- ¿Es una cita directa? (detectado por contexto)
    is_external         BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    extracted_at        TIMESTAMPTZ DEFAULT NOW(),
    article_published_at TIMESTAMPTZ
);

-- Índices para queries rápidos
CREATE INDEX idx_media_links_source ON media_links(source_outlet_id);
CREATE INDEX idx_media_links_target ON media_links(target_outlet_id);
CREATE INDEX idx_media_links_source_domain ON media_links(source_domain);
CREATE INDEX idx_media_links_target_domain ON media_links(target_domain);
CREATE INDEX idx_media_links_extracted ON media_links(extracted_at);

-- Vista materializada para agregar links por par de medios
-- Se refreshea nightly con el cron job
CREATE MATERIALIZED VIEW media_link_aggregates AS
SELECT
    source_outlet_id,
    target_outlet_id,
    source_domain,
    target_domain,
    COUNT(*)                                    AS link_count,
    COUNT(DISTINCT source_article_id)           AS article_count,
    COUNT(*) FILTER (WHERE is_citation = TRUE)  AS citation_count,
    MIN(article_published_at)                   AS first_seen,
    MAX(article_published_at)                   AS last_seen,
    -- Peso del edge para el grafo (ponderado por recencia)
    SUM(
      CASE
        WHEN article_published_at > NOW() - INTERVAL '7 days'  THEN 3.0
        WHEN article_published_at > NOW() - INTERVAL '30 days' THEN 1.5
        ELSE 0.8
      END
    )                                           AS edge_weight
FROM media_links
WHERE target_outlet_id IS NOT NULL  -- Solo links a medios que ya están en nuestro sistema
GROUP BY source_outlet_id, target_outlet_id, source_domain, target_domain;

CREATE UNIQUE INDEX ON media_link_aggregates(source_outlet_id, target_outlet_id);

-- ────────────────────────────────────────────────────────────
-- TABLA 2: Métricas de red calculadas por el cron job
-- ────────────────────────────────────────────────────────────
CREATE TABLE graph_metrics (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    outlet_id       UUID REFERENCES media_outlets(id) UNIQUE,
    
    -- Métricas de centralidad
    in_degree           INTEGER DEFAULT 0,  -- ¿Cuántos medios me citan?
    out_degree          INTEGER DEFAULT 0,  -- ¿A cuántos medios cito?
    pagerank_score      FLOAT DEFAULT 0.0,  -- Autoridad en la red (0-1)
    betweenness         FLOAT DEFAULT 0.0,  -- ¿Qué tan "puente" soy entre medios?
    
    -- Detección de comunidades
    community_id        INTEGER,            -- ID del cluster al que pertenece
    community_label     TEXT,               -- Ej: "Medios progresistas CO" / "Red conservadora"
    
    -- Anomalías
    echo_chamber_score  FLOAT DEFAULT 0.0,  -- 0=diverso, 1=cámara de eco pura
    source_laundering_flag BOOLEAN DEFAULT FALSE,  -- ¿Recibe muchos links pero pocos lectores?
    coordinated_network_flag BOOLEAN DEFAULT FALSE, -- ¿Parte de red coordinada detectada?
    
    -- Narrativa
    top_cited_by        JSONB,  -- Array de los 5 medios que más me citan
    top_citing          JSONB,  -- Array de los 5 medios que más cito
    narrative_overlap   JSONB,  -- Medios con > 70% de overlap temático
    
    -- Metadata del cálculo
    calculated_at   TIMESTAMPTZ DEFAULT NOW(),
    window_days     INTEGER DEFAULT 30  -- Ventana temporal usada
);

-- ────────────────────────────────────────────────────────────
-- TABLA 3: Historia de narrativas para "paciente cero"
-- ────────────────────────────────────────────────────────────
CREATE TABLE narrative_propagation (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    narrative_hash      TEXT NOT NULL,  -- Hash semántico de la narrativa
    narrative_summary   TEXT,
    
    -- Cronología de propagación
    patient_zero_outlet_id  UUID REFERENCES media_outlets(id),
    patient_zero_article_id UUID REFERENCES articles(id),
    patient_zero_at         TIMESTAMPTZ,
    
    -- Medios que replicaron y cuándo
    propagation_chain   JSONB,  -- [{outlet_id, article_id, published_at, delay_hours}]
    total_outlets       INTEGER,
    total_articles      INTEGER,
    peak_at             TIMESTAMPTZ,
    
    -- Análisis de la propagación
    avg_manipulation_score  FLOAT,  -- Score promedio de los artículos en la cadena
    is_organic              BOOLEAN,  -- ¿Propagación orgánica o coordinada?
    
    first_seen  TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Extracción de Links: El Scraper Forense

**Integrar en el pipeline existente de análisis de artículos:**

```python
# services/link_extractor.py

import re
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import tldextract

# Dominios que NO nos interesan como "vínculos periodísticos"
# (trackers, redes sociales, CDNs, servicios de métricas)
SKIP_DOMAINS = {
    'google.com', 'facebook.com', 'twitter.com', 'x.com', 'instagram.com',
    'youtube.com', 'tiktok.com', 'whatsapp.com', 'telegram.org',
    'googletagmanager.com', 'google-analytics.com', 'doubleclick.net',
    'cloudflare.com', 'amazonaws.com', 'akamai.net',
    'wikipedia.org', 'wikimedia.org',  # Referencias enciclopédicas — distinto tipo de vínculo
}

class ForensicLinkExtractor:
    """
    Extrae links externos de un artículo con contexto semántico.
    Distingue entre citas periodísticas reales y links decorativos.
    """
    
    def extract_links(self, html: str, source_url: str, article_id: str) -> list[dict]:
        soup = BeautifulSoup(html, 'lxml')
        source_domain = self._get_domain(source_url)
        
        # Solo analizar el cuerpo del artículo, no nav/footer/sidebar
        article_body = (
            soup.find('article') or
            soup.find(class_=re.compile(r'article|content|body|story', re.I)) or
            soup.find('main') or
            soup
        )
        
        links = []
        seen_target_domains = set()
        
        for a_tag in article_body.find_all('a', href=True):
            href = a_tag.get('href', '').strip()
            if not href or href.startswith('#') or href.startswith('mailto:'):
                continue
            
            # Normalizar URL
            full_url = urljoin(source_url, href)
            if not full_url.startswith('http'):
                continue
            
            target_domain = self._get_domain(full_url)
            
            # Filtrar links internos y dominios a ignorar
            if target_domain == source_domain:
                continue
            if target_domain in SKIP_DOMAINS:
                continue
            
            # Extraer contexto del link (texto circundante)
            context = self._extract_context(a_tag, chars=150)
            anchor_text = a_tag.get_text(strip=True)
            
            # Detectar si es una cita real o un link decorativo
            is_citation = self._is_citation(context, anchor_text, a_tag)
            
            links.append({
                'source_article_id': article_id,
                'source_domain': source_domain,
                'target_domain': target_domain,
                'target_url': full_url,
                'target_url_path': urlparse(full_url).path,
                'link_context': context,
                'link_anchor_text': anchor_text[:200],
                'is_citation': is_citation,
                'is_external': True,
            })
            
            # Máximo 50 links externos únicos por artículo
            # (artículos con más de esto suelen ser directorios, no editorial)
            if len(links) >= 50:
                break
        
        return links
    
    def _get_domain(self, url: str) -> str:
        extracted = tldextract.extract(url)
        return f"{extracted.domain}.{extracted.suffix}".lower()
    
    def _extract_context(self, a_tag, chars: int = 150) -> str:
        """Extrae texto circundante al link para determinar contexto semántico."""
        parent = a_tag.parent
        if not parent:
            return a_tag.get_text()
        full_text = parent.get_text(' ', strip=True)
        link_text = a_tag.get_text(strip=True)
        idx = full_text.find(link_text)
        if idx == -1:
            return full_text[:chars]
        start = max(0, idx - chars // 2)
        end = min(len(full_text), idx + len(link_text) + chars // 2)
        return full_text[start:end]
    
    def _is_citation(self, context: str, anchor: str, tag) -> bool:
        """
        Heurísticas para detectar si el link es una cita periodística real
        vs. un link de navegación, publicidad o decorativo.
        """
        context_lower = context.lower()
        anchor_lower = anchor.lower()
        
        # Señales positivas: palabras que indican cita
        citation_signals = [
            'según', 'according to', 'reportó', 'reported', 'publicó',
            'published', 'informó', 'as reported', 'citado por', 'cited by',
            'fuente:', 'source:', 'vía', 'via', 'per', 'de acuerdo con',
            'el medio', 'the outlet', 'el periódico', 'the newspaper'
        ]
        
        # Señales negativas: links de navegación/UI
        nav_signals = [
            'leer más', 'read more', 'ver también', 'related', 'compartir',
            'share', 'publicidad', 'advertisement', 'patrocinado', 'sponsored',
            'suscríbete', 'subscribe', 'inicio', 'home', 'nosotros', 'about'
        ]
        
        has_citation = any(s in context_lower for s in citation_signals)
        has_nav = any(s in anchor_lower for s in nav_signals)
        
        # El link apunta directamente a un artículo (URL con fecha o /article/ o slug)
        is_article_link = bool(re.search(r'/\d{4}/\d{2}/|/article/|/noticia/|/news/', tag.get('href', '')))
        
        return (has_citation or is_article_link) and not has_nav
```

### 3.4 Motor de Análisis de Grafos (Cron Job Nightly)

```python
# jobs/graph_analytics.py
# Corre cada noche a las 2am UTC via Celery Beat / Supabase Edge Functions

import networkx as nx
from community import community_louvain  # python-louvain
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from datetime import datetime, timedelta

class MediaGraphAnalytics:
    """
    Calcula métricas de red para todos los medios en el sistema.
    Usa NetworkX (gratuito, open source) — no se necesitan servicios externos.
    """
    
    def __init__(self, supabase_client):
        self.db = supabase_client
        self.window_days = 30  # Analizar los últimos 30 días por defecto
    
    async def run_full_analysis(self):
        """Pipeline completo de análisis del grafo."""
        print(f"[Graph Analytics] Iniciando análisis — {datetime.now()}")
        
        # 1. Construir el grafo desde la vista materializada
        G = await self._build_graph()
        print(f"[Graph Analytics] Grafo construido: {G.number_of_nodes()} nodos, {G.number_of_edges()} edges")
        
        # 2. Calcular métricas de centralidad
        metrics = {}
        metrics.update(self._calculate_centrality(G))
        
        # 3. Detectar comunidades (cámaras de eco)
        metrics.update(self._detect_communities(G))
        
        # 4. Detectar anomalías
        metrics.update(self._detect_anomalies(G))
        
        # 5. Detectar "pacientes cero" en narrativas recientes
        await self._trace_narrative_origins()
        
        # 6. Guardar resultados en graph_metrics
        await self._save_metrics(metrics)
        
        # 7. Refrescar vista materializada
        await self.db.rpc('refresh_materialized_view', {'view_name': 'media_link_aggregates'})
        
        print(f"[Graph Analytics] Completado — {datetime.now()}")
    
    async def _build_graph(self) -> nx.DiGraph:
        """Construye un grafo dirigido ponderado desde la DB."""
        G = nx.DiGraph()
        
        # Cargar todos los medios como nodos
        outlets = await self.db.from_('media_outlets').select(
            'id, name, domain, country_code, current_veritas_avg, alert_level'
        ).execute()
        
        for outlet in outlets.data:
            G.add_node(outlet['id'], **outlet)
        
        # Cargar edges desde la vista materializada
        edges = await self.db.from_('media_link_aggregates').select('*').execute()
        
        for edge in edges.data:
            if edge['source_outlet_id'] and edge['target_outlet_id']:
                G.add_edge(
                    edge['source_outlet_id'],
                    edge['target_outlet_id'],
                    weight=edge['edge_weight'],
                    link_count=edge['link_count'],
                    article_count=edge['article_count'],
                    citation_count=edge['citation_count'],
                    last_seen=edge['last_seen'],
                )
        
        return G
    
    def _calculate_centrality(self, G: nx.DiGraph) -> dict:
        """
        Calcula métricas de centralidad para cada nodo.
        PageRank es la métrica más valiosa — determina autoridad real en la red.
        """
        print("[Graph Analytics] Calculando PageRank...")
        pagerank = nx.pagerank(G, alpha=0.85, weight='weight', max_iter=200)
        
        print("[Graph Analytics] Calculando betweenness centrality...")
        # Para grafos grandes (>500 nodos), usar aproximación con k=100 muestras
        n_nodes = G.number_of_nodes()
        if n_nodes > 500:
            betweenness = nx.betweenness_centrality(G, k=min(100, n_nodes), weight='weight')
        else:
            betweenness = nx.betweenness_centrality(G, weight='weight')
        
        metrics_by_outlet = {}
        for node_id in G.nodes():
            metrics_by_outlet[node_id] = {
                'in_degree': G.in_degree(node_id),
                'out_degree': G.out_degree(node_id),
                'pagerank_score': pagerank.get(node_id, 0.0),
                'betweenness': betweenness.get(node_id, 0.0),
                # Top 5 fuentes que más me citan
                'top_cited_by': self._top_neighbors(G, node_id, 'in', n=5),
                # Top 5 medios que más cito
                'top_citing': self._top_neighbors(G, node_id, 'out', n=5),
            }
        
        return metrics_by_outlet
    
    def _detect_communities(self, G: nx.DiGraph) -> dict:
        """
        Detección de comunidades con algoritmo de Louvain.
        Las comunidades son las "cámaras de eco" — grupos de medios que
        preferentemente se citan entre ellos.
        """
        print("[Graph Analytics] Detectando comunidades (Louvain)...")
        
        # Louvain funciona mejor con grafo no dirigido para detección de comunidades
        G_undirected = G.to_undirected()
        partition = community_louvain.best_partition(G_undirected, weight='weight')
        
        # Calcular echo chamber score por nodo:
        # Ratio de links internos / links totales del nodo
        community_metrics = {}
        
        for node_id, community_id in partition.items():
            total_neighbors = set(G.predecessors(node_id)) | set(G.successors(node_id))
            
            if not total_neighbors:
                echo_score = 0.0
            else:
                # Vecinos en la misma comunidad
                same_community = {
                    n for n in total_neighbors
                    if partition.get(n) == community_id
                }
                echo_score = len(same_community) / len(total_neighbors)
            
            community_metrics[node_id] = {
                'community_id': community_id,
                'echo_chamber_score': round(echo_score, 3),
            }
        
        # Generar labels para comunidades basado en características dominantes
        community_labels = self._generate_community_labels(G, partition)
        
        for node_id in community_metrics:
            cid = community_metrics[node_id]['community_id']
            community_metrics[node_id]['community_label'] = community_labels.get(cid, f"Cluster {cid}")
        
        # Merge con metrics existentes
        merged = {}
        for node_id in G.nodes():
            merged[node_id] = community_metrics.get(node_id, {})
        
        return merged
    
    def _detect_anomalies(self, G: nx.DiGraph) -> dict:
        """
        Detecta patrones anómalos que sugieren operaciones coordinadas.
        """
        anomaly_metrics = {}
        
        for node_id in G.nodes():
            in_deg = G.in_degree(node_id)
            out_deg = G.out_degree(node_id)
            
            # Source Laundering Flag:
            # Un medio con muchos in-links pero bajo PageRank
            # sugiere una red artificial que lo cita para darle autoridad
            node_data = G.nodes[node_id]
            pagerank = node_data.get('pagerank_score', 0)
            
            laundering_flag = (in_deg > 20 and pagerank < 0.001)
            
            # Coordinated Network Flag:
            # Si >60% de los medios que me citan son parte de la misma comunidad
            # Y todos empezaron a citarme en una ventana de <48 horas
            predecessors = list(G.predecessors(node_id))
            coordinated_flag = False
            
            if len(predecessors) >= 5:
                # Verificar si los links llegaron de forma coordinada
                # (esto requiere datos temporales de media_link_aggregates)
                # Simplificación: si >70% de los que me citan tienen entre ellos una
                # alta densidad de links, es sospechoso
                if predecessors:
                    sub = G.subgraph(predecessors)
                    edge_density = nx.density(sub)
                    coordinated_flag = edge_density > 0.4  # Umbral ajustable
            
            anomaly_metrics[node_id] = {
                'source_laundering_flag': laundering_flag,
                'coordinated_network_flag': coordinated_flag,
            }
        
        return anomaly_metrics
    
    def _top_neighbors(self, G, node_id, direction='in', n=5) -> list:
        if direction == 'in':
            neighbors = [(n, G[n][node_id].get('weight', 1)) for n in G.predecessors(node_id)]
        else:
            neighbors = [(n, G[node_id][n].get('weight', 1)) for n in G.successors(node_id)]
        
        top = sorted(neighbors, key=lambda x: x[1], reverse=True)[:n]
        return [{'outlet_id': nid, 'weight': w} for nid, w in top]
    
    def _generate_community_labels(self, G, partition) -> dict[int, str]:
        """Genera labels legibles para cada comunidad basado en medios dominantes."""
        communities = {}
        for node_id, cid in partition.items():
            communities.setdefault(cid, []).append(node_id)
        
        labels = {}
        for cid, members in communities.items():
            # El miembro con mayor PageRank "da nombre" a la comunidad
            top_member = max(members, key=lambda n: G.nodes[n].get('pagerank_score', 0))
            top_name = G.nodes[top_member].get('name', 'Desconocido')
            country = G.nodes[top_member].get('country_code', '')
            labels[cid] = f"Cluster · {top_name} ({country})"
        
        return labels
```

### 3.5 API Endpoints del Grafo

```python
# api/routes/graph.py (FastAPI)

from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter(prefix="/api/graph", tags=["graph"])

@router.get("/data")
async def get_graph_data(
    country: Optional[str] = Query(None, description="Filtrar por código de país: CO, MX, US"),
    min_pagerank: float = Query(0.0001, description="PageRank mínimo para incluir nodo"),
    days: int = Query(30, description="Ventana temporal en días"),
    locale: str = Query('es-CO'),
):
    """
    Retorna el grafo completo optimizado para react-force-graph.
    Los nodos son medios, los edges son vínculos ponderados.
    
    Respuesta optimizada: solo campos necesarios para la visualización
    para minimizar el payload (grafos grandes pueden ser pesados).
    """
    # Nodos (medios)
    nodes_query = supabase.from_('media_outlets').select(
        'id, name, domain, country_code, current_veritas_avg, alert_level, og_image_url'
    ).join('graph_metrics', 'media_outlets.id = graph_metrics.outlet_id')
    
    if country:
        nodes_query = nodes_query.eq('country_code', country)
    
    # Solo nodos con PageRank significativo (evita nodos aislados que ensucian el grafo)
    nodes_query = nodes_query.gte('graph_metrics.pagerank_score', min_pagerank)
    
    nodes_data = await nodes_query.execute()
    
    # Edges
    edges_query = supabase.from_('media_link_aggregates').select(
        'source_outlet_id, target_outlet_id, edge_weight, link_count, citation_count'
    ).gte('last_seen', datetime.now() - timedelta(days=days))
    
    edges_data = await edges_query.execute()
    
    # Formatear para react-force-graph
    nodes = [{
        'id': n['id'],
        'name': n['name'],
        'domain': n['domain'],
        'country': n['country_code'],
        'veritasScore': n['current_veritas_avg'] or 50,
        'alertLevel': n['alert_level'] or 'green',
        'pagerank': n.get('pagerank_score', 0),
        'inDegree': n.get('in_degree', 0),
        'community': n.get('community_id'),
        'communityLabel': n.get('community_label'),
        'echoChamberScore': n.get('echo_chamber_score', 0),
        'launderingFlag': n.get('source_laundering_flag', False),
        'coordinatedFlag': n.get('coordinated_network_flag', False),
        'logoUrl': f"https://www.google.com/s2/favicons?domain={n['domain']}&sz=64",
    } for n in nodes_data.data]
    
    links = [{
        'source': e['source_outlet_id'],
        'target': e['target_outlet_id'],
        'value': e['edge_weight'],
        'linkCount': e['link_count'],
        'citationCount': e['citation_count'],
    } for e in edges_data.data]
    
    return {
        'nodes': nodes,
        'links': links,
        'metadata': {
            'total_nodes': len(nodes),
            'total_edges': len(links),
            'window_days': days,
            'generated_at': datetime.now().isoformat(),
        }
    }

@router.get("/outlet/{outlet_id}")
async def get_outlet_detail(outlet_id: str):
    """
    Detalle de un medio específico: sus vecinos directos,
    narrativas que propagó, métricas completas.
    """
    # ... (retorna el subgrafo ego del nodo seleccionado)

@router.get("/narrative/{narrative_hash}")
async def get_narrative_propagation(narrative_hash: str):
    """
    Muestra la cadena de propagación de una narrativa específica:
    quién fue el paciente cero y cómo se diseminó.
    """
    # ...
```

### 3.6 La Página `/grafo` — Visualización Interactiva

**Es su propia página separada:** `app/[locale]/grafo/page.tsx`

La decisión de tenerla en ruta propia (no un modal ni un tab) es deliberada:
- El grafo requiere mucho espacio — pantalla completa sin competir con el feed de noticias
- Los links directos (`/grafo?outlet=semana.com`) permiten compartir vistas específicas
- La carga de la librería `react-force-graph` (pesada, usa WebGL) es lazy y solo ocurre cuando el usuario navega a `/grafo`

```tsx
// app/[locale]/grafo/page.tsx

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { GraphSkeleton } from '@/components/graph/GraphSkeleton'
import { GraphControls } from '@/components/graph/GraphControls'
import { OutletDetailPanel } from '@/components/graph/OutletDetailPanel'
import { GraphLegend } from '@/components/graph/GraphLegend'

// CRÍTICO: Carga dinámica sin SSR
// react-force-graph usa WebGL — requiere browser APIs, no funciona en el servidor
const MediaGraph = dynamic(
  () => import('@/components/graph/MediaGraph'),
  { 
    ssr: false,
    loading: () => <GraphSkeleton />
  }
)

export default function GrafoPage({
  searchParams
}: {
  searchParams: { country?: string; outlet?: string; days?: string }
}) {
  return (
    <div className="grafo-page">
      {/* Header */}
      <header className="grafo-header">
        <h1>Red de Conexiones Mediáticas</h1>
        <p className="grafo-subtitle">
          Cada punto es un medio. Cada línea es una cita o referencia.
          El tamaño del nodo representa autoridad en la red.
        </p>
      </header>
      
      {/* Controles: Filtros de país, período, tipo de métrica */}
      <GraphControls
        defaultCountry={searchParams.country}
        defaultDays={parseInt(searchParams.days || '30')}
      />
      
      {/* Visualización principal — pantalla completa */}
      <div className="graph-canvas-wrapper">
        <Suspense fallback={<GraphSkeleton />}>
          <MediaGraph
            selectedOutlet={searchParams.outlet}
          />
        </Suspense>
        
        {/* Leyenda superpuesta */}
        <GraphLegend />
      </div>
      
      {/* Panel lateral deslizante — aparece al seleccionar un nodo */}
      <OutletDetailPanel />
    </div>
  )
}
```

```tsx
// components/graph/MediaGraph.tsx
// El corazón de la visualización — solo se renderiza en cliente

'use client'
import { useCallback, useRef, useState, useEffect } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { useGraphData } from '@/hooks/useGraphData'
import { useGraphStore } from '@/stores/graphStore'
import type { GraphNode, GraphLink } from '@/types/graph'

// Paleta de colores por nivel de alerta
const ALERT_COLORS = {
  green:  '#10b981',  // Confiable
  yellow: '#f59e0b',  // Sesgo leve
  orange: '#f97316',  // Manipulación frecuente
  red:    '#ef4444',  // Propaganda activa
}

// Tamaño de nodo proporcional al PageRank
const nodeSize = (node: GraphNode) => {
  const base = 4
  const maxExtra = 20
  return base + (node.pagerank * maxExtra * 10000)  // PageRank es muy pequeño
}

export default function MediaGraph({ selectedOutlet }: { selectedOutlet?: string }) {
  const graphRef = useRef<any>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  
  const { data, isLoading } = useGraphData()
  const { setSelectedNode, highlightedNodes, highlightedLinks } = useGraphStore()
  
  // Responsive: detectar tamaño del contenedor
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])
  
  // Si llega un outlet pre-seleccionado por URL param, hacer zoom y seleccionar
  useEffect(() => {
    if (!selectedOutlet || !data || !graphRef.current) return
    const node = data.nodes.find(n => n.domain === selectedOutlet)
    if (node) {
      graphRef.current.centerAt(node.x, node.y, 1000)
      graphRef.current.zoom(4, 1000)
      setSelectedNode(node)
    }
  }, [selectedOutlet, data])
  
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node)
    // Zoom suave hacia el nodo seleccionado
    graphRef.current?.centerAt(node.x, node.y, 600)
    graphRef.current?.zoom(3.5, 600)
  }, [setSelectedNode])
  
  const handleNodeHover = useCallback((node: GraphNode | null) => {
    // Highlight de vecinos directos al hover
    if (node) {
      const neighbors = new Set<string>()
      const connectedLinks = new Set<GraphLink>()
      data?.links.forEach(link => {
        if (link.source === node.id || link.target === node.id) {
          neighbors.add(link.source as string)
          neighbors.add(link.target as string)
          connectedLinks.add(link)
        }
      })
      useGraphStore.getState().setHighlight(neighbors, connectedLinks)
    } else {
      useGraphStore.getState().clearHighlight()
    }
  }, [data])
  
  if (isLoading) return <GraphSkeleton />
  if (!data) return null
  
  return (
    <div ref={containerRef} className="graph-canvas">
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        
        // Configuración de física del grafo
        d3AlphaDecay={0.02}          // Menos movimiento, más estable
        d3VelocityDecay={0.3}
        cooldownTime={3000}           // Estabilizar en 3 segundos
        
        // Renderizado de nodos
        nodeRelSize={1}
        nodeVal={nodeSize}
        nodeColor={(node: GraphNode) => {
          if (highlightedNodes.size > 0 && !highlightedNodes.has(node.id)) {
            return 'rgba(255,255,255,0.08)'  // Nodos no destacados: casi invisibles
          }
          return ALERT_COLORS[node.alertLevel as keyof typeof ALERT_COLORS] || '#6b7280'
        }}
        nodeCanvasObject={(node: GraphNode, ctx, globalScale) => {
          // Renderizado custom: nodo con borde + texto debajo si zoom > 2
          const size = nodeSize(node)
          const color = ALERT_COLORS[node.alertLevel as keyof typeof ALERT_COLORS] || '#6b7280'
          const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(node.id)
          const alpha = isHighlighted ? 1 : 0.12
          
          ctx.save()
          ctx.globalAlpha = alpha
          
          // Círculo del nodo
          ctx.beginPath()
          ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI)
          ctx.fillStyle = color
          ctx.fill()
          
          // Borde blanco para nodos con flags de anomalía
          if (node.launderingFlag || node.coordinatedFlag) {
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 1.5
            ctx.setLineDash([3, 2])
            ctx.stroke()
            ctx.setLineDash([])
          }
          
          // Label: solo visible cuando el zoom es suficiente
          if (globalScale >= 2) {
            const label = node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name
            ctx.font = `${Math.min(14, 10 / globalScale * 4)}px "DM Sans", sans-serif`
            ctx.textAlign = 'center'
            ctx.fillStyle = '#ffffff'
            ctx.fillText(label, node.x!, node.y! + size + 8)
          }
          
          ctx.restore()
        }}
        
        // Renderizado de edges
        linkWidth={(link: GraphLink) => {
          if (highlightedLinks.size > 0 && !highlightedLinks.has(link)) return 0.2
          return Math.min(6, 0.5 + Math.log(link.value + 1) * 0.8)
        }}
        linkColor={(link: GraphLink) => {
          if (highlightedLinks.size > 0 && !highlightedLinks.has(link)) {
            return 'rgba(255,255,255,0.04)'
          }
          return 'rgba(255,255,255,0.25)'
        }}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={(link: GraphLink) => {
          // Partículas animadas proporcionales al peso del edge
          if (link.value > 5) return 3
          if (link.value > 2) return 1
          return 0
        }}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleColor={() => 'rgba(99,179,237,0.8)'}
        
        // Interacciones
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        
        // Fondo: el grafo flota sobre el dark background de la app
        backgroundColor="transparent"
      />
    </div>
  )
}
```

### 3.7 Panel Lateral de Detalle de Nodo

Cuando el usuario toca/clica un nodo, aparece un panel deslizante con:

```tsx
// components/graph/OutletDetailPanel.tsx

'use client'
import { useGraphStore } from '@/stores/graphStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, TrendingUp, Network } from 'lucide-react'

export function OutletDetailPanel() {
  const { selectedNode, setSelectedNode } = useGraphStore()
  
  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.aside
          className="outlet-detail-panel"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Header del panel */}
          <div className="panel-header">
            <img
              src={`https://www.google.com/s2/favicons?domain=${selectedNode.domain}&sz=48`}
              alt={selectedNode.name}
              width={32}
              height={32}
            />
            <div>
              <h3>{selectedNode.name}</h3>
              <a href={`https://${selectedNode.domain}`} target="_blank" rel="noopener noreferrer">
                {selectedNode.domain}
              </a>
            </div>
            <button onClick={() => setSelectedNode(null)} aria-label="Cerrar">✕</button>
          </div>
          
          {/* VeritasScore */}
          <div className="metric-card score-card" data-level={selectedNode.alertLevel}>
            <span className="metric-label">VeritasScore Promedio</span>
            <span className="metric-value">{Math.round(selectedNode.veritasScore)}</span>
          </div>
          
          {/* Métricas de red */}
          <div className="metrics-grid">
            <div className="metric-card">
              <TrendingUp size={16} />
              <span className="metric-label">Autoridad (PageRank)</span>
              <span className="metric-value">
                {(selectedNode.pagerank * 10000).toFixed(2)}
              </span>
            </div>
            <div className="metric-card">
              <Network size={16} />
              <span className="metric-label">Medios que lo citan</span>
              <span className="metric-value">{selectedNode.inDegree}</span>
            </div>
          </div>
          
          {/* Cámara de eco */}
          <div className="echo-chamber-bar">
            <span>Diversidad de fuentes</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(1 - selectedNode.echoChamberScore) * 100}%`,
                  background: selectedNode.echoChamberScore > 0.7 ? '#ef4444' : '#10b981'
                }}
              />
            </div>
            <span className="bar-label">
              {selectedNode.echoChamberScore > 0.7
                ? '⚠️ Cámara de eco'
                : selectedNode.echoChamberScore > 0.4
                ? '⚡ Sesgo moderado'
                : '✅ Diverso'}
            </span>
          </div>
          
          {/* Flags de anomalía */}
          {(selectedNode.launderingFlag || selectedNode.coordinatedFlag) && (
            <div className="anomaly-flags">
              <AlertTriangle size={16} color="#f97316" />
              <span>Patrones anómalos detectados:</span>
              {selectedNode.launderingFlag && (
                <span className="flag">Source Laundering</span>
              )}
              {selectedNode.coordinatedFlag && (
                <span className="flag">Red Coordinada</span>
              )}
            </div>
          )}
          
          {/* Comunidad */}
          <div className="community-badge">
            <span>Comunidad detectada:</span>
            <strong>{selectedNode.communityLabel}</strong>
          </div>
          
          {/* CTA: Ver artículos de este medio */}
          <a
            href={`/noticias?outlet=${selectedNode.domain}`}
            className="btn-secondary"
          >
            Ver artículos analizados →
          </a>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
```

---

## Fase 4: Dependencias, Tests y Deployment

### 4.1 Nuevas Dependencias

```bash
# Backend (Python)
pip install --break-system-packages \
  python-louvain \       # Detección de comunidades Louvain
  networkx \             # Análisis de grafos
  tldextract \           # Extracción de dominios
  blurhash-python \      # Generación de blurhash
  colorthief \           # Color dominante de imágenes
  Pillow \               # Procesamiento de imágenes

# Frontend (Node.js)
npm install \
  react-force-graph-2d \ # Visualización del grafo (WebGL)
  blurhash \             # Decodificación de blurhash en browser
  next-intl \            # Internacionalización
  framer-motion \        # Animaciones del panel lateral
  zustand \              # Estado global del grafo
```

### 4.2 Configuración de Tareas Programadas

```python
# celery_config.py (Celery Beat para cron jobs)

from celery.schedules import crontab

CELERYBEAT_SCHEDULE = {
    # Análisis del grafo: cada noche a las 2am UTC
    'graph-analytics-nightly': {
        'task': 'jobs.graph_analytics.run_full_analysis',
        'schedule': crontab(hour=2, minute=0),
    },
    # Refresh de la vista materializada: cada hora
    'refresh-link-aggregates': {
        'task': 'jobs.graph_analytics.refresh_aggregates',
        'schedule': crontab(minute=0),
    },
    # Trace narrative propagation: cada 6 horas
    'trace-narratives': {
        'task': 'jobs.graph_analytics.trace_narrative_origins',
        'schedule': crontab(hour='*/6', minute=30),
    },
}
```

### 4.3 Tests Críticos

```python
# tests/test_link_extractor.py

def test_extracts_og_image():
    """Verifica que el extractor captura og:image correctamente."""
    
def test_skips_tracking_links():
    """Verifica que los links de Google Analytics etc. no se incluyen."""
    
def test_detects_citation_context():
    """Verifica que 'según El Tiempo...' marca el link como cita."""
    
def test_handles_missing_image_gracefully():
    """Verifica que artículos sin imagen retornan None, no error."""

# tests/test_graph_analytics.py

def test_pagerank_orders_nodes_correctly():
    """El medio más citado debe tener mayor PageRank."""
    
def test_echo_chamber_pure_cluster():
    """Un grupo que solo se cita entre sí debe tener echo_score = 1.0"""
    
def test_anomaly_detection_laundering():
    """Un nodo con 50 in-links pero PageRank < 0.001 debe flaggearse."""
```

### 4.4 Resumen de Costo Operativo

| Componente | Costo Mensual |
|------------|---------------|
| Procesamiento de imágenes (Python local) | $0 |
| Proxy y optimización de imágenes (Vercel Edge) | $0 (free tier OSS) |
| Extracción de links (dentro del pipeline existente) | $0 |
| NetworkX + Louvain (cron nightly en Railway) | Dentro del $10-20 existente |
| react-force-graph (WebGL en cliente) | $0 |
| Detección de país (Cloudflare CF-IPCountry header) | $0 (free tier) |
| next-intl (i18n strings) | $0 |
| **Incremento total al costo base** | **$0 adicionales** |

---

## Resumen Visual: Arquitectura de las 3 Funcionalidades

```
┌─────────────────────────────────────────────────────────────┐
│                   PIPELINE DE INGESTA (existente)           │
│                           │                                  │
│              ┌────────────┼────────────┐                    │
│              ▼            ▼            ▼                    │
│         IMÁGENES       LINKS         TEXTO                  │
│         og:image       externos      artículo               │
│         blurhash       extracción    análisis IA            │
│         color dom.     forense       (existente)            │
│              │            │                                  │
│              ▼            ▼                                  │
│         articles       media_links                          │
│         (nuevas cols)  (nueva tabla)                        │
│                            │                                │
│                     CRON JOB NIGHTLY                        │
│                     NetworkX + Louvain                      │
│                     PageRank · Comunidades                  │
│                     Anomalías                               │
│                            │                                │
│                     graph_metrics                           │
│                     (nueva tabla)                           │
└─────────────────────────────────────────────────────────────┘

FRONTEND:
┌────────────┐  ┌──────────────────┐  ┌─────────────────────┐
│  /         │  │  /article/[id]   │  │  /grafo             │
│  Feed      │  │  Artículo        │  │  Red interactiva    │
│            │  │                  │  │                     │
│  Imágenes  │  │  Panel de        │  │  react-force-graph  │
│  reales    │  │  análisis        │  │  Nodos = medios     │
│  blur-up   │  │  (existente)     │  │  Edges = citas      │
│            │  │                  │  │  Panel lateral      │
│  Locale    │  │  Locale en IA    │  │  Filtros            │
│  en UI     │  │  system prompt   │  │                     │
└────────────┘  └──────────────────┘  └─────────────────────┘
```

---

*Plan de Implementación Senior — VeritasAI*  
*Módulos: Imágenes · Localización · Grafo de Conexiones*  
*Incremento de costo operativo: $0*  
*Versión 1.0 · Abril 2026*
