# VeritasAI — Arquitectura Senior de Nivel Maestro para un Portal de Noticias con Análisis de Manipulación

> **Documento de Investigación y Diseño de Arquitectura**  
> Nivel: Senior / Investigación Neurocientífica / Ingeniería de Producción  
> Propósito: Investigación profunda antes de cualquier prototipo  

---

## Resumen Ejecutivo

VeritasAI es una plataforma web/móvil de análisis crítico de medios que combina una cascada de inteligencia artificial, neurociencia cognitiva aplicada, detección de propaganda computacional y UX de revelación progresiva para empoderar a ciudadanos globales contra la desinformación. El sistema no es un filtro de noticias: es un microscopio cognitivo que expone, en tiempo real, las técnicas con las que los medios de comunicación intentan alterar la percepción de la realidad.

---

## 1. El Problema Real: Neurociencia de la Manipulación Mediática

Los medios modernos no mienten simplemente — **rediseñan la arquitectura cognitiva del lector**. La investigación en neurociencia cognitiva identifica al menos 47 técnicas documentadas de manipulación semántica. Las más utilizadas en contextos como Colombia incluyen:

### 1.1 Técnicas de Manipulación Cognitiva Documentadas

**Manipulación Emocional (Sistema Límbico):**
- **Fear-mongering (amplificación del miedo)**: Activa la amígdala antes de que la corteza prefrontal pueda evaluar la información racionalmente. Titulares como "Colombia al borde del colapso" provocan una respuesta de cortisol que sesga la interpretación de todo el artículo siguiente.
- **Moral outrage engineering**: Genera indignación moral deliberada para activar el sistema de identidad grupal del lector, haciendo que comparta antes de analizar.
- **Nostalgia weaponization**: Usa referencias al pasado idealizado para crear contraste negativo con el presente, distorsionando evaluación temporal.

**Manipulación Cognitiva (Sistema Racional):**
- **Framing effect**: La misma estadística presentada como "90% de éxito" vs "10% de fracaso" activa regiones cerebrales diferentes (corteza orbitofrontal) y produce decisiones distintas.
- **Anchoring bias exploitation**: El primer número o dato presentado en un artículo ancla toda evaluación posterior. Los medios colocan deliberadamente cifras extremas en los primeros párrafos.
- **False dichotomy creation**: Reducir problemas multidimensionales a dos opciones binarías elimina el pensamiento sistémico del lector.
- **Illusory truth effect**: La repetición de afirmaciones — incluso marcadas como falsas — incrementa su credibilidad percibida. Los medios repiten narrativas en múltiples artículos.

**Manipulación de Narrativa (Nivel Sistémico):**
- **Agenda setting**: Controlar QUÉ se cubre, no cómo, para que el público perciba esos temas como los "más importantes".
- **Dog whistle rhetoric**: Frases codificadas que activan respuestas condicionadas en grupos específicos sin que sean detectables por audiencias generales.
- **Manufactured consensus**: Citar solo fuentes que confirman una posición para crear apariencia de unanimidad.
- **Source laundering**: Citar una fuente sesgada como si fuera neutral para dar legitimidad a una afirmación sin verificación.

**Técnicas Neurolingüísticas:**
- **Nominalization**: Convertir procesos en entidades ("la violencia crece" en lugar de "grupo X hizo Y") elimina la responsabilidad y el agente.
- **Presupposition embedding**: Incluir afirmaciones no demostradas como presupuestos gramaticales ("¿Cuándo dejó el gobierno de proteger a los ciudadanos?")
- **Emotional intensifiers**: Palabras con alta valencia emocional (masacre, traición, crisis) insertas en contextos neutros para contaminar emocionalmente la narrativa.

---

## 2. Arquitectura Técnica de Nivel Producción

