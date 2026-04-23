# Plan de Rediseño UX/UI: VeritasAI → Editorial Intelligence
### De "dashboard de IA" a "newsroom de referencia"

> **Documento:** Plan de Implementación de Diseño Senior  
> **Referencia visual:** Perplexity Discover / Perplexity News  
> **Dirección estética:** Editorial Intelligence — periodismo de referencia con análisis forense  
> **Stack:** Next.js 15 · Tailwind CSS v4 · Framer Motion · Open-Meteo API

---

## 1. Diagnóstico: Qué está mal y por qué

Antes de diseñar soluciones, hay que nombrar los problemas con precisión quirúrgica:

| Problema actual | Por qué daña el producto |
|-----------------|--------------------------|
| Tags de colores múltiples (naranja, teal, púrpura) simultáneos | Compiten por atención, crean jerarquía visual rota — el ojo no sabe qué leer primero |
| Emojis en categorías (🌍 Todo, 🏛 Política) | Señal inmediata de bajo esfuerzo — los productos serios no usan emojis en navegación |
| "VERSIÓN NEUTRALIZADA" en teal brillante | Grita. Un insight valioso presentado como etiqueta de supermercado pierde autoridad |
| Score en burbuja de color rojo prominente | La manipulación del score visual compite con la noticia misma |
| Cards con bordes visibles + fondo ligeramente diferente | Patrón de "dashboard" — lo opuesto a editorial |
| Categorías como pills horizontales scrollables con emoji | UI de app de delivery, no de newsroom de referencia |
| Múltiples colores de acento sin jerarquía clara | Sin color dominante = sin identidad = sin memorabilidad |
| Layout de 2 columnas simétricas | Perplexity, The Guardian, NYT usan asimetría editorial — informa sobre jerarquía de historias |

**El problema raíz:** VeritasAI está diseñado como una herramienta de análisis (dashboard), cuando debería ser un medio de comunicación que también analiza.

---

## 2. Dirección Estética: Editorial Intelligence

**El concepto:** Una redacción del futuro. Como si The Economist construyera un detector de propaganda.

**Los tres adjetivos que deben describir cada decisión de diseño:**
1. **Sobrio** — sin color innecesario, sin ruido visual, sin elementos decorativos sin función
2. **Autorizado** — tipografía editorial, jerarquías claras, densidad informativa calibrada
3. **Preciso** — cuando aparece color, tiene significado exacto; cuando aparece un número, es porque importa

**La pregunta de filtro para cada elemento:** *"¿Esto informa o solo decora?"* Si solo decora, eliminarlo.

---

## 3. Sistema Tipográfico

### 3.1 La Elección: Newsreader + Figtree

Después de evaluar 40+ Google Fonts gratuitas, esta combinación es la correcta para VeritasAI:

**Display / Headlines: Newsreader**
- URL: `https://fonts.google.com/specimen/Newsreader`
- Diseñada específicamente para consumo de noticias en pantalla
- Tiene serif con personalidad propia — no genérica, no corporativa
- La variante Italic es excepcionalmente elegante para subheadings
- Weights disponibles: 300, 400, 500, 600, 700
- Optical sizing: los titulares grandes se ven diferentes a los pequeños — exactamente como impresión editorial

**UI / Body / Metadata: Figtree**
- URL: `https://fonts.google.com/specimen/Figtree`
- Geométrica con personalidad. No es Inter, no es Roboto, no es genérica
- Excelente legibilidad en tamaños pequeños (timestamps, metadata)
- Tiene personalidad en las mayúsculas — ligeramente condensada, muy profesional
- Weights: 300, 400, 500, 600, 700, 800

**Por qué NO usar las alternativas obvias:**
- DM Sans / DM Serif: muy usadas ahora, pierden distinctividad
- Playfair Display: demasiado ornamental, poco funcional en UI
- Inter: el "Arial" de los productos de IA en 2024-2025
- Space Grotesk: sobreusada en proyectos de crypto/tech/IA

### 3.2 Escala Tipográfica Completa

```css
/* 
  Sistema tipográfico VeritasAI
  Base: 16px / Line height: 1.5
  Escala: Minor Third (1.25x)
*/

:root {
  /* Familias */
  --font-display: 'Newsreader', Georgia, serif;
  --font-ui:      'Figtree', system-ui, sans-serif;
  
  /* Tamaños — escala editorial */
  --text-xs:   0.75rem;    /* 12px — timestamps, labels */
  --text-sm:   0.875rem;   /* 14px — metadata, captions */
  --text-base: 1rem;       /* 16px — body text */
  --text-lg:   1.125rem;   /* 18px — lead text */
  --text-xl:   1.25rem;    /* 20px — card headlines pequeños */
  --text-2xl:  1.5rem;     /* 24px — card headlines medianos */
  --text-3xl:  1.875rem;   /* 30px — featured article headline */
  --text-4xl:  2.25rem;    /* 36px — hero headline */
  --text-5xl:  3rem;       /* 48px — breakout headlines */
  
  /* Line heights */
  --leading-tight:   1.2;   /* Headlines grandes */
  --leading-snug:    1.35;  /* Headlines medianos */
  --leading-normal:  1.5;   /* Body text */
  --leading-relaxed: 1.65;  /* Long-form reading */
  
  /* Letter spacing */
  --tracking-tight:  -0.025em;  /* Headlines display */
  --tracking-normal:  0;
  --tracking-wide:    0.05em;   /* Labels, categories uppercase */
  --tracking-widest:  0.12em;   /* Micro-labels, badges */
}
```

