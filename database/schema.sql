-- VeritasAI — Supabase PostgreSQL Schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Media outlets (perfiles dinámicos) ────────────────────
CREATE TABLE IF NOT EXISTS media_outlets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    did TEXT UNIQUE,                           -- AT Protocol DID (fase 3)
    logo_url TEXT,
    country_code TEXT NOT NULL DEFAULT 'CO',
    cred1_score FLOAT DEFAULT 0.5,             -- CRED-1 dataset prior
    current_veritas_avg FLOAT DEFAULT 50,
    articles_analyzed INTEGER DEFAULT 0,
    techniques_frequency JSONB DEFAULT '{}',   -- {slug: count}
    political_bias_score FLOAT DEFAULT 0,      -- -1 (izq) a +1 (der)
    reliability_score FLOAT DEFAULT 0.5,
    alert_level TEXT DEFAULT 'yellow'          -- green/yellow/orange/red
        CHECK (alert_level IN ('green', 'yellow', 'orange', 'red')),
    hyperlink_graph_position JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ── Journalists (perfiles individuales) ───────────────────
CREATE TABLE IF NOT EXISTS journalists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    outlet_id UUID REFERENCES media_outlets(id) ON DELETE SET NULL,
    articles_analyzed INTEGER DEFAULT 0,
    avg_veritas_score FLOAT DEFAULT 50,
    recurring_techniques JSONB DEFAULT '[]',   -- [slug, ...]
    babe_style_score FLOAT DEFAULT 0.5,        -- BABE dataset style score
    corrections_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ── Articles (cache central) ───────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT UNIQUE NOT NULL,
    url_hash TEXT UNIQUE NOT NULL,             -- SHA-256 for fast cache lookup
    title TEXT NOT NULL,
    outlet_id UUID REFERENCES media_outlets(id) ON DELETE SET NULL,
    journalist_id UUID REFERENCES journalists(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    category TEXT DEFAULT 'noticia'
        CHECK (category IN ('noticia', 'editorial', 'analisis', 'opinion', 'publicidad_disfrazada', 'investigacion')),
    country_code TEXT DEFAULT 'CO',
    language TEXT DEFAULT 'es',
    veritas_score INTEGER CHECK (veritas_score BETWEEN 0 AND 100),
    score_breakdown JSONB DEFAULT '{}',        -- {EMI, FAS, SBI, NFS, ODS, LMS, SCP, CSS}
    techniques_detected JSONB DEFAULT '[]',    -- DetectedTechnique[]
    title_neutralized TEXT,
    summary_neutralized TEXT,
    primary_intent TEXT DEFAULT 'inform',
    coordination_risk TEXT DEFAULT 'none'
        CHECK (coordination_risk IN ('none', 'low', 'medium', 'high')),
    blockchain_hash TEXT,                      -- Integridad criptográfica (fase 3)
    analysis_confidence FLOAT DEFAULT 0,
    analysis_provider TEXT,                    -- 'groq'/'cerebras'/'google'/etc
    analyzed_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    trending_score FLOAT DEFAULT 0.5,
    og_image_url TEXT,                         -- URL original de og:image (alta calidad)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Media Links (Grafo de conexiones) ──────────────────────
CREATE TABLE IF NOT EXISTS media_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    source_outlet_id UUID REFERENCES media_outlets(id),
    source_domain TEXT NOT NULL,
    target_domain TEXT NOT NULL,
    target_url TEXT NOT NULL,
    link_anchor_text TEXT,
    extracted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_links_source ON media_links(source_outlet_id);
CREATE INDEX IF NOT EXISTS idx_media_links_target_domain ON media_links(target_domain);

-- ── Analysis cache (full results) ─────────────────────────
CREATE TABLE IF NOT EXISTS analysis_cache (
    article_id UUID PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
    full_analysis JSONB NOT NULL,              -- Complete analysis payload
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,                    -- NULL = indefinite
    hit_count INTEGER DEFAULT 0
);

-- ── Techniques catalog ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS techniques_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_es TEXT,
    category TEXT NOT NULL
        CHECK (category IN ('emotional', 'cognitive', 'narrative', 'neurolinguistic', 'neuromarketing')),
    biopsychosocial_level TEXT NOT NULL
        CHECK (biopsychosocial_level IN ('biological', 'psychological', 'social')),
    academic_source TEXT,
    description TEXT,
    description_es TEXT,
    example TEXT,
    detection_prompt TEXT,                     -- LLM prompt fragment for detection
    severity_weight FLOAT DEFAULT 0.5          -- 0-1
);

-- ── User feedback (anonymous) ──────────────────────────────
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL
        CHECK (feedback_type IN ('incorrect_analysis', 'missed_technique', 'false_positive', 'helpful')),
    user_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
    -- No user_id — todo es anónimo por diseño
);