### 2.1 Visión General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE INGESTA                          │
│  GDELT 2.0 API (100+ idiomas) + NewsAPI + RSS + Web Scraping    │
│  Geolocalización del usuario → País → Idioma → Contexto local   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                   CASCADA DE INTELIGENCIA (5 CAPAS)             │
│                                                                  │
│  CAPA 1: Pre-procesamiento NLP (spaCy + langdetect)             │
│  CAPA 2: Detección rápida de señales (BERT fine-tuned)          │
│  CAPA 3: Análisis de propaganda (modelos especializados)        │
│  CAPA 4: Razonamiento profundo (LLM grande — Llama 3.3 70B)     │
│  CAPA 5: Verificación cruzada y síntesis (RAG + fact-checking)  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                    MOTOR DE SCORING                              │
│  Score de Manipulación (0-100) + Técnicas identificadas         │
│  Score de Credibilidad del Medio + Score del Periodista         │
│  Mapa de Sesgos + Tipo de Desinformación + Intención inferida   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                     GENERACIÓN DE ARTEFACTOS                    │
│  Noticia corregida (sin sesgos) + Explicación de técnicas       │
│  Chain of thought visible + Fuentes alternativas verificadas    │
│  Perfil del medio actualizado en tiempo real                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                     │
│  PWA (Progressive Web App) + Mobile-first + Dark/Light mode     │
│  Feed estilo Perplexity + Panel de análisis + Chat con IA       │
│  Dashboard de credibilidad de medios y periodistas              │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 La Cascada de Inteligencia (El Corazón del Sistema)

La arquitectura más importante del sistema es la **cascada de 5 capas**, donde cada modelo tiene un rol específico y su output alimenta el siguiente. Este diseño es crítico porque ningún modelo individual puede manejar todos los aspectos del análisis.

#### CAPA 1: Pre-procesamiento e Inteligencia Contextual
**Tecnologías**: spaCy (libre), langdetect (libre), geoip2 (libre)

- Detecta idioma del artículo
- Extrae entidades nombradas (personas, organizaciones, lugares, fechas)
- Identifica el país de origen del usuario y del medio
- Realiza tokenización y limpieza lingüística
- **Costo**: $0 (totalmente open source, corre en servidor)
- **Tiempo estimado**: < 100ms

#### CAPA 2: Detección Rápida de Señales de Manipulación
**Tecnologías**: BERT fine-tuned (HuggingFace, libre), modelos especializados en propaganda

- Clasificación multiclase de técnicas de propaganda (usando el dataset PTC de la SemEval)
- Detección de clickbait, sensacionalismo, fear-mongering
- Score inicial de credibilidad
- Análisis de sentimiento y valencia emocional
- **Modelos open source relevantes**:
  - `cardiffnlp/twitter-roberta-base-sentiment` (HuggingFace)
  - Modelos fine-tuned del SemEval 2020 Task 11 (propaganda detection)
  - `ProsusAI/finbert` adaptado para análisis mediático
- **Costo**: $0 si se corre con Ollama local o Hugging Face Inference API (tier gratis: 30,000 tokens/mes)
- **Tiempo estimado**: 200-500ms

#### CAPA 3: Análisis Profundo de Propaganda y Neuromarketing
**Tecnologías**: LLM mediano via Groq API (libre hasta 6,000 req/día con Llama 3.3)

Prompt especializado para:
- Identificar las técnicas específicas con citas textuales del artículo
- Analizar la estructura narrativa (qué se incluye vs qué se omite)
- Detectar presuppositions, nominalizaciones, dog whistles
- Evaluar la selección de fuentes
- **Modelo recomendado**: `llama-3.3-70b-versatile` en Groq (velocidad: 500+ tokens/seg)
- **Costo**: Groq free tier = 500,000 tokens/día gratis
- **Tiempo estimado**: 1-3 segundos

#### CAPA 4: Razonamiento Crítico y Reescritura Neutral
**Tecnologías**: Modelo de razonamiento más grande, potencialmente con chain-of-thought visible

- Genera la "noticia corregida": mismos hechos, lenguaje neutral, sin técnicas manipuladoras
- Produce una explicación pedagógica de cada técnica encontrada
- Califica la gravedad de la manipulación
- Estima la intención (propagandística, comercial, política, accidental)
- **Modelos candidatos**:
  - `deepseek-r1-distill-llama-70b` en Groq (chain-of-thought nativo)
  - `mistral-saba` (multilingüe, fuerte en español)
  - `gemma2-9b-it` (Google, código abierto, excelente en análisis)
- **Costo**: Dentro del tier gratis de Groq o con Ollama local (0 costo adicional)
- **Tiempo estimado**: 3-8 segundos

#### CAPA 5: Verificación Cruzada y Fact-Checking (RAG)
**Tecnologías**: Brave Search API (libre con 2,000 req/mes), Wikipedia API (libre), GDELT (libre)