### 3.3 Reglas de Uso Estrictas

```
Newsreader → Headlines de artículos (todos los tamaños)
             Subtítulos de secciones
             Pull quotes
             Nada más

Figtree    → Todo lo demás: navegación, labels, timestamps,
             botones, metadata, sidebar, scores, badges
```

---

## 4. Sistema de Color

### 4.1 La Filosofía del Color Mínimo

**Regla de oro:** El color en VeritasAI tiene un solo trabajo: comunicar urgencia epistémica. No decorar. No "hacer bonito". Cuando el usuario ve color, debe significar algo.

**Paleta de 8 colores. Solo 8. Ni uno más.**

```css
:root {
  /* ═══════════════════════════════════════
     FONDOS Y SUPERFICIES
     Progresión de oscuro a levemente más claro
     ═══════════════════════════════════════ */
  --color-bg:          #08090b;  /* Fondo de página — casi negro, tono frío */
  --color-surface-1:   #0f1013;  /* Cards, sidebar */
  --color-surface-2:   #161820;  /* Hover states */
  --color-border:      #1e2028;  /* Separadores, bordes sutiles */
  --color-border-soft: #14151a;  /* Bordes casi invisibles */
  
  /* ═══════════════════════════════════════
     TIPOGRAFÍA
     Jerarquía en 3 niveles, todos legibles
     ═══════════════════════════════════════ */
  --color-text-primary:   #eeeef0;  /* Titulares, texto principal */
  --color-text-secondary: #7c808c;  /* Timestamps, fuente, metadata */
  --color-text-tertiary:  #3d4048;  /* Elementos desactivados, dividers con texto */
  
  /* ═══════════════════════════════════════
     EL ÚNICO ACENTO
     Ámbar frío — ni cálido ni agresivo.
     Autoridad, no alarma.
     ═══════════════════════════════════════ */
  --color-accent:       #d4a843;  /* Links activos, elementos destacados */
  --color-accent-dim:   #d4a84320; /* Fondos de acento (badges) */
  
  /* ═══════════════════════════════════════
     SEMÁFORO DE VERITASSCORE
     Exactamente 3 estados. No más gradaciones.
     ═══════════════════════════════════════ */
  --score-low:    #4a5568;  /* 0-40: gris azulado — sin alarma */
  --score-medium: #9b7c2e;  /* 41-65: ámbar oscuro — precaución */
  --score-high:   #8b2828;  /* 66-100: rojo oscuro — alerta real */
  
  /* Texto sobre cada score */
  --score-low-text:    #94a3b8;
  --score-medium-text: #d4a843;
  --score-high-text:   #f87171;
}
```

**Tabla de decisión de color:**

