# VeritasAI — Documento Maestro de Arquitectura y Diseño
### Sistema Global Anti-Manipulación Mediática · Nivel Senior · Costo Operativo Cero

> **Clasificación:** Documento de Diseño de Producción · Investigación Aplicada  
> **Nivel:** Senior / Investigación Neurocientífica / Ingeniería de Producción / Vanguardia 2026  
> **Estado:** Fundamento pre-desarrollo — ninguna línea de código escrita aún  
> **Idioma primario:** Español latinoamericano (cobertura global multilingüe)

---

## Resumen Ejecutivo

VeritasAI es una plataforma web/móvil de análisis crítico de medios que combina una arquitectura multi-agente híbrida (nube + dispositivo local), neurociencia cognitiva aplicada, detección computacional de propaganda, integridad criptográfica descentralizada y UX de razonamiento interactivo para empoderar a ciudadanos globales contra la desinformación industrial.

El sistema no es un detector de noticias falsas. No es un filtro. Es un **microscopio cognitivo forense** que expone, en tiempo real, las técnicas con las que los medios de comunicación intentan alterar la arquitectura de pensamiento del lector — y luego le entrega las herramientas para recuperar su agencia intelectual.

**Lo que este documento unifica:**
- La arquitectura técnica de producción y el modelo de costos reales (Veritas)
- La visión de vanguardia con IA en el dispositivo, descentralización y UI de razonamiento interactivo (Vanguard)
- Nuevas contribuciones: arquitectura híbrida servidor/edge, soluciones al cold-start problem, estrategia de robustez adversarial, y cobertura de las brechas que ambos documentos originales ignoraron (audio, WhatsApp, español fragmentado)

**Principio rector:** Toda decisión técnica y de diseño debe cumplir simultáneamente tres condiciones: (1) costo operativo cero o cercano a cero, (2) rigor académico defendible ante neurocientíficos, y (3) experiencia de usuario que genere aplausos de pie.

---

## 1. El Problema Real: Guerra Cognitiva Industrial en 2026

### 1.1 El Estado Crítico del Ecosistema Informativo

El año 2026 marca una línea divisoria. La convergencia de la IA generativa, las infraestructuras de publicación descentralizadas y las técnicas de neuromarketing algorítmico ha llevado a la desinformación a operar a escala industrial con precisión micro-segmentada. Los informes estratégicos recientes, incluyendo el reporte del Científico Jefe de la OTAN sobre Guerra Cognitiva 2026, son inequívocos: el terreno decisivo en los conflictos contemporáneos ya no es el espacio geográfico sino el **dominio conductual y neurocognitivo**.

Los adversarios estatales, corporaciones y actores híbridos utilizan la IA como acelerador masivo para explotar las fallas cognitivas de la sociedad. El éxito no se mide por la penetración de un mensaje a corto plazo, sino por **alteraciones duraderas en los patrones cognitivos y disposiciones conductuales** de poblaciones enteras.

Los medios modernos no mienten simplemente — **rediseñan la arquitectura cognitiva del lector**. Y en 2026, los enfoques tradicionales de moderación estática, etiquetado a posteriori y verificación manual son obsoletos frente a:
- Deepfakes que superan los umbrales críticos de detección visual
- "AI slop" (contenido sintético masivo) que inunda los motores de búsqueda
- Algoritmos de plataformas que recompensan el contenido emocionalmente polarizante para maximizar retención dopaminérgica
- Campañas coordinadas de desinformación que operan a velocidad de máquina

### 1.2 Marco Biopsicosocial de la Manipulación (3 Estratos, OTAN 2026)

La manipulación mediática no opera en un único nivel. Opera en tres estratos simultáneos que el sistema debe auditar e interceptar de manera conjunta:

**Estrato 1 — Nivel Biológico (Capacidad Neurológica)**
Las técnicas operan sobre las funciones fisiológicas del usuario: inducción de fatiga cognitiva, sobreestimulación del sistema de alerta, explotación de las vías de recompensa dopaminérgica. Los algoritmos de las plataformas tecnológicas exacerban esto entregando golpes rápidos de dopamina que calman narcisistamente o desencadenan indignación inmediata antes de que pueda ocurrir cualquier verificación racional.

**Estrato 2 — Nivel Psicológico (Interpretación y Cognición)**
Manipulación de evaluaciones cognitivas, framing informativo, emociones y patrones de pensamiento. Incluye el sesgo de autoridad (aceptar narrativas de figuras percibidas como autoridades sin cuestionarlas) y el efecto de recencia (priorizar conocimiento reciente sobre datos históricos verificables).

**Estrato 3 — Nivel Social (Cohesión y Tejido Democrático)**
Fractura de narrativas compartidas, weaponización de la identidad, generación de "caos epistémico". El análisis evalúa cómo los artículos emplean tácticas de segmentación para profundizar la polarización entre endogrupo (in-group) y exogrupo (out-group).

### 1.3 Taxonomía Completa de Técnicas de Manipulación

La investigación en neurociencia cognitiva y NLP computacional documenta al menos 47 técnicas de manipulación semántica. Las principales, organizadas por sistema de activación:

**Sistema Límbico (Manipulación Emocional):**
- **Fear-mongering:** Activa la amígdala antes de que la corteza prefrontal evalúe la información. Titulares como "Colombia al borde del colapso" generan un bolo de cortisol que sesga la interpretación de todo el artículo siguiente
- **Moral outrage engineering:** Indignación moral deliberada para activar el sistema de identidad grupal, haciendo que el lector comparta antes de analizar
- **Nostalgia weaponization:** Referencias al pasado idealizado para crear contraste negativo con el presente, distorsionando la evaluación temporal
- **Dopamine-bait headlines:** Estructuras de titular diseñadas para activar anticipación de recompensa (clickbait cognitivo)
- **Fear + hope oscillation:** Alternancia calculada entre amenaza extrema y solución simple para crear dependencia emocional del medio

**Sistema Racional (Manipulación Cognitiva):**
- **Framing effect:** La misma estadística como "90% de éxito" vs. "10% de fracaso" activa regiones cerebrales diferentes y produce decisiones distintas
- **Anchoring bias exploitation:** El primer dato en un artículo ancla toda evaluación posterior — los medios colocan cifras extremas en los primeros párrafos deliberadamente
- **False dichotomy creation:** Reducir problemas multidimensionales a dos opciones binarias elimina el pensamiento sistémico
- **Illusory truth effect:** La repetición de afirmaciones, incluso marcadas como falsas, incrementa su credibilidad percibida
- **Sesgo de autoridad:** Presentar fuentes como más autorizadas de lo que son para activar deferencia automática
- **Efecto de recencia:** Estructurar artículos para que la información más reciente (más favorable a la narrativa) sea la que más pesa en la evaluación del lector

**Nivel Sistémico (Manipulación de Narrativa):**
- **Agenda setting:** Controlar QUÉ se cubre, no necesariamente cómo, para que el público perciba esos temas como los "más importantes"
- **Dog whistle rhetoric:** Frases codificadas que activan respuestas condicionadas en grupos específicos sin ser detectables por audiencias generales
- **Manufactured consensus:** Citar solo fuentes que confirman una posición para crear apariencia de unanimidad
- **Source laundering:** Citar una fuente sesgada como si fuera neutral para dar legitimidad sin verificación
- **Strategic omission:** Qué no se dice es frecuentemente más manipulador que lo que sí se dice
- **Astroturfing:** Crear apariencia de movimiento orgánico a través de cuentas o publicaciones coordinadas

**Técnicas Neurolingüísticas:**
- **Nominalization:** Convertir procesos en entidades ("la violencia crece" en lugar de "el grupo X hizo Y") elimina responsabilidad y agente
- **Presupposition embedding:** Afirmaciones no demostradas insertas como presupuestos gramaticales ("¿Cuándo dejó el gobierno de proteger a los ciudadanos?")
- **Emotional intensifiers:** Palabras de alta valencia emocional en contextos neutros para contaminar emocionalmente la narrativa
- **Ad hominem:** Atacar la reputación del sujeto en lugar de sus argumentos
- **Distracción del núcleo:** Desviar el debate hacia detalles periféricos para evitar la discusión del punto central
- **Falsa equivalencia:** Presentar dos posiciones de peso muy diferente como igualmente válidas

**Neuromarketing Algorítmico (Técnicas de 2026):**
- **Biometric-optimized copy:** Texto redactado usando retroalimentación de EEG, eye-tracking y respuesta galvánica de la piel para maximizar activación y retención. El sistema realiza *ingeniería inversa* de estas optimizaciones escaneando las firmas léxicas y estructurales que las delatan
- **Micro-targeted emotional triggers:** Variantes del mismo artículo optimizadas para diferentes perfiles psicográficos
- **Engagement-bait structuring:** Estructura del artículo diseñada algorítmicamente para maximizar tiempo de lectura y probabilidad de compartir, no para informar

---

## 2. Arquitectura Técnica Maestra

### 2.1 Visión General: Sistema Híbrido Nube + Dispositivo