- Busca la misma noticia en múltiples fuentes independientes
- Verifica afirmaciones de hechos concretos contra fuentes verificadas
- Agrega contexto histórico desde Wikipedia
- Detecta si la misma narrativa está siendo publicada coordinadamente (astroturfing)
- Genera lista de fuentes alternativas confiables
- **Costo**: $0 con APIs gratuitas
- **Tiempo estimado**: 2-5 segundos (paralelo con CAPA 4)

---

## 3. Stack Tecnológico Completamente Gratuito y Open Source

### 3.1 APIs Gratuitas de Noticias e Información

| Servicio | Cobertura | Límite Gratis | Idiomas |
|----------|-----------|---------------|---------|
| **GDELT 2.0 DOC API** | Global, 100+ países | Ilimitado (bigquery) | 65+ idiomas |
| **NewsAPI.org** | 80,000+ fuentes | 100 req/día (developer) | Múltiples |
| **The Guardian API** | Calidad editorial alta | 500 req/día | Inglés/ES |
| **New York Times API** | Archivo desde 1851 | 500 req/día | Inglés |
| **GNews API** | Global | 100 req/día | Multi |
| **RSS Universal** | Cualquier fuente | Ilimitado | Cualquier |

**El rey gratuito: GDELT Project** — Soportado por Google Jigsaw, monitorea ~400,000 artículos/día de prácticamente todo el mundo, actualiza cada 15 minutos, y es completamente gratuito. Incluye análisis de sentimiento, geolocalización, y extracción de entidades. Para Colombia específicamente, indexa todos los medios nacionales (El Tiempo, Semana, El Colombiano, etc.).

### 3.2 LLMs Gratuitos (Cascada de Modelos)

| Proveedor | Modelos Disponibles (Gratis) | Límite Diario | Velocidad |
|-----------|------------------------------|---------------|-----------|
| **Groq** | Llama-3.3-70B, DeepSeek-R1-70B, Gemma2-9B, Mistral-Saba | 500,000 tokens/día | 500+ tok/seg |
| **Hugging Face** | Cualquier modelo open source | 30,000 tokens/mes | Variable |
| **Ollama (local)** | Llama, Mistral, Gemma, etc. | Ilimitado (local) | Hardware-dependiente |
| **Google AI Studio** | Gemini 2.0 Flash, Gemini 2.5 | 1,500 req/día | Rápido |
| **OpenRouter** | 50+ modelos (rotating free) | Variable | Variable |
| **Cerebras** | Llama 3.1-70B | 1M tokens/día gratis | Ultra-rápido |

**Estrategia de cascada de costos cero**: Para mantener el sistema completamente gratis, se implementa un **router inteligente** que:
1. Usa Groq para la mayoría de análisis (más rápido, más confiable)
2. Cuando Groq llega al límite diario, rota a Google AI Studio (Gemini Flash)
3. Cuando ambos están limitados, usa Ollama con modelo local en el servidor
4. Hugging Face como respaldo para modelos especializados de propaganda

### 3.3 APIs Gratuitas de Soporte

| Función | API/Servicio | Límite Gratis |
|---------|-------------|---------------|
| Geolocalización IP | `ip-api.com` | 1,000 req/min |
| Detección de idioma | `langdetect` (Python lib) | Ilimitado (local) |
| Fact-checking básico | Wikipedia REST API | Ilimitado |
| Búsqueda de fuentes | Brave Search API | 2,000 req/mes |
| Detección de similitud | spaCy + sentence-transformers | Ilimitado (local) |
| Base de datos de medios | Media Bias/Fact Check (scraping ético) | - |
| NLP avanzado | spaCy, NLTK, HuggingFace Transformers | Ilimitado (local) |

### 3.4 Stack de Infraestructura Gratuita

| Componente | Solución Gratuita | Límites |
|------------|-------------------|---------|
| **Frontend Hosting** | Vercel / Netlify | Ilimitado (proyectos OSS) |
| **Backend API** | Railway / Render | $5/mes crédito gratuito |
| **Base de datos** | Supabase (PostgreSQL) | 500MB gratis |
| **Cache/Redis** | Upstash Redis | 10,000 req/día gratis |
| **Cola de tareas** | Supabase Edge Functions | Incluido |
| **CDN** | Cloudflare (free tier) | Ilimitado |
| **Monitoreo** | Grafana Cloud | Gratis para OSS |
| **Auth** | Supabase Auth | 50,000 MAU gratis |
| **Vector DB (RAG)** | Chroma (open source local) | Ilimitado |