| Elemento | Color correcto | Por qué |
|----------|---------------|---------|
| Score 0-40 | Gris (#4a5568) | No alarmar innecesariamente |
| Score 41-65 | Ámbar oscuro (#9b7c2e) | Señal de precaución sin gritar |
| Score 66-100 | Rojo oscuro (#8b2828) | Alerta real, pero no neón |
| Link activo / tab seleccionado | Ámbar (#d4a843) | El único acento |
| Técnicas de manipulación | Solo texto, sin fondo de color | Las técnicas se leen, no se ven |
| "Versión neutralizada" | Gris secundario, sin color | Es información, no celebración |
| Trending badge | Texto ámbar, sin fondo | Funcional, no decorativo |

### 4.2 Lo que se elimina completamente

```
ELIMINADO: teal (#00d9b8 o similares) → en ningún lugar
ELIMINADO: púrpura (#8b5cf6 o similares) → en ningún lugar
ELIMINADO: verde brillante (#10b981 en badges) → solo en score si corresponde
ELIMINADO: gradientes de colores en botones o cards → todo plano
ELIMINADO: fondos coloreados en tags de técnicas de manipulación
ELIMINADO: múltiples colores en la misma línea de metadata
```

---

## 5. Sistema de Layout

### 5.1 La Grid Principal

El patrón de Perplexity Discover es una **grid asimétrica editorial**:

```
DESKTOP (≥1280px):
┌──────────────────────────────────┬──────────────┐
│                                  │              │
│  COLUMNA PRINCIPAL               │   SIDEBAR    │
│  ~65% del ancho (≈840px)         │   ~32% (~410px)│
│                                  │              │
│  Artículo featured               │  · Clima     │
│  ──────────────────────────      │  · Mercados  │
│  Grid 2 columnas                 │  · Trending  │
│  ──────────────────────────      │  · Más leído │
│  Grid 3 columnas                 │              │
│                                  │  (sticky)    │
└──────────────────────────────────┴──────────────┘

TABLET (768px - 1279px):
│  Columna principal 100%  │
│  Sidebar colapsa abajo   │

MOBILE (<768px):
│  Single column           │
│  Sidebar completamente   │
│  oculto                  │
```

### 5.2 Patrones de Layout del Feed

Siguiendo el patrón editorial de Perplexity, el feed alterna 4 patrones:

**Patrón A — Hero (primera noticia del día):**
```
┌─────────────────────────────────────┐
│  IMAGEN GRANDE (aspect 16:9)        │
│                                     │
│  Medio · timestamp          views   │
│  TITULAR GRANDE (Newsreader 36px)   │
│  Subtítulo o extracto               │
│  Técnicas: 2 palabras · tag·texto   │
└─────────────────────────────────────┘
```

**Patrón B — Editorial (horizontal, imagen derecha):**
```
┌──────────────────────────┬──────────┐
│  Medio · timestamp       │          │
│                          │  IMAGEN  │
│  TITULAR (Newsreader 28px│  (cuadrada│
│  puede tener 2-3 líneas) │  o 4:3)  │
│                          │          │
│  Extracto breve          │          │
└──────────────────────────┴──────────┘
```

**Patrón C — Grid 3 columnas (noticias secundarias):**
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ IMAGEN   │ │ IMAGEN   │ │ IMAGEN   │
│ (16:9)   │ │ (16:9)   │ │ (16:9)   │
│          │ │          │ │          │
│ Titular  │ │ Titular  │ │ Titular  │
│ 2 líneas │ │ 2 líneas │ │ 2 líneas │
│          │ │          │ │          │
│ Medio·ts │ │ Medio·ts │ │ Medio·ts │
└──────────┘ └──────────┘ └──────────┘
```

**Patrón D — Lista densa (más artículos / sección trending):**
```
┌─────────────────────────────────────┐
│  Medio · timestamp          score   │
│  Titular en una línea               │
├─────────────────────────────────────┤
│  Medio · timestamp          score   │
│  Titular en una línea               │
├─────────────────────────────────────┤
```

### 5.3 Espaciado Consistente

```css
:root {
  /* Sistema de 8pt */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* Radios de borde — minimalistas */
  --radius-sm:  4px;
  --radius-md:  6px;
  --radius-lg:  8px;
  --radius-xl: 12px;
  
  /* Máximo ancho del contenedor */
  --max-width: 1440px;
}
```

---

## 6. Rediseño Componente por Componente

### 6.1 Navegación Superior

**Antes:** Logo + nav + search + selector de país + controles  
**Después:** Comprimido, periodístico, sin peso visual

```tsx
// components/Nav/TopNav.tsx

export function TopNav() {
  return (
    <nav className="top-nav">
      {/* Izquierda: logo + navegación principal */}
      <div className="nav-left">
        <a href="/" className="nav-logo">
          {/* Logo tipográfico: "Veritas" en Newsreader + "AI" en Figtree small */}
          <span className="logo-veritas">Veritas</span>
          <span className="logo-ai">AI</span>
          <span className="logo-beta">BETA</span>
        </a>
        
        {/* Separador vertical sutil */}
        <div className="nav-divider" aria-hidden />
        
        <a href="/dashboard" className="nav-link">Dashboard de Medios</a>
        <a href="/grafo"     className="nav-link">Grafo de Conexiones</a>
      </div>
      
      {/* Centro: búsqueda */}
      <div className="nav-center">
        <SearchBar />
      </div>
      
      {/* Derecha: país + preferencias */}
      <div className="nav-right">
        <LocaleSwitcher />
        <button className="nav-icon-btn" aria-label="Preferencias">
          <SlidersIcon size={16} />
        </button>
      </div>
    </nav>
  )
}
```

```css
.top-nav {
  display: flex;
  align-items: center;
  height: 52px;                     /* Compacto — Perplexity usa ~52px */
  padding: 0 var(--space-6);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  background: rgba(8, 9, 11, 0.92);
}

.nav-logo {
  display: flex;
  align-items: baseline;
  gap: 3px;
  text-decoration: none;
}

.logo-veritas {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.logo-ai {
  font-family: var(--font-ui);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-accent);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.logo-beta {
  font-family: var(--font-ui);
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 5px;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  margin-left: 4px;
}

.nav-divider {
  width: 1px;
  height: 16px;
  background: var(--color-border);
  margin: 0 var(--space-4);
}

.nav-link {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;
  white-space: nowrap;
}

.nav-link:hover { color: var(--color-text-primary); }
.nav-link.active { color: var(--color-text-primary); }
```

### 6.2 Filtros de Categorías (sin emojis)

**El problema del diseño actual:** Las pills con emojis son infantilizantes y compiten visualmente con todo lo demás.

**La solución:** Texto limpio en Figtree, sin decoración, con un indicador de activo mínimo.

```tsx
// components/Feed/CategoryFilter.tsx

// Sin emojis. Nombres concisos. Solo texto.
const CATEGORIES = [
  { id: 'all',           label: 'Todo' },
  { id: 'politics',      label: 'Política' },
  { id: 'economy',       label: 'Economía' },
  { id: 'technology',    label: 'Tecnología' },
  { id: 'science',       label: 'Ciencia' },
  { id: 'health',        label: 'Salud' },
  { id: 'environment',   label: 'Medio Ambiente' },
  { id: 'culture',       label: 'Cultura' },
  { id: 'sports',        label: 'Deportes' },
  { id: 'security',      label: 'Seguridad' },
  { id: 'international', label: 'Internacional' },
]

export function CategoryFilter({ active, onChange }) {
  return (
    <div className="category-filter">
      <nav className="category-nav" role="navigation" aria-label="Categorías">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${active === cat.id ? 'active' : ''}`}
            onClick={() => onChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
```

```css
.category-filter {
  border-bottom: 1px solid var(--color-border);
  padding: 0 var(--space-6);
  margin-bottom: var(--space-6);
}

.category-nav {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.category-btn {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-3) var(--space-4);
  white-space: nowrap;
  position: relative;
  transition: color 0.15s ease;
  letter-spacing: 0.01em;
}

.category-btn:hover {
  color: var(--color-text-primary);
}

/* El indicador activo es una línea debajo, no un fondo */
.category-btn.active {
  color: var(--color-text-primary);
  font-weight: 500;
}

.category-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;       /* Sobre el border-bottom del nav */
  left: var(--space-4);
  right: var(--space-4);
  height: 1px;
  background: var(--color-accent);  /* La única línea de color */
}
```

### 6.3 Cards de Artículos — Los 4 Patrones

**Principio:** Las cards no tienen borde visible. La separación es espacio, no líneas.

```tsx
// components/ArticleCard/HeroCard.tsx — Patrón A

export function HeroCard({ article }: { article: Article }) {
  return (
    <article className="hero-card">
      {/* Imagen principal */}
      <div className="hero-image-wrapper">
        <ArticleImage
          src={article.ogImageUrl}
          alt={article.title}
          blurhash={article.ogImageBlurhash}
          dominantColor={article.ogImageColor}
        />
        {/* Badge trending — solo si aplica, sin emoji */}
        {article.isTrending && (
          <span className="trending-badge">Tendencia</span>
        )}
      </div>
      
      {/* Metadatos: nombre del medio + favicon + tiempo + vistas */}
      <ArticleMeta outlet={article.outlet} publishedAt={article.publishedAt} views={article.views} />
      
      {/* Titular */}
      <h2 className="hero-title">{article.title}</h2>
      
      {/* Versión neutralizada — solo si difiere significativamente */}
      {article.neutralizedTitle && article.neutralizedTitle !== article.title && (
        <div className="neutralized-section">
          <span className="neutralized-label">Versión neutral</span>
          <p className="neutralized-text">{article.neutralizedTitle}</p>
        </div>
      )}
      
      {/* Técnicas detectadas — texto, sin fondo de color */}
      {article.techniques?.length > 0 && (
        <div className="techniques-row">
          {article.techniques.slice(0, 3).map(t => (
            <span key={t.id} className="technique-tag">
              {t.name}
            </span>
          ))}
        </div>
      )}
      
      {/* Footer de la card */}
      <div className="card-footer">
        <button className="btn-ghost">Ver más</button>
        <button className="btn-primary-subtle">
          <CircleIcon size={14} />
          Análisis completo
        </button>
        <a href={article.url} target="_blank" rel="noopener" className="btn-icon">
          <ExternalLinkIcon size={14} />
        </a>
      </div>
    </article>
  )
}
```

```tsx
// components/ArticleCard/ArticleMeta.tsx
// El componente de metadata — compartido por todos los tipos de card

export function ArticleMeta({ outlet, publishedAt, views, score }) {
  return (
    <div className="article-meta">
      {/* Favicon + nombre del medio */}
      <div className="meta-outlet">
        <img
          src={`https://www.google.com/s2/favicons?domain=${outlet.domain}&sz=32`}
          alt=""
          width={14}
          height={14}
          className="outlet-favicon"
        />
        <span className="outlet-name">{outlet.name}</span>
      </div>
      
      {/* Separador minimalista */}
      <span className="meta-dot" aria-hidden>·</span>
      
      {/* Tiempo relativo */}
      <time className="meta-time" dateTime={publishedAt}>
        {formatRelativeTime(publishedAt)}
      </time>
      
      {/* Vistas — solo si > 1000 */}
      {views > 1000 && (
        <>
          <span className="meta-dot" aria-hidden>·</span>
          <span className="meta-views">{formatViews(views)}</span>
        </>
      )}
      
      {/* VeritasScore — pequeño, al final, no protagonista */}
      {score !== undefined && (
        <VeritasScoreBadge score={score} variant="inline" />
      )}
    </div>
  )
}
```

```tsx
// components/VeritasScore/VeritasScoreBadge.tsx
// Rediseño completo del badge del score

interface Props {
  score: number
  variant: 'inline' | 'card-corner' | 'detail'
}

function getScoreLevel(score: number): 'low' | 'medium' | 'high' {
  if (score <= 40) return 'low'
  if (score <= 65) return 'medium'
  return 'high'
}

export function VeritasScoreBadge({ score, variant = 'inline' }: Props) {
  const level = getScoreLevel(score)
  
  // En variant "inline": solo el número, sin burbuja prominente
  // En variant "card-corner": posición absoluta, pequeño
  // En variant "detail": más grande, con label
  
  return (
    <span
      className={`veritas-score score-${level} score-${variant}`}
      title={`VeritasScore: ${score}/100`}
      aria-label={`Índice de manipulación: ${score} de 100`}
    >
      {variant === 'detail' && <span className="score-label">Score</span>}
      <span className="score-value">{score}</span>
    </span>
  )
}
```

```css
/* ─────────────────────────────────────────
   HERO CARD
   ───────────────────────────────────────── */
.hero-card {
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-8);
  border-bottom: 1px solid var(--color-border);
}

.hero-image-wrapper {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
  background: var(--color-surface-1);
}

.trending-badge {
  position: absolute;
  bottom: var(--space-3);
  left: var(--space-3);
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-accent);
  background: rgba(8, 9, 11, 0.85);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  /* Sin borde de color. Sin fondo de color. Solo texto ámbar. */
}

.hero-title {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 500;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text-primary);
  margin: var(--space-3) 0;
}

.hero-title:hover { cursor: pointer; }

/* ─────────────────────────────────────────
   VERSIÓN NEUTRALIZADA
   Antes: etiqueta teal gritona
   Ahora: label gris + texto en cursiva
   ───────────────────────────────────────── */
.neutralized-section {
  margin: var(--space-3) 0;
  padding-left: var(--space-4);
  border-left: 2px solid var(--color-border);
}

.neutralized-label {
  display: block;
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-1);
}

.neutralized-text {
  font-family: var(--font-display);
  font-style: italic;      /* La cursiva transmite "esto es una reinterpretación" */
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
  margin: 0;
}

/* ─────────────────────────────────────────
   TÉCNICAS DE MANIPULACIÓN
   Antes: pills de colores múltiples
   Ahora: texto simple, separado por ·
   ───────────────────────────────────────── */
.techniques-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: var(--space-3) 0;
}