-- ── Indexes para performance ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_articles_url_hash ON articles(url_hash);
CREATE INDEX IF NOT EXISTS idx_articles_country ON articles(country_code);
CREATE INDEX IF NOT EXISTS idx_articles_score ON articles(veritas_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_outlet ON articles(outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlets_domain ON media_outlets(domain);
CREATE INDEX IF NOT EXISTS idx_outlets_country ON media_outlets(country_code);

-- ── Seed: Techniques catalog (47 técnicas del Maestro) ────
INSERT INTO techniques_catalog (slug, name, name_es, category, biopsychosocial_level, academic_source, severity_weight) VALUES
    ('fear-mongering', 'Fear-Mongering', 'Amplificación del miedo', 'emotional', 'biological', 'Kahneman (2011) — Thinking, Fast and Slow', 0.85),
    ('framing-effect', 'Framing Effect', 'Efecto de encuadre', 'cognitive', 'psychological', 'Entman (1993) — Framing Theory', 0.70),
    ('false-dichotomy', 'False Dichotomy', 'Falsa dicotomía', 'cognitive', 'psychological', 'Da San Martino et al. (2020)', 0.65),
    ('moral-outrage', 'Moral Outrage Engineering', 'Ingeniería de indignación moral', 'emotional', 'social', 'SemEval 2020 Task 11', 0.80),
    ('manufactured-consensus', 'Manufactured Consensus', 'Consenso fabricado', 'narrative', 'social', 'Da San Martino et al. (2020)', 0.60),
    ('nominalization', 'Nominalization', 'Nominalización', 'neurolinguistic', 'psychological', 'Da San Martino et al. (2020)', 0.50),
    ('strategic-omission', 'Strategic Omission', 'Omisión estratégica', 'narrative', 'psychological', 'BABE dataset — Raza et al. (2022)', 0.75),
    ('biometric-copy', 'Biometric-Optimized Copy', 'Texto optimizado biométricamente', 'neuromarketing', 'biological', 'Neuromarketing Research 2026', 0.90),
    ('anchoring-bias', 'Anchoring Bias', 'Sesgo de anclaje', 'cognitive', 'psychological', 'Kahneman (2011)', 0.70),
    ('illusory-truth', 'Illusory Truth Effect', 'Efecto de verdad ilusoria', 'cognitive', 'biological', 'Hasher et al. (1977)', 0.75),
    ('dog-whistle', 'Dog Whistle Rhetoric', 'Perro silbato / lenguaje codificado', 'narrative', 'social', 'Da San Martino et al. (2020)', 0.80),
    ('presupposition-embedding', 'Presupposition Embedding', 'Incrustación de presuposiciones', 'neurolinguistic', 'psychological', 'Da San Martino et al. (2020)', 0.65),
    ('emotional-intensifiers', 'Emotional Intensifiers', 'Intensificadores emocionales', 'neurolinguistic', 'biological', 'SemEval 2020 Task 11', 0.60),
    ('source-laundering', 'Source Laundering', 'Lavado de fuentes', 'narrative', 'psychological', 'Da San Martino et al. (2020)', 0.70),
    ('false-equivalence', 'False Equivalence', 'Falsa equivalencia', 'cognitive', 'psychological', 'Da San Martino et al. (2020)', 0.65),
    ('ad-hominem', 'Ad Hominem', 'Ataque personal (ad hominem)', 'emotional', 'social', 'Da San Martino et al. (2020)', 0.60),
    ('agenda-setting', 'Agenda Setting', 'Establecimiento de agenda', 'narrative', 'social', 'McCombs & Shaw (1972)', 0.55),
    ('astroturfing-signals', 'Astroturfing Signals', 'Señales de astroturfing', 'narrative', 'social', 'Da San Martino et al. (2020)', 0.85)
ON CONFLICT (slug) DO NOTHING;

-- ── Seed: Core media outlets ───────────────────────────────
INSERT INTO media_outlets (name, domain, country_code, cred1_score, current_veritas_avg, reliability_score, political_bias_score, alert_level, articles_analyzed) VALUES
    ('Semana', 'semana.com', 'CO', 0.52, 62, 0.55, 0.30, 'orange', 1847),
    ('La Silla Vacía', 'lasillavacia.com', 'CO', 0.88, 18, 0.89, -0.10, 'green', 923),
    ('El Espectador', 'elespectador.com', 'CO', 0.71, 35, 0.72, -0.25, 'yellow', 2341),
    ('El Tiempo', 'eltiempo.com', 'CO', 0.68, 41, 0.65, 0.15, 'yellow', 3102),
    ('Caracol Radio', 'caracol.com.co', 'CO', 0.62, 48, 0.60, 0.10, 'yellow', 1456),
    ('Verdad Abierta', 'verdadabierta.com', 'CO', 0.92, 14, 0.93, 0.00, 'green', 412),
    ('Infobae', 'infobae.com', 'AR', 0.48, 55, 0.50, 0.40, 'orange', 4210),
    ('El País', 'elpais.com', 'ES', 0.82, 28, 0.80, -0.20, 'green', 5890)
ON CONFLICT (domain) DO NOTHING;

-- ── RLS: Row Level Security (privacidad por diseño) ────────
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_outlets ENABLE ROW LEVEL SECURITY;

-- Articles are PUBLIC (read-only) — analysis is a public good
CREATE POLICY "Articles are publicly readable" ON articles
    FOR SELECT USING (true);

-- Analysis cache is PUBLIC (read-only)
CREATE POLICY "Cache is publicly readable" ON analysis_cache
    FOR SELECT USING (true);

-- Media outlets are PUBLIC (read-only)
CREATE POLICY "Outlets are publicly readable" ON media_outlets
    FOR SELECT USING (true);

-- Feedback is write-only for anonymous users
CREATE POLICY "Anyone can submit feedback" ON user_feedback
    FOR INSERT WITH CHECK (true);

-- Service role can write everything (for the backend)
CREATE POLICY "Service can write articles" ON articles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service can write cache" ON analysis_cache
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service can write outlets" ON media_outlets
    FOR ALL USING (auth.role() = 'service_role');