La innovación arquitectónica central de VeritasAI es la adopción de un **modelo de inferencia híbrido** que combina lo mejor de dos paradigmas:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE INGESTA DISTRIBUIDA                      │
│  GDELT 2.0 (global, ilimitado) + NewsAPI + RSS Universal               │
│  + P2P Collaborative Crawling Network (usuarios como nodos)             │
│  + AT Protocol Federation (medios con DID criptográfico)                │
│  Geolocalización IP → País → Idioma → Contexto cultural local          │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────────┐
│                    CAPA DE INTEGRIDAD CRIPTOGRÁFICA                      │
│  Verificación por regla de mayoría (P2P nodes) → Hash del artículo     │
│  Registro en Certificate Transparency / estructura blockchain           │
│  AT Protocol: firma DID del medio + procedencia digital C2PA           │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
         ┌─────────────────┴────────────────┐
         │                                  │
         ▼                                  ▼
┌─────────────────────┐         ┌──────────────────────────┐
│  VÍA SERVIDOR       │         │  VÍA DISPOSITIVO (EDGE)  │
│  (artículos nuevos  │         │  (artículos sensibles    │
│  o virales)         │         │  o modo privacidad)      │
│                     │         │                          │
│  Motor multi-agente │         │  WebLLM + WebGPU         │
│  en la nube         │         │  SLMs comprimidos 4-bit  │
│  (Fan-out/Fan-in)   │         │  100% local, sin APIs    │
│                     │         │                          │
│  Groq + Gemini +    │         │  SmolLM2 → Phi-3.5-mini │
│  Cerebras (gratis)  │         │  Funciona offline        │
└──────────┬──────────┘         └───────────┬──────────────┘
           │                                │
           └─────────────┬──────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────────────┐
│                         MOTOR DE SCORING UNIFICADO                       │
│  VeritasScore™ (0-100) · Compuesto · Auditado · Transparente           │
│  CRED-1 dataset · Grafo de hipervínculos · JTI/Trust Project           │
│  Perfil dinámico del medio · Perfil del periodista · Intención inferida │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────────────┐
│                       GENERACIÓN DE ARTEFACTOS                           │
│  Noticia neutralizada · Técnicas explicadas con citas textuales         │
│  Agentic Knowledge Graph · Landscape of Thoughts · Fuentes alternativas │
│  Cadena de pensamiento editable por el usuario · Perfil del medio vivo  │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                              │
│  PWA Mobile-First · Glassmorphism 2.0 · Animaciones fluidas             │
│  Interactive Reasoning UI · Chatbot Socrático · Dashboard de medios     │
│  Modo offline (Service Worker) · Resultados progresivos (streaming)     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 El Router de Decisión: ¿Nube o Dispositivo?

El sistema toma una decisión inteligente en cada solicitud de análisis:

```python
def routing_decision(article, user_context):
    """
    Lógica de routing híbrido.
    Prioridad: cache > dispositivo (si aplica) > nube
    """
    
    # 1. Check cache primero (>80% de requests son cache hits)
    if cache.exists(article.url_hash):
        return serve_from_cache(article.url_hash)
    
    # 2. ¿El usuario activó modo privacidad o está offline?
    if user_context.privacy_mode or not user_context.online:
        return route_to_edge(article)
    
    # 3. ¿El artículo involucra información personal sensible?
    # (ej. usuario analizó un artículo sobre su propia empresa)
    if article.sensitivity_score > THRESHOLD_SENSITIVE:
        return route_to_edge(article)
    
    # 4. ¿El dispositivo tiene capacidad suficiente para el análisis?
    if user_context.device_gpu_capable and user_context.ram_available_gb >= 4:
        return route_to_edge(article)  # Preferir edge para privacidad
    
    # 5. Default: nube con router inteligente de APIs gratuitas
    return route_to_cloud(article)
```

**Por qué este diseño es superior a elegir uno u otro:**
- Los artículos virales (los más importantes de analizar) se procesan una vez en nube y el cache sirve a millones de usuarios
- Los artículos de interés personal o sensible nunca salen del dispositivo del usuario
- El sistema degrada graciosamente: si todas las APIs de nube están en sus límites, el análisis on-device continúa funcionando

### 2.3 Arquitectura Multi-Agente: Fan-Out / Fan-In (Vía Nube)

A diferencia de una cascada secuencial, el sistema emplea un **enjambre de agentes paralelos** para máxima velocidad y especialización limpia:

```
Artículo recibido
       │
       ▼
┌──────────────────────────────────────────┐
│  DISPATCHER (SmolLM2 via Groq — 100ms)  │
│  · Clasifica el tipo de pieza           │
│    (noticia / editorial / análisis /    │
│     publicidad disfrazada / opinión)    │
│  · Fragmenta el artículo en chunks      │
│  · Determina idioma y contexto cultural │
│  · Activa los agentes relevantes        │
└──────────────────┬───────────────────────┘
                   │
    ┌──────────────┼──────────────────┐
    │              │                  │
    ▼              ▼                  ▼
┌────────┐   ┌──────────┐   ┌─────────────────┐
│AGENTE  │   │AGENTE    │   │AGENTE DE        │
│DE      │   │SEMÁNTICO-│   │AUTORIDAD E      │
│HECHOS  │   │EMOCIONAL │   │HISTORIA         │
│        │   │          │   │                 │
│Evalúa  │   │Mapea     │   │Cruza autor/     │
│claims  │   │técnicas  │   │medio con CRED-1,│
│fácticos│   │de neuro- │   │BABE dataset,    │
│vs.     │   │marketing │   │grafo de hyper-  │
│grafos  │   │Identifica│   │vínculos y JTI.  │
│de      │   │adjetivos │   │Detecta conflictos│
│conocim.│   │polariz., │   │de interés y     │
│y Wiki  │   │cebos de  │   │historial de     │
│        │   │ira,      │   │correcciones     │
│        │   │ansiedad  │   │                 │
└────┬───┘   └─────┬────┘   └────────┬────────┘
     │             │                  │
     └─────────────┼──────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  AGENTE COLECTOR — SÍNTESIS (Llama-3.3 70B) │
│  · Consolida evaluaciones paralelas         │
│  · Resuelve contradicciones entre agentes  │
│    mediante fusión lógica ponderada         │
│  · Genera el informe final unificado        │
│  · Produce la noticia neutralizada          │
│  · Calcula el VeritasScore™ final           │
└──────────────────────────────────────────────┘
```

**Agentes adicionales activados condicionalmente:**

- **Agente de Omisión:** Solo se activa cuando el Dispatcher detecta cobertura parcial. Compara el artículo contra las coberturas de la misma noticia en otras fuentes (vía GDELT) para identificar qué se omitió deliberadamente
- **Agente de Coordinación:** Detecta astroturfing — si la misma narrativa exacta aparece en múltiples medios aparentemente independientes en ventanas de tiempo cortas, este agente calcula la probabilidad de coordinación
- **Agente Cultural:** Para artículos sobre Colombia, Venezuela, México, etc., carga contexto cultural específico en el system prompt. Una frase en Colombia puede tener connotaciones radicalmente diferentes que en España

### 2.4 Arquitectura On-Device: WebLLM + WebGPU (Vía Dispositivo)

Para usuarios con modo privacidad activado o dispositivos capaces, el análisis ocurre completamente localmente en el navegador:

**Stack de ejecución local:**
- **WebLLM** como motor de inferencia (JavaScript, acceso a WebGPU)
- **WebAssembly (WASM)** para tareas estructuradas y análisis de expresiones regulares
- **Web Workers** para procesamiento en background sin bloquear la UI
- Modelos en formato cuantizado (q4f16_1) para reducción de VRAM sin pérdida catastrófica de capacidad

**Catálogo de modelos SLM por función:**

| Modelo | Parámetros | VRAM Requerida | Función en VeritasAI |
|--------|-----------|----------------|----------------------|
| SmolLM2-360M | 360M | ~130 MB | Dispatcher: clasificación inicial y fragmentación |
| Llama-3.2-1B-Instruct | 1B | ~900 MB | Extracción de entidades, resumen fáctico, normalización |
| Gemma-2-2B | 2B | ~2 GB | Cruce de fuentes, contradicciones semánticas, omisiones |
| Phi-3.5-mini | 3.8B | ~3.7 GB | Razonamiento lógico profundo, auditoría de heurísticas complejas |

**Estrategia de degradación graceful por dispositivo:**
- Gama alta (≥8GB VRAM): Pipeline completo on-device con Phi-3.5-mini
- Gama media (4-8GB): Gemma-2-2B para análisis, SmolLM2 para clasificación
- Gama baja (<4GB) o sin GPU: Routing automático a nube con privacidad básica activada
- Sin conexión: Análisis reducido on-device con los modelos disponibles descargados

**Garantía de privacidad:** En modo on-device, **cero texto del usuario sale del dispositivo**. Las APIs de nube no reciben ningún fragmento del artículo analizado.

### 2.5 Cascada de APIs Gratuitas: El Router Inteligente