.technique-tag {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  /* Sin fondo. Sin borde. Solo texto. */
  
  /* Separador visual entre técnicas */
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Un punto ámbar antes de cada técnica */
.technique-tag::before {
  content: '';
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-text-tertiary);
  flex-shrink: 0;
}

/* ─────────────────────────────────────────
   METADATA (compartido por todos los cards)
   ───────────────────────────────────────── */
.article-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.meta-outlet {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.outlet-favicon {
  border-radius: 2px;
  opacity: 0.8;
}

.outlet-name {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.meta-dot {
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.meta-time,
.meta-views {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

/* ─────────────────────────────────────────
   VERITASSCORE BADGE — Rediseñado
   ───────────────────────────────────────── */
.veritas-score {
  font-family: var(--font-ui);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--radius-sm);
  padding: 2px 6px;
}

/* Inline: al final de la metadata row, muy pequeño */
.veritas-score.score-inline {
  font-size: var(--text-xs);
  margin-left: auto;  /* Empuja a la derecha */
}

/* Card corner: posición absoluta sobre la imagen */
.veritas-score.score-card-corner {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  font-size: var(--text-sm);
  background: rgba(8, 9, 11, 0.85);
  backdrop-filter: blur(4px);
}

/* Low: solo gris — no hay urgencia */
.veritas-score.score-low {
  color: var(--score-low-text);
  background: transparent;
}

/* Medium: ámbar muy sutil */
.veritas-score.score-medium {
  color: var(--score-medium-text);
  background: rgba(212, 168, 67, 0.08);
}

/* High: rojo, pero no en burbuja gigante */
.veritas-score.score-high {
  color: var(--score-high-text);
  background: rgba(139, 40, 40, 0.12);
}

/* ─────────────────────────────────────────
   BOTONES
   ───────────────────────────────────────── */
.card-footer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.btn-ghost {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: color 0.15s, background 0.15s;
}
.btn-ghost:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-2);
}

/* El botón de análisis completo: más estructura, mismo tono */
.btn-primary-subtle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  cursor: pointer;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  transition: all 0.15s;
  flex: 1;
  justify-content: center;
}
.btn-primary-subtle:hover {
  background: var(--color-surface-2);
  color: var(--color-text-primary);
  border-color: var(--color-text-tertiary);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text-tertiary);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.15s;
  margin-left: auto;
}
.btn-icon:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-tertiary);
}
```

---

## 7. Sidebar Derecho: El Panel de Contexto

### 7.1 Estructura y APIs

El sidebar es sticky y contiene 5 módulos en orden:

```
1. Clima (Open-Meteo + ip-api para coordenadas)
2. Perspectiva de mercado (S&P 500, NASDAQ, BTC)
3. Empresas en tendencia
4. Lo más leído ahora
5. [Espacio para futuras expansiones]
```

### 7.2 Módulo de Clima — Open-Meteo

**Open-Meteo** es la elección correcta: completamente gratuita, sin API key, datos WMO precisos, actualización cada hora, cubre el mundo entero.

```typescript
// services/weather.ts