---

## 4. Sistema de Scoring y Métricas Neurocientíficas

### 4.1 El Score de Manipulación (VeritasScore™)

El VeritasScore es una métrica compuesta de 0-100 que integra múltiples dimensiones de análisis. No es un número arbitrario — cada componente tiene base en investigación cognitiva y computacional:

```
VeritasScore = (
  0.25 × Emotional_Manipulation_Index +
  0.20 × Factual_Accuracy_Score +
  0.20 × Source_Bias_Index +
  0.15 × Narrative_Framing_Score +
  0.10 × Omission_Detection_Score +
  0.10 × Language_Manipulation_Score
)
```

**Interpretación**:
- **0-20**: Artículo mayoritariamente neutral y verificable
- **21-40**: Sesgo leve, técnicas menores de framing
- **41-60**: Manipulación moderada, técnicas identificables
- **61-80**: Manipulación severa, multiple técnicas documentadas
- **81-100**: Propaganda activa o desinformación deliberada

### 4.2 Perfil Dinámico del Medio de Comunicación

Cada medio acumula un historial basado en todos los artículos procesados:

- **Credibility Trend**: Gráfica temporal de su VeritasScore promedio (¿mejoran o empeoran?)
- **Técnicas más usadas**: Heatmap de qué técnicas usa con más frecuencia
- **Sesgo político**: Espectro visual izquierda-derecha basado en análisis léxico
- **Temas de agenda dominantes**: ¿Qué temas sobreamplifican o ignoran?
- **Comparativa nacional**: ¿Cómo se posiciona vs otros medios del mismo país?
- **Alert level**: Estado actual del medio (Verde = Confiable, Amarillo = Sesgo leve, Naranja = Manipulación frecuente, Rojo = Propaganda activa)

### 4.3 Perfil del Periodista

Similar al del medio, cada periodista byline acumula:
- Score histórico promedio de sus artículos
- Técnicas de manipulación recurrentes en su escritura
- Temáticas donde tiende a ser más sesgado
- Historial de correcciones o desmentidos

---

## 5. UX/UI: Diseño Neurológicamente Óptimo

### 5.1 Principios de Diseño Basados en Neurociencia

El diseño de la interfaz no es estético — es **estratégico cognitivo**. Cada decisión de UX se basa en principios de carga cognitiva, atención selectiva y memoria de trabajo:

