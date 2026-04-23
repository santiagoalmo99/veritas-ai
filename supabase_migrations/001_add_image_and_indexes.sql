-- Migración para Inteligencia Editorial y Resiliencia de VeritasAI

-- 1. Añadir columna og_image_url para caché de OG Fetcher
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- 2. Índice compuesto para acelerar el feed por país y fecha (Database-First Approach)
-- Ya que el feed ordena por published_at desc, esto ayuda inmensamente
CREATE INDEX IF NOT EXISTS idx_articles_country_published 
ON public.articles (country_code, published_at DESC);

-- 3. (Opcional) Índice en tags o category si el filtro se vuelve más complejo
CREATE INDEX IF NOT EXISTS idx_articles_category 
ON public.articles (category);