const WEATHER_CODES: Record<number, string> = {
  0:  'Despejado',
  1:  'Mayormente despejado',
  2:  'Parcialmente nublado',
  3:  'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna leve',
  53: 'Llovizna moderada',
  55: 'Llovizna intensa',
  61: 'Lluvia leve',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  71: 'Nieve leve',
  73: 'Nieve moderada',
  75: 'Nieve intensa',
  80: 'Chubascos leves',
  81: 'Chubascos moderados',
  82: 'Chubascos fuertes',
  95: 'Tormenta eléctrica',
  99: 'Tormenta con granizo',
}

export async function fetchWeather(lat: number, lon: number, locale: string) {
  const isCelsius = !['en-US'].includes(locale)
  const unit = isCelsius ? 'celsius' : 'fahrenheit'
  const unitLabel = isCelsius ? '°C' : '°F'
  
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', [
    'temperature_2m',
    'weather_code',
    'wind_speed_10m',
    'relative_humidity_2m',
    'apparent_temperature',
  ].join(','))
  url.searchParams.set('daily', [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_probability_max',
    'weather_code',
  ].join(','))
  url.searchParams.set('temperature_unit', unit)
  url.searchParams.set('wind_speed_unit', 'kmh')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '5')
  
  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 }  // Cache 1 hora — el clima no cambia cada minuto
  })
  
  const data = await response.json()
  
  return {
    current: {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      condition: WEATHER_CODES[data.current.weather_code] ?? 'Variable',
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      code: data.current.weather_code,
      unit: unitLabel,
    },
    forecast: data.daily.time.slice(1, 5).map((date: string, i: number) => ({
      date,
      max: Math.round(data.daily.temperature_2m_max[i + 1]),
      min: Math.round(data.daily.temperature_2m_min[i + 1]),
      precipProb: data.daily.precipitation_probability_max[i + 1],
      code: data.daily.weather_code[i + 1],
    })),
    unit: unitLabel,
  }
}