Para los análisis que van a la nube, el sistema implementa un router que maximiza el aprovechamiento de tier gratuitos:

```python
PROVIDER_PRIORITY = [
    {
        "provider": "groq",
        "model": "llama-3.3-70b-versatile",
        "daily_limit": 500_000,  # tokens/día
        "speed": "500+ tokens/seg",
        "priority": 1  # más rápido y confiable
    },
    {
        "provider": "cerebras",
        "model": "llama-3.1-70b",
        "daily_limit": 1_000_000,  # tokens/día
        "speed": "ultra-rápido",
        "priority": 2  # backup principal
    },
    {
        "provider": "google_ai_studio",
        "model": "gemini-2.0-flash",
        "daily_limit": "1,500 req/día",
        "speed": "rápido",
        "priority": 3
    },
    {
        "provider": "openrouter",
        "model": "rotating_free_models",
        "daily_limit": "variable",
        "speed": "variable",
        "priority": 4
    },
    {
        "provider": "ollama_local",
        "model": "llama3.3:70b",
        "daily_limit": "ilimitado (local)",
        "speed": "hardware-dependiente",
        "priority": 5  # último recurso servidor propio
    }
]
```

El router trackea el consumo en tiempo real y rota automáticamente cuando un proveedor se acerca a su límite diario. Con 5 proveedores en rotación, el sistema tiene efectivamente capacidad ilimitada a costo cero.

---

## 3. Integridad, Descentralización y Procedencia Digital

### 3.1 El Problema de Confianza en la Ingesta Distribuida

Si el contenido es extraído y procesado en una red distribuida, surge la pregunta crítica: ¿cómo sabe el usuario que el artículo analizado no fue modificado entre la fuente original y el análisis? Esta es la brecha que la arquitectura descentralizada introduce y que debe resolverse criptográficamente.

### 3.2 AT Protocol: Identidad Federada de Medios

Cada medio de comunicación en VeritasAI recibe un **Identificador Descentralizado permanente (DID)** vinculado a claves criptográficas únicas. Los artículos y sus metadatos se agrupan en repositorios de datos firmados digitalmente siguiendo la especificación del AT Protocol.

Componentes de la red federada:
- **Personal Data Servers (PDS):** Alojan los repositorios de artículos firmados
- **Relays:** Transmiten el flujo masivo de eventos en tiempo real via WebSocket
- **App Views:** Construyen la perspectiva filtrada y procesada para el consumidor final

Beneficios concretos:
- El contenido es **auto-certificable** — un medio no puede negar que publicó algo
- Los DIDs persisten incluso si el medio cambia de servidor físico
- Ningún monopolio corporativo puede controlar el flujo de la verdad mediante control de infraestructura
- Los usuarios mantienen el control sobre sus suscripciones informativas

### 3.3 Verificación Blockchain por Regla de Mayoría

Para artículos de alto impacto, el proceso de ingesta sigue un protocolo de verificación distribuida:

```
URL de artículo de alto impacto detectada
                │
                ▼
   3-5 nodos P2P aleatorios extraen el artículo
   de forma independiente
                │
                ▼
   Algoritmo de regla de mayoría compara extracciones
   (tolerancia estricta del ≤2% de diferencia)
                │
        ┌───────┴──────────┐
        │                  │
     MAYORÍA            DISCORDANCIA
     ALCANZADA          DETECTADA
        │                  │
        ▼                  ▼
   Se genera el hash     Flag manual +
   SHA-256 del artículo  revisión humana
        │
        ▼
   Hash almacenado en Certificate Transparency
   o estructura blockchain ligera
        │
        ▼
   Cualquier auditor independiente puede verificar
   que el análisis se realizó sobre el artículo
   original sin alterar
```

**Valor adicional del hash blockchain:** Permite construir un mapa forense de propagación — identificar los "pacientes cero" (sitios o cuentas) que inician y diseminan campañas sistemáticas de desinformación. Esto convierte a VeritasAI en una herramienta de inteligencia de amenazas para investigadores y periodistas.

### 3.4 Estándar C2PA para Contenido Multimedia

Para artículos con imágenes o video incrustado, el sistema verifica la procedencia multimedia usando el estándar **Coalition for Content Provenance and Authenticity (C2PA)**. Esto permite detectar imágenes manipuladas digitalmente que las herramientas de detección tradicionales no capturan.

### 3.5 Red P2P de Crawling: Resistencia a la Censura

Los usuarios que instalan la extensión de browser o la PWA pueden optar por asignar una fracción marginal de su ancho de banda inactivo para convertirse en nodos de crawling colaborativo:

- Las tareas de rastreo se fragmentan de manera determinista entre nodos disponibles
- Cada nodo ejecuta comandos ligeros para extraer titulares, metadatos y contenido textual
- Esto elimina costos de servidores dedicados de scraping y servicios de proxy comerciales
- La arquitectura distribuida hace el sistema **intrínsecamente resistente a censura** — no hay servidor central que bloquear

Si un gobierno presiona a Railway o Render para dar de baja el servidor backend, el crawling P2P continúa funcionando de forma autónoma. La ingesta no puede ser censurada.

---

## 4. Sistema de Scoring: VeritasScore™ Mejorado

### 4.1 Arquitectura del Score Compuesto

El VeritasScore es una métrica de 0-100 que integra múltiples dimensiones. Cada componente tiene base en investigación cognitiva, computacional y en datos estructurales de terceros:

```
VeritasScore™ = (
    0.22 × Emotional_Manipulation_Index     [EMI]
    0.18 × Factual_Accuracy_Score           [FAS]
    0.18 × Source_Bias_Index                [SBI]
    0.12 × Narrative_Framing_Score          [NFS]
    0.10 × Omission_Detection_Score         [ODS]
    0.10 × Language_Manipulation_Score      [LMS]
    0.06 × Source_Credibility_Prior         [SCP]  ← NUEVO: CRED-1 + grafo
    0.04 × Coordination_Signal_Score        [CSS]  ← NUEVO: astroturfing
)
```

**Descripción de componentes nuevos:**

**Source Credibility Prior (SCP) — Contribución de datos estructurales:**
En lugar de construir la credibilidad del medio desde cero (cold start problem), el sistema inicializa el SCP con datos del dataset CRED-1 (2,672 dominios puntuados de 0-1) y del análisis de grafo de hipervínculos. Si un medio nuevo no está en CRED-1, el grafo de vínculos revela sus conexiones: medios que enlazan consistentemente hacia nodos categorizados como propaganda bajan su prior automáticamente.

**Coordination Signal Score (CSS) — Detección de astroturfing:**
Mide la probabilidad de que el artículo sea parte de una campaña coordinada. Señales que activan este score:
- La misma narrativa aparece en múltiples medios en ventana de <2 horas
- Estructura de titular y párrafo inicial casi idéntica entre medios aparentemente independientes
- Picos de publicación de artículos temáticamente similares no justificados por el evento real

**Interpretación del score:**
- **0-20:** Artículo mayoritariamente neutral y verificable
- **21-40:** Sesgo leve, técnicas menores de framing detectadas
- **41-60:** Manipulación moderada, técnicas identificables y documentadas
- **61-80:** Manipulación severa, múltiples técnicas documentadas, score de credibilidad del medio bajo
- **81-100:** Propaganda activa o desinformación deliberada — posible campaña coordinada

### 4.2 Fuentes de Datos para el Scoring

**Datasets académicos integrados:**

| Dataset | Descripción | Uso en VeritasAI |
|---------|-------------|-----------------|
| **SemEval 2020 Task 11 (PTC)** | 18 técnicas de propaganda clasificadas a nivel de fragmento | Training y validación del agente semántico-emocional |
| **BABE dataset** | Anotación de sesgo a nivel de oración por expertos | Fine-tuning de clasificadores para detectar parcialidad de autores |
| **CRED-1** | 2,672 dominios con puntuación de credibilidad (0-1) | Source Credibility Prior para cold start |
| **LIAR dataset** | 12,800 declaraciones verificadas por PolitiFact | Validación del agente de hechos |
| **FakeNewsNet** | Noticias falsas verificadas con contexto social | Benchmark del sistema completo |
| **Da San Martino et al. (2020)** | Taxonomía de referencia de propaganda fine-grained | Catálogo de técnicas del sistema |

**Servicios de credibilidad integrados:**
- **Media Bias/Fact Check:** Clasificación independiente de sesgo político de medios
- **Ad Fontes Media Bias Chart (2026):** 137+ fuentes puntuadas en fiabilidad y sesgo
- **Journalism Trust Initiative (JTI):** Métricas de transparencia periodística
- **The Trust Project:** Indicadores de confianza periodística granulares
- **OpenSources:** Base de datos de sitios de desinformación categorizados

### 4.3 Perfiles Dinámicos de Medios y Periodistas