**Principio 1 — Carga Cognitiva Progresiva**: El cerebro humano solo puede procesar 4±1 chunks de información simultáneamente (Miller's Law). La interfaz revela información en capas, no todo a la vez.

**Principio 2 — Atención Dirigida**: El ojo humano sigue patrones F-scan y Z-scan. El VeritasScore se coloca en la esquina superior derecha de cada tarjeta (donde el ojo llega en el tercer punto del Z-scan).

**Principio 3 — Señalética Emocional Controlada**: Usamos color como indicador de urgencia cognitiva (rojo para alta manipulación) pero siempre acompañado de texto explicativo para evitar que la interfaz misma manipulation al usuario.

**Principio 4 — Agency del Usuario**: La neurociencia muestra que la sensación de control aumenta la confianza y el engagement. El usuario siempre puede ver la cadena de pensamiento completa, no solo el resultado.

### 5.2 Componentes UI Clave

**Card de Noticia (Tres estados progresivos)**:

```
┌──────────────────────────────────────────────┐
│ [Imagen noticia]                  Score: 73  │
│                                   🔴 ALTO    │
│ TITULAR ORIGINAL                             │
│ "Gobierno destruye economía colombiana"      │
├──────────────────────────────────────────────┤
│ TITULAR CORREGIDO (Neutral)                  │
│ "PIB colombiano creció 1.2% vs 2.8%          │
│  proyectado en 2024"                         │
├──────────────────────────────────────────────┤
│ ⚡ 3 técnicas detectadas                     │
│ • Fear-mongering • Hipérbole • Omisión       │
│                                              │
│ [Ver análisis completo] [Chat con IA]        │
└──────────────────────────────────────────────┘
```

**Panel de Análisis Expandido (Chain-of-Thought)**:

Cuando el usuario abre el análisis completo, ve:
1. **Noticia original** con highlighting de las frases problemáticas (color-coded por tipo de técnica)
2. **Cadena de pensamiento**: Una línea de tiempo visual que muestra qué detectó cada capa del sistema
3. **Noticia reescrita**: El mismo artículo, neutralizado
4. **Explicación educativa**: "¿Por qué esto es manipulación?" con analogías accesibles
5. **Contexto adicional**: 3-5 fuentes que cubren el mismo hecho de forma diferente
6. **Chat con IA**: El usuario puede preguntar cualquier cosa sobre el artículo

**Dashboard de Medios**:
- Ranking de medios nacionales por credibilidad (con gráfica de tendencia temporal)
- Mapa de calor de técnicas por medio
- Timeline comparativo de cobertura del mismo evento por múltiples medios
- Filtros: Por país, por tema, por período, por tipo de manipulación

### 5.3 Experiencia Mobile-First

La app es una **PWA (Progressive Web App)** que funciona como app nativa sin necesidad de app store:
- Instalable desde el navegador (Add to Home Screen)
- Funciona offline para artículos ya analizados (Service Worker)
- Push notifications para alertas de alta manipulación
- Gestos nativos: swipe para comparar versión original vs corregida
- Modo de lectura rápida con solo el score y las técnicas principales

---

## 6. Arquitectura de Datos y Privacidad

### 6.1 Flujo de Datos

```
Usuario accede → IP geolocalización (no se almacena) →
Feed personalizado por país/idioma →
Artículo seleccionado → Cola de análisis →
Cascada de IA → Resultado almacenado en cache →
Próximo usuario con mismo artículo recibe resultado instantáneo
```

**Principio de Privacidad por Diseño**: 
- No se crea cuenta obligatoria
- No se almacena historial de lectura vinculado a usuario
- Solo se almacena el análisis del artículo (no quién lo leyó)
- Los resultados se comparten como "bienes públicos" — si alguien ya analizó un artículo, todos se benefician

### 6.2 Base de Datos (Supabase PostgreSQL)

Tablas principales:
- `articles`: URL, título, fuente, fecha, VeritasScore, técnicas detectadas
- `media_outlets`: Perfil histórico de cada medio (score promedio, técnicas frecuentes)
- `journalists`: Perfil histórico por periodista
- `analysis_cache`: Resultado completo del análisis para reuso
- `techniques_catalog`: Biblioteca de técnicas de manipulación con definiciones, ejemplos y referencias académicas

---

## 7. Cómo se Convierte en un Portal Real (No un Prototipo)

### 7.1 Lo que Diferencia un Prototipo de un Producto Real

| Dimensión | Prototipo | Producto Real |
|-----------|-----------|---------------|
| **Análisis** | Hardcoded o un solo modelo | Cascada de 5 capas con fallbacks |
| **Datos** | Artículos de ejemplo | GDELT + múltiples APIs, actualización cada 15min |
| **Escalabilidad** | Un usuario | Cola de tareas (Bull/BullMQ), cache agresivo |
| **Multilingüe** | Solo español/inglés | 65+ idiomas vía GDELT + modelos multilingües |
| **Geolocalización** | Manual | Automática por IP, personalización por país |
| **Perfiles de medios** | Estáticos | Actualizados dinámicamente con cada artículo |
| **UX** | Funcional | Neurológicamente optimizado, loading states, skeletons |
| **Offline** | No | Service Worker + IndexedDB |
| **Confiabilidad** | Sin fallbacks | Router de LLMs con 4+ fallbacks |

### 7.2 Pipeline de Producción (Backend)

**Stack Backend Recomendado**:
- **Framework**: FastAPI (Python) — ideal por su ecosistema de ML/NLP
- **Orquestación de LLMs**: LangChain o LlamaIndex para gestionar la cascada
- **Cola de tareas**: Celery + Redis (Upstash gratis) para análisis asíncrono
- **Cache**: Redis para artículos ya analizados (>80% de requests serán cache hits)
- **Base de datos**: Supabase (PostgreSQL + Realtime + Auth + Storage)
- **Despliegue**: Railway o Render (tier gratis inicial, ~$5/mes para producción)

**Stack Frontend**:
- **Framework**: Next.js 15 (React) con App Router
- **Styling**: Tailwind CSS v4
- **Estado**: Zustand (ligero, eficiente)
- **Charts**: Recharts (libre, React-native)
- **PWA**: next-pwa
- **Chat**: Vercel AI SDK (soporte nativo para streaming)

### 7.3 El Sistema de Cache Inteligente

El artículo de análisis más caro (en tiempo y compute) se hace **una sola vez**. Después, cualquier usuario que acceda al mismo artículo recibe el análisis instantáneamente desde cache. Este diseño significa que:
- Los artículos virales (los más leídos) se analizan una vez y sirven a millones
- El costo marginal por usuario adicional es virtualmente cero
- La velocidad percibida es instantánea para la mayoría de artículos

---

## 8. Modelo de Sostenibilidad (Free Forever)

### 8.1 Por qué Puede Ser Gratis

El modelo de costo cero es viable porque:

1. **GDELT es gratuito e ilimitado** para fuentes de noticias
2. **Groq ofrece 500,000 tokens/día gratuitos** — suficiente para ~500 análisis completos/día inicialmente
3. **El cache multiplica el impacto** — 1 análisis sirve a 1,000 usuarios
4. **Open source = comunidad** — otros pueden contribuir modelos fine-tuned específicos para Colombia, Venezuela, etc.

### 8.2 Modelo de Ingresos (Cuando Escale)

Para mantener el servicio gratuito para usuarios mientras crece:

- **API para desarrolladores**: Acceso programático al análisis (plan gratuito + planes de pago para alto volumen)
- **Licencia a instituciones educativas**: Universidades, colegios, programas de media literacy
- **Donaciones**: Open Collective / GitHub Sponsors
- **Grants**: Organizaciones como Mozilla Foundation, Knight Foundation, y Google News Initiative financian exactamente este tipo de proyectos
- **White-label para ONGs**: Versión personalizada para organizaciones de fact-checking

### 8.3 Costos Reales en Producción

Escenario: 10,000 usuarios activos diarios, 50,000 artículos analizados/día (con cache)

| Componente | Costo Mensual |
|------------|---------------|
| Servidor Backend (Railway) | ~$10-20 |
| Base de datos (Supabase Pro) | $25 |
| CDN y Frontend (Vercel) | $0-20 |
| LLM APIs (exceso del tier gratis) | $0-50 |
| Redis Cache (Upstash) | $0-10 |
| **TOTAL** | **~$35-125/mes** |

Para el nivel de utilidad social que provee, este costo es ridículamente bajo. Con 1,000 usuarios haciendo donaciones de $1/año, el proyecto se autofinancia.

---

## 9. Estándares para Neurocientíficos (El Rigor Académico)

### 9.1 Base de Técnicas Documentadas Académicamente

El catálogo de técnicas no puede ser inventado — debe basarse en investigación académica peer-reviewed. Las fuentes académicas clave incluyen:

- **SemEval 2020 Task 11**: El primer dataset masivo de detección de propaganda a nivel de fragmento textual, con 18 técnicas clasificadas por expertos
- **NLP4IF Workshop (ACL/EMNLP)**: Investigación activa en detección de desinformación multilingüe
- **Da San Martino et al. (2020)**: "Fine-Grained Analysis of Propaganda in News Articles" — la taxonomía de referencia
- **Framing Theory (Entman, 1993)**: La base teórica del framing mediático
- **Kahneman's Dual Process Theory**: Fundamento neurocognitivo de por qué ciertas técnicas funcionan
- **Cialdini's Influence Principles**: Los 7 principios de persuasión como framework de análisis

### 9.2 Validación Continua del Modelo

Un sistema de nivel maestro no se construye y se olvida. Requiere:
- **Feedback loop**: Los usuarios pueden marcar análisis como incorrectos → alimenta fine-tuning
- **Benchmark público**: El sistema se evalúa contra datasets académicos estándar (LIAR, FakeNewsNet, PTC)
- **Red de expertos**: Alianzas con académicos de comunicación, lingüística y psicología cognitiva para validar el catálogo de técnicas
- **Transparencia metodológica**: El catálogo de técnicas y los prompts del sistema son públicos (Open Source)

---

## 10. Casos Edge y Retos Técnicos Críticos

### 10.1 Problemas Difíciles de Resolver

**El problema del sarcasmo**: Los modelos de NLP tienen dificultad con el sarcasmo, especialmente en español latinoamericano. Un artículo que usa sarcasmo para criticar la manipulación podría ser malclasificado.
*Solución*: Capa dedicada de detección de sarcasmo + bajo confidence → flag manual.

**El problema de la opinión legítima**: No toda opinión es manipulación. Un editorial tiene derecho a tener perspectiva.
*Solución*: El sistema clasifica el tipo de pieza (noticia vs editorial vs análisis) y ajusta el scoring según el formato.

**El problema del contexto cultural**: Una frase en Colombia puede tener connotaciones completamente diferentes que la misma frase en España.
*Solución*: Modelos fine-tuned específicos por país/región usando datos de GDELT + contexto cultural en el system prompt.

**El problema de los paywalls**: Muchos medios tienen artículos detrás de paywalls.
*Solución*: Solo analizar el fragmento accesible + metadatos. Ser transparente sobre la limitación.

**El problema de la velocidad vs profundidad**: El análisis completo tarda 8-15 segundos. El usuario moderno espera resultados en 2-3 segundos.
*Solución*: Arquitectura de "resultados progresivos" — mostrar el score inicial (CAPA 2: ~500ms) mientras el análisis profundo termina. UX de streaming similar a como Perplexity muestra la respuesta mientras la genera.

**El problema del volumen**: GDELT procesa 400,000 artículos/día. Pre-analizar todo es imposible con recursos gratuitos.
*Solución*: Análisis bajo demanda + pre-análisis de los artículos más virales (top trending por país).

### 10.2 Consideraciones Éticas Críticas

El sistema enfrenta una paradoja profunda: **usar IA para identificar manipulación IA podría crear una nueva forma de manipulación**. Un sistema que decide qué es "verdad" es en sí mismo un riesgo de concentración de poder epistémico.

Las salvaguardas necesarias:
1. **Transparencia radical**: Todos los prompts, modelos y metodologías son públicos
2. **Múltiples perspectivas**: Nunca se presenta "La Verdad™" sino "fuentes que reportan diferente"
3. **Humildad epistémica**: El sistema siempre indica su nivel de confianza
4. **Apelación**: Medios y periodistas pueden apelar clasificaciones
5. **Gobernanza comunitaria**: Las decisiones metodológicas son tomadas colectivamente, no por una empresa

---

## 11. Roadmap de Construcción Real

### Fase 1 — MVP Funcional (4-6 semanas)
- GDELT API integrada para Colombia + 3-4 países latinoamericanos
- Cascada básica: 2 capas (BERT + Llama 3.3 via Groq)
- UI mínima: feed + card de noticia con score + análisis básico
- 10 técnicas de manipulación detectadas
- Deploy en Vercel/Railway

### Fase 2 — Producto Completo (3-4 meses)
- Cascada completa de 5 capas
- Perfiles dinámicos de medios y periodistas
- Dashboard de credibilidad con charts
- Chat con IA por artículo
- PWA con offline support
- Cobertura de 20+ países
- Multilingüe (español, inglés, portugués)

### Fase 3 — Escala y Refinamiento (6-12 meses)
- Fine-tuning de modelos con datos propios
- Red de colaboradores para validación manual
- API pública para desarrolladores
- Sistema de alertas ("Este medio está publicando múltiples artículos con alta manipulación hoy")
- Análisis de redes coordinadas de desinformación (astroturfing detection)
- Integración con extensión de Chrome/Firefox

---

## Conclusión: Por Qué Esto Merece Aplausos de Pie

VeritasAI no es un detector de noticias falsas. Es un **sistema educativo de empoderamiento cognitivo** que:

1. **Respeta la inteligencia del usuario** — no le dice qué pensar, le muestra cómo lo están intentando manipular para que él decida
2. **Es radicalmente transparente** — muestra su propia cadena de pensamiento, sus fuentes, sus niveles de confianza
3. **Escala globalmente desde un costo de infraestructura de $35/mes** gracias a APIs gratuitas y open source
4. **Tiene rigor académico** con base en investigación peer-reviewed de neurociencia cognitiva y NLP computacional
5. **Es un bien público** — libre, open source, sin agenda política o comercial
6. **Educa mientras informa** — cada análisis enseña una técnica nueva de manipulación que el usuario ya no olvidará

El mundo necesita esto. Colombia necesita esto. El momento es ahora.

---

*Documento generado como investigación previa al desarrollo. Ninguna línea de código ha sido escrita aún.*