// Mapeo de WMO weather codes a iconos SVG
// Usar Lucide React: Sun, Cloud, CloudRain, CloudSnow, Zap, Wind
export function getWeatherIcon(code: number) {
  if (code === 0) return 'sun'
  if (code <= 2)  return 'cloud-sun'
  if (code <= 3)  return 'cloud'
  if (code <= 48) return 'cloud-fog'
  if (code <= 55) return 'cloud-drizzle'
  if (code <= 65) return 'cloud-rain'
  if (code <= 75) return 'cloud-snow'
  if (code <= 82) return 'cloud-rain'
  return 'zap'
}
```

```tsx
// components/Sidebar/WeatherModule.tsx

import { fetchWeather, getWeatherIcon } from '@/services/weather'
import { useUserLocation } from '@/hooks/useUserLocation'
import * as Icons from 'lucide-react'

export async function WeatherModule({ locale }: { locale: string }) {
  const location = await getUserLocation()  // ip-api.com → lat/lon
  const weather = await fetchWeather(location.lat, location.lon, locale)
  
  const WeatherIcon = Icons[getWeatherIcon(weather.current.code)]
  
  return (
    <div className="sidebar-module">
      {/* Header del módulo */}
      <div className="sidebar-module-header">
        <span className="sidebar-module-title">Clima</span>
        <span className="sidebar-module-meta">{location.city}</span>
      </div>
      
      {/* Temperatura actual — grande, limpia */}
      <div className="weather-current">
        <div className="weather-temp-row">
          <span className="weather-temp">
            {weather.current.temp}{weather.current.unit}
          </span>
          <WeatherIcon size={28} className="weather-icon" strokeWidth={1.5} />
        </div>
        <span className="weather-condition">{weather.current.condition}</span>
        <span className="weather-feels">
          Sensación {weather.current.feelsLike}{weather.current.unit}
        </span>
      </div>
      
      {/* Forecast 4 días */}
      <div className="weather-forecast">
        {weather.forecast.map(day => {
          const DayIcon = Icons[getWeatherIcon(day.code)]
          return (
            <div key={day.date} className="forecast-day">
              <span className="forecast-date">
                {new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(day.date))}
              </span>
              <DayIcon size={14} strokeWidth={1.5} className="forecast-icon" />
              <span className="forecast-range">
                {day.max}° {day.min}°
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### 7.3 Módulo de Mercados

**APIs gratuitas para datos de mercado:**

| API | Free Tier | Recomendado para |
|-----|-----------|-----------------|
| **Alpha Vantage** | 25 req/día | Cotizaciones EOD + índices |
| **Twelve Data** | 800 créditos/día | Índices en tiempo real |
| **Yahoo Finance (unofficial)** | Sin límite oficial | Datos rápidos sin key |
| **Financial Modeling Prep** | 250 req/día | Fundamentales + índices |

**Estrategia:** Yahoo Finance para datos actuales (sin key, con proxy mínimo), Alpha Vantage para histórico.

```typescript
// services/market.ts

// Yahoo Finance endpoint no oficial — funciona sin API key
// Cache agresivo: los mercados solo necesitan actualizarse cada 5-15 min
const INDICES = [
  { symbol: '^GSPC',  label: 'S&P 500',  short: 'SP500'  },
  { symbol: '^IXIC',  label: 'NASDAQ',   short: 'NASDAQ' },
  { symbol: 'BTC-USD', label: 'Bitcoin', short: 'BTC'    },
]

export async function fetchMarketData() {
  const symbols = INDICES.map(i => i.symbol).join(',')
  
  // Proxy propio para evitar CORS — un endpoint mínimo en FastAPI
  const response = await fetch(`/api/market?symbols=${encodeURIComponent(symbols)}`, {
    next: { revalidate: 300 }  // Cache 5 minutos
  })
  
  const data = await response.json()
  
  return INDICES.map(index => {
    const quote = data[index.symbol]
    if (!quote) return null
    
    const change = quote.regularMarketChangePercent
    return {
      symbol: index.symbol,
      label: index.label,
      short: index.short,
      price: formatPrice(quote.regularMarketPrice, index.symbol),
      change: change,
      changeFormatted: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
      positive: change >= 0,
    }
  }).filter(Boolean)
}

// En FastAPI, el proxy:
// @app.get("/api/market")
// async def get_market(symbols: str):
//     url = f"https://query1.finance.yahoo.com/v7/finance/quote?symbols={symbols}"
//     async with httpx.AsyncClient() as client:
//         r = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
//         return r.json()["quoteResponse"]["result"]
```

```tsx
// components/Sidebar/MarketsModule.tsx

export async function MarketsModule({ locale }: { locale: string }) {
  const markets = await fetchMarketData()
  
  return (
    <div className="sidebar-module">
      <div className="sidebar-module-header">
        <span className="sidebar-module-title">Mercados</span>
        <a href="/markets" className="sidebar-module-link">Ver más</a>
      </div>
      
      <div className="markets-grid">
        {markets.map(market => (
          <div key={market.symbol} className="market-item">
            <div className="market-header">
              <span className="market-label">{market.short}</span>
              <span className={`market-change ${market.positive ? 'positive' : 'negative'}`}>
                {market.changeFormatted}
              </span>
            </div>
            <span className="market-price">{market.price}</span>
            {/* Mini sparkline — SVG simple con los últimos 7 puntos */}
            <SparklineChart data={market.sparkline} positive={market.positive} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 7.4 CSS del Sidebar Completo

```css
/* ─────────────────────────────────────────
   SIDEBAR PRINCIPAL
   ───────────────────────────────────────── */
.sidebar {
  width: 360px;
  flex-shrink: 0;
  position: sticky;
  top: calc(52px + var(--space-6));  /* Nav height + padding */
  height: calc(100vh - 52px - var(--space-6));
  overflow-y: auto;
  scrollbar-width: none;
  padding-left: var(--space-6);
}

.sidebar-module {
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  margin-bottom: var(--space-4);
}

.sidebar-module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.sidebar-module-title {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.sidebar-module-meta {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.sidebar-module-link {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--color-accent);
  text-decoration: none;
}

/* ─────────────────────────────────────────
   CLIMA
   ───────────────────────────────────────── */
.weather-temp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-1);
}

.weather-temp {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 300;
  color: var(--color-text-primary);
  letter-spacing: -0.03em;
}

.weather-icon { color: var(--color-text-secondary); }

.weather-condition {
  display: block;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.weather-feels {
  display: block;
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-4);
}

.weather-forecast {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.forecast-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.forecast-date {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.forecast-icon { color: var(--color-text-secondary); }

.forecast-range {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

/* ─────────────────────────────────────────
   MERCADOS
   ───────────────────────────────────────── */
.markets-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.market-item {
  padding: var(--space-3);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.market-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.market-label {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.04em;
}

.market-change {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: 500;
}

/* Solo estos dos colores para mercados — nada más */
.market-change.positive { color: #4ade80; }
.market-change.negative { color: #f87171; }

.market-price {
  display: block;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}
```

---

## 8. Google Fonts: Implementación

```html
<!-- En app/layout.tsx (Next.js App Router) -->
<!-- Solo cargar weights necesarios — no cargar toda la familia -->

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link
  href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..500&family=Figtree:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

```typescript
// O con next/font (mejor performance — zero layout shift)
// app/layout.tsx

import { Newsreader, Figtree } from 'next/font/google'

const newsreader = Newsreader({
  subsets: ['latin'],
  axes: ['opsz'],  // Optical sizing — la característica más valiosa de Newsreader
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html className={`${newsreader.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

---

## 9. Tabla Comparativa: Antes vs. Después

| Elemento | Antes | Después | Principio |
|----------|-------|---------|-----------|
| **Tipografía headlines** | Sistema font / Inter | Newsreader — editorial, serif con personalidad | Identidad y autoridad |
| **Tipografía UI** | Sin consistencia | Figtree — geométrica con carácter | Legibilidad funcional |
| **Categorías** | Pills con emojis (🌍 Todo) | Texto Figtree con underline activo | Sin ruido decorativo |
| **Tags de técnicas** | Rectángulos de colores múltiples | Texto mayúscula en gris tercero | Color = función |
| **"Versión neutralizada"** | Label teal brillante | Label gris + cursiva bordeada | Sobrio, autorizado |
| **VeritasScore** | Burbuja roja prominente | Badge pequeño, al final de metadata | Jerarquía correcta |
| **Score colores** | Rojo neón / verde brillante | Gris / ámbar oscuro / rojo oscuro | Urgencia calibrada |
| **Fondo de cards** | Cards con bordes y fondo diferenciado | Sin borde, separación por espacio + line | Editorial, no dashboard |
| **Trending badge** | Emoji + color | Texto "Tendencia" en ámbar | Funcional |
| **Layout** | 2 columnas simétricas | Grid editorial asimétrica (Perplexity-style) | Jerarquía informativa |
| **Sidebar** | Inexistente | Clima + Mercados + Trending + Más leído | Contexto real |
| **Colores en uso** | 6+ colores simultáneos | 3 máximo en la misma pantalla | Sistema coherente |
| **Botones** | Múltiples estilos inconsistentes | Ghost + Subtle Primary únicamente | Consistencia |

---

## 10. Resumen de APIs Gratuitas del Sidebar

| Módulo | API | Costo | Key requerida | Límite |
|--------|-----|-------|---------------|--------|
| Clima | Open-Meteo | $0 | No | Ilimitado |
| Geo del usuario | ip-api.com (CF header) | $0 | No | CF gratuito |
| Índices bursátiles | Yahoo Finance (proxy) | $0 | No | Sin límite oficial |
| Índices backup | Alpha Vantage | $0 | Sí (gratis) | 25 req/día |
| Logos de medios | Google Favicons | $0 | No | Ilimitado |

---

## 11. Checklist de Implementación

### Sprint 1 (3-4 días): Fundaciones
- [ ] Instalar Newsreader + Figtree via next/font
- [ ] Crear `tokens.css` con todas las variables del sistema de color
- [ ] Crear `typography.css` con la escala tipográfica
- [ ] Reemplazar todas las instancias de `Inter`/fuente actual
- [ ] Eliminar emojis de categorías — reemplazar con texto

### Sprint 2 (3-4 días): Cards y Feed
- [ ] Rediseñar `ArticleMeta` component
- [ ] Rediseñar `VeritasScoreBadge` — 3 variantes
- [ ] Rediseñar etiquetas de técnicas de manipulación
- [ ] Rediseñar "Versión neutralizada"
- [ ] Implementar layout editorial (Patrón A, B, C, D)

### Sprint 3 (4-5 días): Sidebar
- [ ] Integrar Open-Meteo API
- [ ] Crear proxy de Yahoo Finance en FastAPI
- [ ] Implementar `WeatherModule`
- [ ] Implementar `MarketsModule` con sparklines
- [ ] Implementar `TrendingModule` (lo más leído)
- [ ] Layout sticky del sidebar

### Sprint 4 (2-3 días): Refinamiento
- [ ] Micro-animaciones con Framer Motion (solo las necesarias)
- [ ] Responsive: colapso del sidebar en tablet/mobile
- [ ] Auditoría de accesibilidad (contraste WCAG AA)
- [ ] Performance: verificar LCP < 2.5s con las fuentes nuevas

---

*Plan de Rediseño UX/UI — VeritasAI*  
*Dirección: Editorial Intelligence*  
*Tipografía: Newsreader + Figtree (Google Fonts, gratuitas)*  
*APIs sidebar: Open-Meteo + Yahoo Finance proxy — $0 adicionales*