**Perfil del Medio:**
Cada medio acumula historial en tiempo real basado en todos los artículos procesados:
- Credibility Trend: Gráfica temporal de VeritasScore promedio (¿mejoran o empeoran?)
- Técnicas más usadas: Heatmap de frecuencia de técnicas
- Sesgo político: Espectro visual izquierda-derecha basado en análisis léxico longitudinal
- Temas de agenda dominantes: Qué sobreamplifican o ignoran sistemáticamente
- Comparativa nacional: Posicionamiento vs. otros medios del mismo país
- Alert level: Verde / Amarillo / Naranja / Rojo
- **Hyperlink graph position:** Dónde se ubica el medio en la red de vínculos (¿enlaza a fuentes confiables o a nodos de propaganda?)

**Perfil del Periodista:**
- Score histórico promedio de sus artículos
- Técnicas recurrentes en su escritura
- Temáticas donde tiende a ser más sesgado
- Historial de correcciones o desmentidos publicados
- **Resolución del cold start:** Para periodistas nuevos, el sistema inicializa el perfil con el score del medio donde publican y aplica el prior del BABE dataset basado en estilo léxico del primer artículo. No hay "periodista sin perfil".

---

## 5. Stack Tecnológico Completo a Costo Cero

### 5.1 APIs de Ingesta de Noticias

| Servicio | Cobertura | Límite Gratis | Uso en Sistema |
|----------|-----------|---------------|----------------|
| **GDELT 2.0 DOC API** | Global, 100+ países | Ilimitado (BigQuery) | Fuente primaria global, 400K artículos/día, 65+ idiomas |
| **NewsAPI.org** | 80,000+ fuentes | 100 req/día (dev) | Cobertura de medios anglófonos específicos |
| **The Guardian API** | Alta calidad editorial | 500 req/día | Periodismo de referencia internacional |
| **GNews API** | Global | 100 req/día | Cobertura regional adicional |
| **RSS Universal** | Cualquier fuente | Ilimitado | Medios latinoamericanos directamente |
| **Common Crawl** | Archivo web histórico | Ilimitado | Validación retrospectiva y context histórico |
| **Newspaper4k** | Python, 80+ idiomas | Ilimitado (local) | Extracción rápida de artículos individuales |
| **Firecrawl (OSS)** | Sitios dinámicos | Ilimitado (self-hosted) | Sitios con JavaScript que no exponen RSS |

### 5.2 LLMs Gratuitos — Arquitectura de Rotación

| Proveedor | Modelos Gratuitos | Límite Diario | Velocidad | Prioridad |
|-----------|------------------|---------------|-----------|-----------|
| **Groq** | Llama-3.3-70B, DeepSeek-R1-70B, Gemma2-9B, Mistral-Saba | 500,000 tokens | 500+ tok/seg | 1 |
| **Cerebras** | Llama-3.1-70B | 1,000,000 tokens | Ultra-rápido | 2 |
| **Google AI Studio** | Gemini 2.0 Flash, Gemini 2.5 | 1,500 req/día | Rápido | 3 |
| **OpenRouter** | 50+ modelos rotando | Variable | Variable | 4 |
| **Hugging Face** | BERT, RoBERTa, modelos especializados | 30,000 tokens/mes | Variable | Modelos especializados |
| **Ollama (local)** | Cualquier modelo open source | Ilimitado | Hardware-dep. | Fallback servidor |

**Total de capacidad diaria combinada (gratuita):** ~2.5 millones de tokens/día antes de tocar Ollama. Suficiente para aproximadamente 2,500 análisis completos por día en el arranque — más que suficiente para un MVP y la mayoría de los artículos virales se cachean de todas formas.

### 5.3 APIs de Soporte Gratuitas

| Función | Herramienta | Límite |
|---------|-------------|--------|
| Geolocalización IP | `ip-api.com` | 1,000 req/min |
| Detección de idioma | `langdetect` (Python) | Ilimitado local |
| Fact-checking semántico | Wikipedia REST API | Ilimitado |
| Búsqueda de fuentes alternativas | Brave Search API | 2,000 req/mes |
| Similitud semántica y embeddings | `sentence-transformers` (local) | Ilimitado |
| NLP avanzado | spaCy, HuggingFace Transformers | Ilimitado local |
| Análisis de sentimiento | `cardiffnlp/twitter-roberta-base-sentiment` | Ilimitado (HF) |
| Detección de propaganda | Modelos SemEval 2020 fine-tuned | Ilimitado (HF) |
| Metadata de dominio | Whois API (free tier) | 500 req/mes |

### 5.4 Infraestructura Gratuita

| Componente | Solución | Límites y Notas |
|------------|----------|-----------------|
| **Frontend Hosting** | Vercel | Ilimitado (proyectos OSS) |
| **Backend API** | Railway | $5/mes crédito gratis incluido |
| **Base de datos** | Supabase (PostgreSQL) | 500MB gratis, escala a $25/mes |
| **Cache/Redis** | Upstash Redis | 10,000 req/día gratis |
| **Cola de tareas** | Supabase Edge Functions | Incluido |
| **CDN** | Cloudflare (free tier) | Ilimitado |
| **Vector DB (RAG)** | Chroma (OSS local) | Ilimitado |
| **Auth** | Supabase Auth | 50,000 MAU gratis |
| **Monitoreo** | Grafana Cloud | Gratis para OSS |
| **Logs** | Logtail (free tier) | 1GB/mes |
| **Búsqueda full-text** | Meilisearch (OSS self-hosted) | Ilimitado |

### 5.5 Stack de Desarrollo

**Backend:**
- **Framework:** FastAPI (Python) — ecosistema de ML/NLP superior
- **Orquestación de agentes:** LangGraph (flujos jerárquicos controlables) + CrewAI (prototipos multi-agente)
- **Cola de tareas:** Celery + Redis (Upstash) para análisis asíncrono
- **NLP local:** spaCy, Hugging Face Transformers, sentence-transformers
- **Gestión de LLMs:** LiteLLM (router unificado para todos los proveedores)

**Frontend:**
- **Framework:** Next.js 15 (React) con App Router
- **Styling:** Tailwind CSS v4 + Radix UI para componentes accesibles
- **Estado:** Zustand (ligero) + React Query (cache de datos)
- **Charts:** Recharts (libre, React-native)
- **3D/Visualizaciones:** Three.js (Landscape of Thoughts) + D3.js
- **PWA:** next-pwa + Service Worker manual para control fino
- **Streaming:** Vercel AI SDK (soporte nativo para streaming de respuestas)
- **Animaciones:** Framer Motion (micro-animaciones fluidas)
- **WebLLM:** `@mlc-ai/web-llm` para inferencia on-device

---

## 6. UX/UI: Razonamiento Interactivo y la Estética de la Verdad

### 6.1 Filosofía de Diseño

El sistema neuronal más sofisticado del mundo fracasa en su objetivo democrático si su interfaz resulta densa, punitiva o alienante para el usuario casual. Cada decisión de UX debe cumplir dos condiciones simultáneas: (1) estar fundamentada en neurociencia cognitiva y (2) generar la experiencia estética de un producto de referencia mundial.

Los principios rectores del diseño:

**Principio 1 — Carga Cognitiva Progresiva (Miller's Law):** El cerebro humano solo procesa 4±1 chunks de información simultáneamente. La interfaz revela información en capas, nunca todo a la vez.

**Principio 2 — Atención Dirigida (Z-scan/F-scan):** El VeritasScore se ubica en la esquina superior derecha de cada tarjeta — donde el ojo llega en el tercer punto del Z-scan. El color del score es el único elemento de alta saturación en la pantalla; todo lo demás es tono bajo para no competir.

**Principio 3 — Señalética Emocional Controlada:** El rojo indica alta manipulación, pero siempre acompañado de texto explicativo. La interfaz no puede manipular al usuario en el proceso de enseñarle sobre manipulación — trampa en la que muchos productos de fact-checking caen.

**Principio 4 — Agencia Real del Usuario:** No solo "ver la cadena de pensamiento" sino **editarla**. La sensación de control aumenta la confianza y el aprendizaje cognitivo real. El usuario que modifica un nodo de razonamiento aprende más que el que solo lo lee.

**Principio 5 — Glassmorphism 2.0:** Los paneles de análisis flotan sobre el cuerpo del artículo original como vidrio translúcido. La arquitectura anti-sesgo nunca oculta ni censura el documento nativo — preserva el contexto histórico completo mientras superpone la capa analítica.

### 6.2 Componentes UI Principales

**Card de Noticia (Tres estados progresivos):**

```
┌──────────────────────────────────────────────────┐
│ [Imagen]                          VeritasScore   │
│                                      ╔══════╗   │
│                                      ║  73  ║   │
│                                      ║ 🔴   ║   │
│                                      ╚══════╝   │
│ TITULAR ORIGINAL                                 │
│ "Gobierno destruye economía colombiana"          │
├──────────────────────────────────────────────────┤
│ TITULAR NEUTRALIZADO                             │
│ "PIB colombiano creció 1.2% vs 2.8% proyectado" │
├──────────────────────────────────────────────────┤
│ ⚡ 3 técnicas detectadas                         │
│ • Fear-mongering  • Hipérbole  • Omisión         │
│                                                  │
│ [Análisis completo]  [Modo privacidad 🔒]        │
└──────────────────────────────────────────────────┘
```

**Panel de Análisis Completo — Interactive Reasoning:**

El paradigma central rompe la opacidad de los algoritmos. Cuando el usuario abre el análisis completo ve:

1. **Artículo original** con highlighting de frases problemáticas (código de color por tipo de técnica)
2. **Agentic Knowledge Graph:** Un mapa jerárquico superpuesto al artículo que muestra el razonamiento del sistema. Si la IA asume "el periodista actuó con sesgo deliberado", el usuario puede hacer click en ese nodo, ver la evidencia, y ajustar el umbral de evidencia requerida. La IA recalcula toda la cadena lógica en tiempo real
3. **Noticia neutralizada:** El mismo artículo reescrito con lenguaje neutral, mismos hechos, sin técnicas manipuladoras
4. **Explicación educativa:** "¿Por qué esto es manipulación?" con analogías accesibles y referencias a la técnica específica del catálogo académico
5. **Landscape of Thoughts:** Mapa topográfico 2D (t-SNE) del proceso de validación — zonas azules = razonamiento sólido, zonas rojas = falacias o carga emocional. Visualmente intuible para cualquier usuario
6. **Contexto adicional:** 3-5 fuentes que cubren el mismo hecho de manera diferente
7. **Chatbot Socrático** (ver sección 6.3)

**Gradientes de Confianza Predictiva:**
Los textos sospechosos se iluminan con gradientes que indican la certeza del sistema. Al pasar el cursor o hacer tap, cargas esqueléticas fluidas revelan etiquetas epistémicas precisas como "Generalización Apresurada detectada" o "Párrafo anclado a Sesgo de Confirmación".

**Dashboard de Medios:**
- Ranking de medios nacionales por credibilidad con gráfica de tendencia temporal
- Mapa de calor de técnicas por medio (¿cuál usa más fear-mongering?)
- **Media Bias Chart interactivo:** Inspirado en Ad Fontes pero fluido y centrado en el usuario — visualiza cada medio en un eje X (sesgo político izquierda-derecha) vs. eje Y (rigor periodístico: fabricación → análisis verificado)
- Timeline comparativo de cobertura del mismo evento por múltiples medios
- Filtros: Por país, tema, período, tipo de manipulación, nivel de alerta

### 6.3 El Chatbot Socrático

La diferencia entre un chat genérico y un chatbot socrático no es técnica — es pedagógica. El chatbot no proporciona respuestas deterministas simplificadas. Adopta el método socrático: planta interrogantes reflexivas y no confrontacionales que activan la metacognición del usuario.

**Ejemplo de interacción socrática vs. genérica:**

❌ Chat genérico:
> Usuario: "¿Este artículo está manipulando?"  
> IA: "Sí, el artículo usa fear-mongering y omisión de contexto."

✅ Chatbot socrático:
> *"Noté que el titular se enmarcó usando sustantivos que frecuentemente inducen urgencia y hostilidad — ¿este tono se alinea con la neutralidad de los datos empíricos mostrados en el párrafo cuatro?"*

> *"El artículo cita tres fuentes que comparten la misma narrativa. ¿Qué perspectivas crees que podrían estar ausentes aquí?"*

> *"El verbo 'destruir' que usa el titular activa una respuesta de amenaza inmediata. ¿Cambiaría tu lectura del artículo si el titular dijera 'ralentizar' o 'afectar'?"*

Este compromiso dialógico transforma la educación mediática de un ejercicio teórico a un adiestramiento empírico en vivo, fortaleciendo la resistencia emocional contra el contagio del miedo sistémico.

**System prompt del chatbot socrático (fragmento):**
```
Eres un tutor de pensamiento crítico, no un árbitro de la verdad. 
Tu objetivo no es decirle al usuario qué pensar, sino 
preguntarle qué nota. Usa el método socrático: haz preguntas 
que señalen hacia la evidencia sin dictaminar conclusiones.
Nunca presentes tu análisis como "La Verdad™". 
Siempre indica tu nivel de confianza y los límites del análisis.
Cuando el usuario esté emocionalmente activado (señales de indignación 
o miedo en sus mensajes), primero valida la emoción, luego introduce 
la pregunta crítica. No confrontes directamente la reacción emocional.
```

### 6.4 Experiencia Mobile-First y PWA

La app es una **Progressive Web App** que funciona como app nativa sin app store:
- Instalable desde el navegador (Add to Home Screen)
- Funciona offline para artículos ya analizados (Service Worker + IndexedDB)
- Push notifications para alertas de alta manipulación en medios específicos
- Gesto de swipe para comparar versión original vs. neutralizada
- Modo de lectura rápida: solo score + técnicas principales (para usuarios en contexto de consumo rápido)
- **Modo oscuro adaptativo:** El Glassmorphism 2.0 funciona en modo oscuro donde los paneles son especialmente impactantes visualmente

### 6.5 Resultados Progresivos — Arquitectura de Streaming

El análisis completo tarda 8-15 segundos. El usuario moderno espera resultados en 2-3 segundos. La solución:

```
Artículo seleccionado
       │
       ├─── 0-500ms: Score inicial (Dispatcher + agente emocional rápido)
       │    → Mostrar VeritasScore preliminar con indicador "analizando..."
       │
       ├─── 500ms-2s: Técnicas principales identificadas
       │    → Actualizar tarjeta con las 2-3 técnicas más prominentes
       │
       ├─── 2-5s: Análisis profundo completado (agentes paralelos)
       │    → Mostrar Knowledge Graph completo + explicaciones
       │
       └─── 5-10s: Verificación cruzada y noticia neutralizada
            → Completar el panel con fuentes alternativas y versión neutral
```

El usuario nunca espera mirando una pantalla en blanco. Cada etapa del análisis aparece con micro-animaciones fluidas estilo máquina de escribir (streaming text).

---

## 7. Arquitectura de Datos y Privacidad

### 7.1 Flujo de Datos con Privacidad por Diseño

```
Usuario accede
      │
      ├─ IP geolocalización → País/Idioma detectado (IP NO almacenada)
      │
      ├─ Feed personalizado por país/idioma servido
      │
      ├─ Usuario selecciona artículo
      │
      ├─ ¿Modo privacidad? → Sí → Análisis on-device (nada sale del dispositivo)
      │                    → No  → Cola de análisis cloud
      │
      ├─ ¿Artículo en cache? → Sí → Resultado instantáneo
      │                      → No  → Análisis completo → Resultado guardado en cache
      │
      └─ Resultado entregado al usuario
         (solo el análisis del artículo queda almacenado, nunca quién lo solicitó)
```

**Principios irrenunciables:**
- Sin cuenta obligatoria para la funcionalidad básica
- Sin almacenamiento de historial de lectura vinculado a usuario
- Solo se almacena el análisis del artículo (bien público), nunca la identidad del lector
- En modo on-device: cero transmisión de datos a terceros
- Transparencia total sobre qué datos se almacenan y por qué

### 7.2 Base de Datos (Supabase PostgreSQL)

**Tablas principales:**

```sql
-- Artículos y sus análisis
articles (
    id UUID PRIMARY KEY,
    url TEXT UNIQUE,
    url_hash TEXT UNIQUE,  -- Para cache lookup eficiente
    title TEXT,
    outlet_id UUID REFERENCES media_outlets(id),
    journalist_id UUID REFERENCES journalists(id),
    published_at TIMESTAMPTZ,
    veritas_score INTEGER,
    techniques_detected JSONB,
    blockchain_hash TEXT,  -- Hash de integridad criptográfica
    analysis_confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Perfiles de medios (actualizados dinámicamente)
media_outlets (
    id UUID PRIMARY KEY,
    name TEXT,
    domain TEXT UNIQUE,
    did TEXT UNIQUE,  -- AT Protocol DID
    country_code TEXT,
    cred1_score FLOAT,  -- Score inicial CRED-1
    current_veritas_avg FLOAT,
    articles_analyzed INTEGER,
    techniques_frequency JSONB,
    political_bias_score FLOAT,  -- -1 (izq) a +1 (der)
    alert_level TEXT,  -- green/yellow/orange/red
    hyperlink_graph_position JSONB,  -- Posición en la red de vínculos
    last_updated TIMESTAMPTZ
)

-- Perfiles de periodistas
journalists (
    id UUID PRIMARY KEY,
    name TEXT,
    outlet_id UUID REFERENCES media_outlets(id),
    articles_analyzed INTEGER,
    avg_veritas_score FLOAT,
    recurring_techniques JSONB,
    babe_style_score FLOAT,  -- Score de parcialidad estilística
    corrections_count INTEGER,
    last_updated TIMESTAMPTZ
)

-- Cache de análisis completo
analysis_cache (
    article_id UUID REFERENCES articles(id),
    full_analysis JSONB,  -- Knowledge graph, landscape, neutralized text
    cached_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    hit_count INTEGER DEFAULT 0
)

-- Catálogo de técnicas de manipulación
techniques_catalog (
    id UUID PRIMARY KEY,
    name TEXT,
    category TEXT,  -- emotional/cognitive/narrative/neurolinguistic/neuromarketing
    biopsychosocial_level TEXT,  -- biological/psychological/social
    academic_source TEXT,
    description TEXT,
    example TEXT,
    detection_prompt TEXT,  -- Prompt para el agente
    severity_weight FLOAT  -- Para el scoring
)

-- Feedback de usuarios para mejora continua
user_feedback (
    id UUID PRIMARY KEY,
    article_id UUID REFERENCES articles(id),
    feedback_type TEXT,  -- 'incorrect_analysis'/'missed_technique'/'false_positive'
    user_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
    -- Sin user_id — feedback anónimo
)
```

### 7.3 El Sistema de Cache Inteligente

El análisis más costoso (en tiempo y compute) se hace **una sola vez**. Después, cualquier usuario que acceda al mismo artículo recibe el análisis instantáneamente:

- Los artículos virales (los más leídos y más importantes de verificar) se analizan una vez y sirven a millones
- El costo marginal por usuario adicional es prácticamente cero después del primer análisis
- TTL del cache: 7 días para artículos normales, 30 días para artículos de alto impacto, indefinido para artículos históricos verificados
- Invalidación automática: si el artículo original es editado significativamente (detectado por diferencia de hash), el análisis se regenera

---

## 8. Modelo de Sostenibilidad: Free Forever

### 8.1 Por qué el Costo Cero es Estructuralmente Viable

1. **GDELT es gratuito e ilimitado** para fuentes de noticias — el motor de ingesta principal no tiene costo
2. **El cache multiplica el impacto sin multiplicar el costo** — 1 análisis sirve a 10,000 usuarios
3. **El router de LLMs distribuye la carga entre 5 proveedores gratuitos** — la capacidad combinada es suficiente para escala media
4. **La red P2P convierte a los usuarios en infraestructura** — el crawling se distribuye sin costo central
5. **La inferencia on-device transfiere el costo de compute al dispositivo del usuario** voluntariamente

### 8.2 Costos Reales en Producción

**Escenario: 10,000 usuarios activos diarios / 50,000 artículos analizados (con cache)**

| Componente | Costo Mensual |
|------------|---------------|
| Servidor Backend (Railway) | ~$10-20 |
| Base de datos (Supabase Pro) | $25 |
| CDN y Frontend (Vercel) | $0-20 |
| LLM APIs (exceso del tier gratis) | $0-50 |
| Redis Cache (Upstash) | $0-10 |
| Monitoreo (Grafana) | $0 |
| **TOTAL** | **~$35-125/mes** |

Para la utilidad social que provee, este costo es ridículamente bajo. Con 500 usuarios haciendo donaciones de $3/año el proyecto se autofinancia completamente.

### 8.3 Modelo de Ingresos Para Escalar Manteniendo el Core Gratuito

- **Grants institucionales:** Mozilla Foundation, Knight Foundation, Google News Initiative, Open Society Foundations financian exactamente este tipo de proyectos. El rigor académico del documento (65+ citas, base en investigación OTAN, datasets peer-reviewed) es la carta de presentación perfecta para estos fondos
- **API para desarrolladores:** Acceso programático al análisis — plan gratuito (100 req/mes) + planes de pago para alto volumen
- **Licencia a instituciones educativas:** Universidades, colegios, programas de media literacy (mercado enorme en Latinoamérica con política de alfabetización mediática creciente)
- **White-label para ONGs:** Versión personalizada para organizaciones de fact-checking como Colombiacheck, La Silla Vacía verificador, AFP Factual
- **Donaciones individuales:** Open Collective / GitHub Sponsors
- **Tier premium opcional:** Sin analíticas personales, sin historial — solo acceso a API de mayor velocidad y análisis prioritario de URLs personalizadas

---

## 9. Rigor Académico: El Estándar para Neurocientíficos

### 9.1 Base Académica Peer-Reviewed

El catálogo de técnicas no puede ser inventado — cada técnica documentada en el sistema tiene respaldo en investigación revisada por pares:

**Neurociencia Cognitiva:**
- **Kahneman (2011) — Thinking, Fast and Slow:** Fundamento del Sistema 1 vs. Sistema 2. La manipulación mediática opera primariamente sobre el Sistema 1 (rápido, emocional, automático)
- **Framing Theory (Entman, 1993):** Base teórica del framing mediático — cómo la selección y prominencia de ciertos aspectos de la realidad percibida promueven definiciones particulares del problema
- **Cialdini's Influence Principles (2021 ed.):** Los 7 principios de persuasión como framework de análisis de técnicas específicas

**NLP Computacional:**
- **Da San Martino et al. (2020) — "Fine-Grained Analysis of Propaganda in News Articles":** La taxonomía de referencia — 18 técnicas clasificadas a nivel de fragmento textual
- **SemEval 2020 Task 11 (Propaganda Techniques Corpus):** Primer dataset masivo de detección de propaganda, el benchmark estándar del campo
- **NLP4IF Workshop (ACL/EMNLP):** Investigación activa en detección de desinformación multilingüe
- **BABE dataset — Raza et al. (2022):** Fine-grained bias detection en noticias a nivel de oración

**Guerra Cognitiva y Defensa:**
- **NATO Chief Scientist Report on Cognitive Warfare (2026):** Marco biopsicosocial de 3 estratos adoptado en la arquitectura del sistema
- **Cognitive Warfare 2026 (INSS NDU):** Operacionalización de los conceptos OTAN para diseño de contramedidas

**Credibilidad Mediática:**
- **CRED-1 Dataset (2025):** 2,672 dominios puntuados con señales enriquecidas de credibilidad
- **Ad Fontes Media Bias Chart (2026):** Metodología de puntuación para sesgo y fiabilidad
- **Journalism Trust Initiative (JTI):** Estándares europeos de confianza periodística

### 9.2 Validación Continua del Modelo

Un sistema de nivel maestro no se construye y se olvida:

**Feedback loop activo:**
- Los usuarios pueden marcar análisis como incorrectos (feedback anónimo) → alimenta fine-tuning trimestral
- Los medios y periodistas pueden apelar clasificaciones mediante proceso documentado y público
- Las apelaciones exitosas se convierten en casos de entrenamiento para mejorar el sistema

**Benchmark público:**
- El sistema se evalúa contra datasets académicos estándar (LIAR, FakeNewsNet, PTC) y los resultados se publican trimestralmente
- Cualquier investigador puede auditar la metodología

**Red de expertos:**
- Alianzas con académicos de comunicación, lingüística, psicología cognitiva y ciencia política para validar el catálogo de técnicas
- Advisory board de neurocientíficos para validar las afirmaciones sobre mecanismos cerebrales

**Transparencia metodológica absoluta:**
- Todos los prompts del sistema son públicos
- El catálogo de técnicas con sus referencias académicas es público
- Los modelos fine-tuned generados se liberan bajo licencia open source
- Los pesos del VeritasScore™ y su justificación son públicos y discutibles por la comunidad

---

## 10. Edge Cases y Retos Técnicos Críticos

### 10.1 El Catálogo de Problemas Difíciles (Con Soluciones)

**El problema del sarcasmo:**
Los modelos de NLP tienen dificultad particular con el sarcasmo en español latinoamericano (que tiene formas muy idiomáticas). Un artículo que usa sarcasmo para *criticar* la manipulación podría malclasificarse como manipulador.
*Solución:* Capa dedicada de detección de sarcasmo (modelo fine-tuned en corpus de sarcasmo latinoamericano) + cuando la confianza es baja → flag de revisión con indicador "análisis incierto" visible al usuario.

**El problema de la opinión legítima:**
No toda opinión es manipulación. Un editorial tiene el derecho de tener perspectiva. El sistema no puede penalizar por tener posición.
*Solución:* El Dispatcher clasifica el tipo de pieza (noticia hard news / editorial / análisis de opinión / publicidad disfrazada de noticia) antes de activar los agentes. El scoring se ajusta según el formato — un editorial recibe un score de "sesgo de perspectiva", no de "manipulación", a menos que use técnicas activas de ingeniería emocional.

**El problema del contexto cultural fragmentado:**
El español colombiano, venezolano, mexicano y argentino tienen modismos y connotaciones radicalmente distintas. Una frase inofensiva en España puede ser un dog whistle en Colombia.
*Solución:* El Agente Cultural carga un system prompt con contexto específico del país detectado. A mediano plazo, fine-tuning de modelos con datos de GDELT filtrados por país. El sistema prioriza validación de colombianismos antes del lanzamiento en Colombia.

**El problema de los paywalls:**
Muchos medios premium tienen artículos detrás de paywalls. No podemos analizar lo que no podemos leer.
*Solución:* Solo analizar el fragmento accesible + metadatos + histórico del medio como prior. Ser explícitamente transparente sobre la limitación en la UI: "Análisis basado en contenido parcialmente accesible — la credibilidad del medio es [X]".

**El problema de la velocidad vs. profundidad:**
El análisis completo tarda 8-15 segundos. El usuario moderno abandona después de 3 segundos.
*Solución:* Arquitectura de resultados progresivos documentada en la sección 6.5 — score inicial en <500ms, análisis completo en streaming. El usuario nunca espera mirando nada.

**El problema del volumen masivo:**
GDELT procesa 400,000 artículos/día. Pre-analizar todo es imposible con recursos gratuitos.
*Solución:* Análisis bajo demanda + pre-análisis automático de los artículos más virales por país (top trending detectado vía GDELT's Tone/Theme scores). Los artículos de alta viralidad son exactamente los más urgentes de analizar.

**El problema del cold start para nuevos medios:**
Un medio nuevo sin historial recibe un score "sin datos" poco informativo.
*Solución:* CRED-1 cubre 2,672 dominios como prior inmediato. El grafo de hipervínculos da señal en el día 1 (con quién linkea ese dominio). Para los no cubiertos, el sistema analiza los primeros 5 artículos inmediatamente y construye el perfil preliminar.

**El problema adversarial: actores que intentan gaming:**
Un medio puede intentar jugar el sistema publicando artículos "limpios" por un período para mejorar su score, luego publicar desinformación de alto impacto cuando tenga buena reputación.
*Solución:* El score penaliza cambios bruscos — un medio con buen historial que de repente publica artículos de alto score tiene un "anomaly flag". El sistema no solo mide el promedio histórico sino la varianza y las anomalías recientes. Adicionalmente, el grafo de hipervínculos no se puede falsificar fácilmente — si el medio empieza a linkear a fuentes de baja credibilidad, el SCP baja automáticamente.

### 10.2 Las Brechas Que Ningún Documento Original Resolvió

**La brecha del WhatsApp:**
La mayor plataforma de desinformación en Colombia y Latinoamérica es WhatsApp — encriptada end-to-end, sin posibilidad de crawling externo. Ninguna arquitectura de análisis de medios puede acceder directamente a este contenido.
*Solución parcial (MVP):* Los usuarios pueden pegar una URL o texto de un mensaje de WhatsApp directamente en la app para analizarlo manualmente. A mediano plazo: una extensión de WhatsApp Web que detecta URLs compartidas y ofrece análisis con un click. Importante: este análisis es siempre iniciado por el usuario — el sistema nunca intercepta comunicaciones.

**La brecha del audio y video:**
El 60-70% de desinformación en Latinoamérica circula en notas de voz y videos cortos (TikTok, YouTube Shorts, Reels). El sistema actual solo analiza texto.
*Solución a mediano plazo:* 
- ASR (Automatic Speech Recognition): OpenAI Whisper es completamente gratuito y open source, soporta español latinoamericano con alta precisión. Integrar para transcripción de audio antes del análisis de texto
- Para video: análisis de transcripción de audio + frame sampling para detección de imágenes manipuladas via C2PA y reverse image search
- Prioridad en el roadmap: Fase 3

**La brecha del español fragmentado:**
No existe ningún modelo de lenguaje fine-tuned específicamente para el análisis de manipulación mediática en variantes regionales del español latinoamericano. Los modelos existentes tienen bias hacia español peninsular o español genérico.
*Solución:* Construcción progresiva de un dataset propio: los artículos analizados + feedback de usuarios + validación de expertos regionales se convierten en datos de entrenamiento. En Fase 3, liberar el primer modelo fine-tuned específico para español colombiano de análisis mediático como contribución open source a la comunidad.

---

## 11. Ética, Gobernanza y la Paradoja Epistémica

### 11.1 La Paradoja Central

El sistema enfrenta una contradicción profunda: **usar IA para identificar manipulación podría crear una nueva forma de manipulación**. Un sistema que decide qué es "verdad" o qué es "manipulación" concentra un poder epistémico enorme. Si ese poder está en manos de una empresa, un gobierno, o incluso una persona bien intencionada, se convierte en riesgo.

Esta no es una preocupación hipotética. Las plataformas de moderación de contenido han demostrado repetidamente que los sistemas de clasificación automatizada tienen sesgos sistemáticos, suelen penalizar a los grupos más vulnerables, y son opacas en sus criterios. VeritasAI no puede repetir estos errores.

### 11.2 Las Cinco Salvaguardas Irrenunciables

**1. Transparencia Radical:**
Todos los prompts del sistema, los modelos utilizados, el catálogo de técnicas con sus referencias académicas, los pesos del VeritasScore y la metodología completa son públicos. Cualquier persona puede auditar por qué el sistema clasifica un artículo de determinada manera.

**2. Múltiples Perspectivas, Nunca "La Verdad™":**
El sistema nunca presenta una conclusión única como verdad absoluta. Presenta: "Fuentes que reportan este hecho de manera diferente son X, Y, Z". El usuario mantiene la agencia de decisión. La única afirmación que el sistema hace con certeza es sobre las **técnicas usadas** (documentadas académicamente), no sobre la "verdad" del contenido.

**3. Humildad Epistémica Visible:**
El sistema siempre muestra su nivel de confianza. Si el análisis tiene baja confianza (por sarcasmo, ambigüedad cultural, acceso parcial al artículo), esto es visible y prominente en la UI. El sistema puede estar equivocado — y lo dice.

**4. Sistema de Apelación:**
Los medios y periodistas clasificados negativamente tienen un proceso formal y documentado para apelar. Las apelaciones son revisadas por un comité con representantes de la comunidad (no solo del equipo de VeritasAI). Las apelaciones exitosas se hacen públicas con la corrección del análisis.

**5. Gobernanza Comunitaria:**
Las decisiones metodológicas críticas (¿qué técnicas se clasifican como manipulación? ¿cómo se calculan los pesos del score?) se toman colectivamente, no de forma unilateral. El proyecto opera bajo gobernanza abierta con representación de académicos, periodistas, defensores de derechos civiles y usuarios de diferentes regiones y perspectivas políticas.

### 11.3 Principios de IA Responsable Aplicados

El sistema sigue los principios de la OECD para IA responsable (2026):
- **Transparencia y explicabilidad:** El Interactive Reasoning hace esto estructural, no opcional
- **Robustez y seguridad:** El sistema de fallbacks garantiza operación continua; el blockchain garantiza integridad
- **Rendición de cuentas:** El comité de gobernanza y el sistema de apelaciones
- **Inclusividad:** Multilingüe, gratuito, sin cuenta obligatoria, funciona en dispositivos de gama baja

---

## 12. Estudio de Caso: Colombia 2026

### 12.1 Por Qué Colombia Es el Entorno de Prueba Ideal

Colombia en 2026 representa el campo de validación más completo para el sistema. La convergencia de ciclos electorales, polarización histórica, presencia de actores híbridos con agendas informativas, y la velocidad de diseminación de desinformación a través de WhatsApp crea condiciones de máxima exigencia para cualquier sistema anti-manipulación.

El proyecto "Protección de Procesos Electorales en el Entorno de la Información" de International IDEA en Bogotá (consorcio multi-institucional con el CNE y la RNEC) ha documentado explícitamente las brechas regulatorias frente a campañas de manipulación y la ausencia de alfabetización mediática adecuada. Esto valida la necesidad y establece aliados institucionales potenciales.

### 12.2 Tres Frentes de Aplicación Colombiana

**Frente 1 — Interferencia Electoral:**
En períodos preelectorales proliferan en redes sociales colombianas campañas coordinadas de contenido sintético: afirmaciones sobre fraudes infundados, manipulación del software de votación, perfiles ficticios de instituciones judiciales. El sistema prioriza verificación de URLs virales en mensajería con los algoritmos de blockchain descritos, genera "índice de fabricación algorítmica" visible para cada pieza.

**Frente 2 — Cámaras de Eco y Polarización:**
Los algoritmos de redes sociales amplifican estructuralmente la homogeneidad ideológica, especialmente para jóvenes y grupos de alta permeabilidad. El Journalism Credibility Graph mapea si un medio está produciendo piezas originales o amplificando narrativas preexistentes — distingue entre periodismo y "cámara de amplificación".

**Frente 3 — Inmunización Cívica:**
Cuando un usuario accede a contenido incendiario, el Chatbot Socrático intercepta el pico de activación emocional. En lugar de bloquear el contenido (evitando la acusación de censura), interroga educativamente sobre el lenguaje de victimización, desactivando el ciclo automático de compartir impulsado por el sesgo emocional.

### 12.3 Medios Colombianos en el Sistema (Fase 1)

El sistema inicia con cobertura de los principales medios nacionales indexados por GDELT:
El Tiempo, El Colombiano, Semana, La Silla Vacía, Caracol Radio, RCN, El Espectador, Verdad Abierta, Pacifista, Razón Pública — cada uno con su perfil dinámico actualizado en tiempo real.

---

## 13. Roadmap de Construcción Real

### Fase 1 — MVP Funcional (4-6 semanas)

**Objetivo:** Sistema funcionando con usuarios reales analizando noticias colombianas

- GDELT API integrada para Colombia + 3-4 países latinoamericanos
- Dispatcher + 2 agentes paralelos (Hechos + Semántico-Emocional) via Groq
- VeritasScore™ básico (4 componentes iniciales)
- UI mínima: feed + card con score + análisis básico con técnicas
- 15 técnicas de manipulación en el catálogo inicial
- Cache básico con Redis
- Integración CRED-1 para prior de credibilidad de medios
- Deploy en Vercel (frontend) + Railway (backend)
- Chatbot básico (sin modo socrático completo aún)
- Análisis de texto únicamente

**KPIs de Fase 1:** 100 usuarios activos, 500 artículos analizados, < 3s para score inicial

### Fase 2 — Producto Completo (3-4 meses)

**Objetivo:** Producto pulido con experiencia de usuario de nivel senior

- Multi-agente completo: 5 agentes paralelos + Agente Colector
- Cascada completa de 5 proveedores LLM con router inteligente
- Perfiles dinámicos de medios y periodistas con visualizaciones
- Dashboard de credibilidad con Media Bias Chart interactivo
- Chatbot Socrático con sistema de prompts validados
- Interactive Reasoning UI (Knowledge Graph editable)
- Landscape of Thoughts (visualización t-SNE)
- Glassmorphism 2.0 UI completa
- PWA con soporte offline (Service Worker)
- Resultados progresivos con streaming completo
- Análisis de grafos de hipervínculos de medios
- Cobertura de 15+ países latinoamericanos
- Multilingüe: español (todas variantes), inglés, portugués
- VeritasScore™ completo con los 8 componentes
- Sistema de feedback de usuarios
- WebLLM on-device para modo privacidad (dispositivos compatibles)

**KPIs de Fase 2:** 2,000 usuarios activos, 10,000 artículos, NPS > 50

### Fase 3 — Escala, Robustez y Nuevos Medios (6-12 meses)

**Objetivo:** Plataforma de referencia internacional con cobertura multimedia

- Fine-tuning de modelos con datos propios (español latinoamericano específico)
- AT Protocol integration: DIDs para medios principales
- Verificación blockchain para artículos de alto impacto
- Red P2P de crawling (extensión de browser opcional)
- ASR con Whisper: análisis de audio/video (notas de voz, clips)
- Extensión de Chrome/Firefox para análisis en contexto
- Análisis de URLs compartidas en WhatsApp Web
- Sistema de alertas ("Este medio está publicando múltiples artículos de alta manipulación hoy")
- Detección avanzada de astroturfing y redes coordinadas
- API pública para desarrolladores (plan gratuito + pago)
- Red de colaboradores regionales para validación manual
- Lanzamiento del primer modelo fine-tuned español colombiano (open source)
- Cobertura de 40+ países

**KPIs de Fase 3:** 50,000 usuarios activos, API con 100+ integraciones externas, paper académico publicado

---

## 14. Por Qué Este Sistema Merece Aplausos de Pie

VeritasAI en su forma unificada no es un detector de noticias falsas. Es un **sistema de empoderamiento cognitivo de nivel civilizatorio** que:

1. **Respeta la inteligencia del usuario** — no le dice qué pensar, le muestra cómo lo están intentando manipular y le da las herramientas para decidir por sí mismo

2. **Es radicalmente transparente** — muestra su cadena de pensamiento, sus fuentes, sus niveles de confianza, sus limitaciones y sus prompts. Todo es auditable

3. **Protege la privacidad de forma estructural** — el modo on-device garantiza que el texto del usuario nunca sale de su dispositivo. La privacidad no es una política, es una consecuencia de la arquitectura

4. **Escala globalmente desde un costo operativo de $35-125/mes** gracias a APIs gratuitas, open source, cache inteligente e inferencia distribuida

5. **Tiene rigor académico real** — base en investigación peer-reviewed de neurociencia cognitiva, NLP computacional y doctrina de defensa cognitiva de la OTAN. Defendible ante neurocientíficos y humanistas

6. **Es resistente a la censura** — la arquitectura P2P y el AT Protocol hacen imposible "apagar" el sistema desde un punto central

7. **Educa mientras informa** — cada análisis enseña una técnica de manipulación que el usuario ya no olvidará. El chatbot socrático transforma lectores pasivos en pensadores críticos activos

8. **Es un bien público** — libre, open source, sin agenda política o comercial, gobernado colectivamente

9. **Crece con sus usuarios** — el feedback anónimo, el fine-tuning continuo y la red P2P hacen el sistema más inteligente con cada uso

La desinformación opera a velocidad de máquina. La respuesta tiene que operar a la misma velocidad — con más rigor, más transparencia y más respeto por la autonomía del ciudadano que cualquier plataforma que venga antes.

El mundo necesita esto. Colombia necesita esto. El momento es ahora.

---

## Apéndice A: Fuentes Académicas y Datasets

### NLP y Detección de Propaganda
- Da San Martino et al. (2020). "Fine-Grained Analysis of Propaganda in News Articles." EMNLP 2020
- SemEval 2020 Task 11: Detection of Propaganda Techniques in News Articles (Propaganda Techniques Corpus — PTC)
- Raza et al. (2022). BABE: Bias Annotations By Experts. ACL 2022
- Decoding News Narratives: A Critical Analysis of LLMs in Framing Detection. arXiv 2024
- Detecting bias in News with bias-detector. arXiv 2025

### Neurociencia y Cognición
- Kahneman, D. (2011). Thinking, Fast and Slow. Farrar, Straus and Giroux
- Entman, R. (1993). "Framing: Toward Clarification of a Fractured Paradigm." Journal of Communication
- Cialdini, R. (2021). Influence: The Psychology of Persuasion (New Expanded Version)

### Guerra Cognitiva y Defensa
- NATO Chief Scientist. (2026). Cognitive Warfare Report 2026
- INSS NDU. (2026). "Cognitive Warfare 2026: NATO's Chief Scientist Report as Sentinel"
- ISACA Journal. (2025). "A Neuroscience Perspective on AI and Cybersecurity"

### Credibilidad Mediática
- CRED-1 Dataset. (2025). 2,672 news domains scored for credibility. Open Dataset
- Ad Fontes Media Bias Chart. (2026). Flagship Edition — 137 Sources
- Journalism Trust Initiative (JTI). (2026). Trust Standards
- The Trust Project. (2026). Trust Indicators

### Infraestructura Técnica
- WebLLM: A High-Performance In-Browser LLM Inference Engine. arXiv 2024
- AT Protocol Specification. atproto.com
- Interactive Reasoning: Visualizing and Controlling Chain-of-Thought. UIST 2025
- Landscape of Thoughts (ICLR 2026). tmlr-group/landscape-of-thoughts

### Contexto Colombia 2026
- International IDEA. (2026). "Colombia moves to protect elections in the digital age"
- Human Rights Watch. (2026). World Report: Colombia
- Frontiers in Political Science. "Digital manipulation and mass mobilization: evidence from Latin America"
- EUAA COI Report Colombia 2025

---

## Apéndice B: Glosario Técnico

| Término | Definición en contexto VeritasAI |
|---------|----------------------------------|
| **VeritasScore™** | Métrica compuesta 0-100 de manipulación mediática con 8 componentes ponderados |
| **Dispatcher** | Agente ligero que clasifica el artículo y activa el enjambre de agentes paralelos |
| **Fan-out/Fan-in** | Patrón de orquestación donde múltiples agentes procesan en paralelo y un agente colector sintetiza |
| **Interactive Reasoning** | Paradigma UX donde el usuario puede editar los nodos de razonamiento del sistema |
| **Landscape of Thoughts** | Visualización topográfica 2D (t-SNE) del proceso de validación del artículo |
| **Glassmorphism 2.0** | Estética de interfaz con paneles translúcidos flotando sobre el contenido nativo |
| **Chatbot Socrático** | Asistente conversacional que usa preguntas reflexivas, no respuestas deterministas |
| **AT Protocol DID** | Identificador descentralizado criptográfico para medios de comunicación |
| **CRED-1 Prior** | Score inicial de credibilidad para nuevos medios basado en el dataset CRED-1 |
| **SLM** | Small Language Model — modelos de lenguaje comprimidos para inferencia on-device |
| **WebGPU** | API web moderna para acceso de alto rendimiento a la GPU del dispositivo |
| **ZBB** | Zero-Based Budgeting — filosofía de operar desde cero de costo en cada proceso |
| **Astroturfing** | Creación artificial de apariencia de movimiento orgánico a través de publicaciones coordinadas |
| **Dog whistle** | Frases codificadas que activan respuestas condicionadas en grupos específicos |
| **Source Laundering** | Citar una fuente sesgada como si fuera neutral para dar legitimidad a una afirmación |
| **Biopsychosocial Strata** | Marco OTAN de 3 niveles de manipulación: biológico, psicológico y social |

---

*Documento Maestro VeritasAI — Síntesis de investigación previa al desarrollo.*  
*Ninguna línea de código ha sido escrita aún.*  
*Versión 1.0 — Abril 2026*

