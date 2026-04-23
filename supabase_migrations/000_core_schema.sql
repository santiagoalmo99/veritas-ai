-- VeritasAI: Core Schema Migration
-- Run this in your Supabase SQL Editor

-- WARNING: This will drop existing tables to ensure a clean schema.
DROP TABLE IF EXISTS public.article_analysis_logs CASCADE;
DROP TABLE IF EXISTS public.article_techniques CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.journalists CASCADE;
DROP TABLE IF EXISTS public.media_outlets CASCADE;
DROP TABLE IF EXISTS public.techniques CASCADE;

-- 1. Techniques (Catálogo de técnicas)
CREATE TABLE public.techniques (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_es TEXT NOT NULL,
  category TEXT NOT NULL,
  biopsychosocial_level TEXT NOT NULL,
  description TEXT NOT NULL,
  description_es TEXT NOT NULL,
  severity NUMERIC NOT NULL,
  icon TEXT NOT NULL,
  academic_source TEXT
);

-- 2. Media Outlets (Medios)
CREATE TABLE public.media_outlets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  country_code TEXT NOT NULL,
  current_veritas_avg NUMERIC NOT NULL,
  articles_analyzed INTEGER NOT NULL,
  alert_level TEXT NOT NULL,
  political_bias_score NUMERIC NOT NULL,
  reliability_score NUMERIC NOT NULL,
  cred_score NUMERIC,
  top_techniques TEXT[] DEFAULT '{}'::TEXT[]
);

-- 3. Journalists (Periodistas)
CREATE TABLE public.journalists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score NUMERIC NOT NULL,
  reliability NUMERIC NOT NULL,
  articles INTEGER NOT NULL,
  outlets TEXT[] DEFAULT '{}'::TEXT[],
  trends TEXT NOT NULL
);

-- 4. Articles
CREATE TABLE public.articles (
  id TEXT PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_neutralized TEXT,
  excerpt TEXT NOT NULL,
  image_url TEXT,
  og_image_url TEXT,
  outlet_id TEXT NOT NULL REFERENCES public.media_outlets(id),
  journalist TEXT,
  journalist_score NUMERIC,
  published_at TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL,
  country_code TEXT NOT NULL,
  language TEXT NOT NULL,
  veritas_score NUMERIC,
  analysis_status TEXT NOT NULL,
  analysis_confidence NUMERIC,
  view_count INTEGER DEFAULT 0,
  trending_score NUMERIC DEFAULT 0,
  summary_neutralized TEXT,
  content_neutralized TEXT,
  primary_intent TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  content TEXT
);

-- 5. Article Techniques (Join Table for detected techniques)
CREATE TABLE public.article_techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  technique_id TEXT NOT NULL REFERENCES public.techniques(id) ON DELETE CASCADE,
  quote TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  explanation TEXT NOT NULL
);

-- 6. Article Analysis Logs (Chain of Thought)
CREATE TABLE public.article_analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp_val TEXT NOT NULL,
  technical_detail TEXT NOT NULL,
  technical_detail_es TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journalists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_analysis_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all
CREATE POLICY "Allow public read-only access" ON public.techniques FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.media_outlets FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.journalists FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.article_techniques FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.article_analysis_logs FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_outlet_id ON public.articles(outlet_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_techniques_article_id ON public.article_techniques(article_id);
CREATE INDEX IF NOT EXISTS idx_article_analysis_logs_article_id ON public.article_analysis_logs(article_id);

