// VeritasAI — Shared Types

export type ScoreLevel = 'safe' | 'mild' | 'moderate' | 'severe' | 'critical'

export type TechniqueCategory =
  | 'emotional'
  | 'cognitive'
  | 'narrative'
  | 'neurolinguistic'
  | 'neuromarketing'

export type BiopsychosocialLevel = 'biological' | 'psychological' | 'social'

export type AlertLevel = 'green' | 'yellow' | 'orange' | 'red'

export type ArticleCategory =
  | 'noticia'
  | 'editorial'
  | 'analisis'
  | 'opinion'
  | 'publicidad_disfrazada'
  | 'investigacion'

export interface Technique {
  id: string
  slug: string
  name: string
  nameEs: string
  category: TechniqueCategory
  biopsychosocialLevel: BiopsychosocialLevel
  description: string
  descriptionEs: string
  example?: string
  academicSource?: string
  severity: number // 0-1
  icon: string
}

export interface DetectedTechnique {
  technique: Technique
  quote: string // Cita textual del artículo
  confidence: number // 0-1
  explanation: string
}

export interface MediaOutlet {
  id: string
  name: string
  domain: string
  logoUrl?: string | null
  countryCode: string
  currentVeritasAvg: number
  articlesAnalyzed: number
  alertLevel: AlertLevel
  politicalBiasScore: number // -1 (izq) a +1 (der)
  reliabilityScore: number // 0 a 1
  topTechniques: string[] // Slugs de técnicas más frecuentes
  credScore?: number | null // CRED-1
}

export interface AnalysisLog {
  stepId: string
  status: 'completed' | 'processing' | 'pending'
  timestamp: string
  technicalDetail: string
  technicalDetailEs: string
}

export interface Article {
  id: string
  url: string
  title: string
  titleNeutralized?: string | null
  excerpt: string
  imageUrl?: string | null
  outlet: MediaOutlet
  journalist?: string | null
  journalistScore?: number | null // 0-100, puntuación individual del periodista
  publishedAt: string // ISO string
  category: ArticleCategory
  countryCode: string
  language: string
  
  // Scoring
  veritasScore?: number | null // 0-100, undefined si no analizado
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed'
  analysisConfidence?: number | null // 0-1
  techniquesDetected: DetectedTechnique[]
  analysisLogs?: AnalysisLog[] | null // Pasos detallados del Chain of Thought
  
  // Engagement
  viewCount: number
  trendingScore: number

  // Analysis extras
  summaryNeutralized?: string | null
  contentNeutralized?: string | null
  primaryIntent?: 'inform' | 'persuade' | 'agitate' | 'deceive' | null
  alternativeSources?: AlternativeSource[] | null
  tags: string[]
  content?: string | null
}

export interface AlternativeSource {
  title: string
  url: string
  outlet: string
  veritasScore?: number
}

export type TopicSlug =
  | 'politics'
  | 'economy'
  | 'tech'
  | 'science'
  | 'health'
  | 'environment'
  | 'culture'
  | 'sports'
  | 'security'
  | 'international'
  | 'entertainment'
  | 'education'
  | 'justice'
  | 'human_rights'
  | 'elections'

export interface Topic {
  slug: TopicSlug
  label: string
  labelEs: string
  emoji: string
  description: string
}

export interface Country {
  code: string
  name: string
  nameEs: string
  flag: string
  language: string
  timezone: string
}

export interface UserPreferences {
  selectedTopics: TopicSlug[]
  countryCode: string
  language: string
  hasCompletedOnboarding: boolean
  feedLayout: 'grid' | 'list'
}

export interface FeedFilters {
  country?: string
  topics?: TopicSlug[]
  minScore?: number
  maxScore?: number
  category?: ArticleCategory
  sortBy: 'trending' | 'recent' | 'score'
  language?: string
}

export interface GeolocationResult {
  countryCode: string
  countryName: string
  city?: string
  language: string
  timezone: string
  flag: string
}

// Score utilities
export function getScoreLevel(score: number | null | undefined): ScoreLevel {
  const s = score ?? 0
  if (s <= 20) return 'safe'
  if (s <= 40) return 'mild'
  if (s <= 60) return 'moderate'
  if (s <= 80) return 'severe'
  return 'critical'
}

export function getScoreLabel(score: number | null | undefined, lang: 'es' | 'en' = 'es'): string {
  const level = getScoreLevel(score)
  const labels = {
    es: {
      safe: 'Mayormente neutral',
      mild: 'Sesgo leve',
      moderate: 'Manipulación moderada',
      severe: 'Manipulación severa',
      critical: 'Propaganda activa',
    },
    en: {
      safe: 'Mostly neutral',
      mild: 'Mild bias',
      moderate: 'Moderate manipulation',
      severe: 'Severe manipulation',
      critical: 'Active propaganda',
    },
  }
  return labels[lang][level]
}

export function getScoreColor(score: number | null | undefined): string {
  const s = score ?? 0
  if (s <= 20) return 'var(--score-safe)'
  if (s <= 40) return 'var(--score-mild)'
  if (s <= 60) return 'var(--score-moderate)'
  if (s <= 80) return 'var(--score-severe)'
  return 'var(--score-critical)'
}
