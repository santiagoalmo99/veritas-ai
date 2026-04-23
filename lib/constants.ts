import type { Country, Topic, TopicSlug } from './types'

// ── Topics catalog ─────────────────────────────────────────
export const TOPICS: Topic[] = [
  {
    slug: 'politics',
    label: 'Politics',
    labelEs: 'Política',
    emoji: '🏛️',
    description: 'Government, elections, and political parties',
  },
  {
    slug: 'economy',
    label: 'Economy',
    labelEs: 'Economía',
    emoji: '📈',
    description: 'Finance, markets, and economic policy',
  },
  {
    slug: 'tech',
    label: 'Technology',
    labelEs: 'Tecnología',
    emoji: '⚡',
    description: 'AI, startups, and digital innovation',
  },
  {
    slug: 'science',
    label: 'Science',
    labelEs: 'Ciencia',
    emoji: '🔬',
    description: 'Research, discoveries, and academia',
  },
  {
    slug: 'health',
    label: 'Health',
    labelEs: 'Salud',
    emoji: '🧬',
    description: 'Medicine, public health, and wellness',
  },
  {
    slug: 'environment',
    label: 'Environment',
    labelEs: 'Medio Ambiente',
    emoji: '🌿',
    description: 'Climate, sustainability, and ecology',
  },
  {
    slug: 'culture',
    label: 'Culture',
    labelEs: 'Cultura',
    emoji: '🎭',
    description: 'Arts, society, and cultural trends',
  },
  {
    slug: 'sports',
    label: 'Sports',
    labelEs: 'Deportes',
    emoji: '⚽',
    description: 'Football, athletics, and competition',
  },
  {
    slug: 'security',
    label: 'Security',
    labelEs: 'Seguridad',
    emoji: '🛡️',
    description: 'Public safety, crime, and defense',
  },
  {
    slug: 'international',
    label: 'International',
    labelEs: 'Internacional',
    emoji: '🌎',
    description: 'Global affairs and geopolitics',
  },
  {
    slug: 'entertainment',
    label: 'Entertainment',
    labelEs: 'Entretenimiento',
    emoji: '🎬',
    description: 'Cinema, music, and popular culture',
  },
  {
    slug: 'education',
    label: 'Education',
    labelEs: 'Educación',
    emoji: '📚',
    description: 'Schools, universities, and learning',
  },
  {
    slug: 'justice',
    label: 'Justice',
    labelEs: 'Justicia',
    emoji: '⚖️',
    description: 'Courts, law, and legal system',
  },
  {
    slug: 'human_rights',
    label: 'Human Rights',
    labelEs: 'Derechos Humanos',
    emoji: '✊',
    description: 'Civil rights and social justice',
  },
  {
    slug: 'elections',
    label: 'Elections',
    labelEs: 'Elecciones',
    emoji: '🗳️',
    description: 'Electoral processes and campaigns',
  },
]

// ── Countries catalog ──────────────────────────────────────
export const COUNTRIES: Country[] = [
  { code: 'CO', name: 'Colombia', nameEs: 'Colombia', flag: '🇨🇴', language: 'es', timezone: 'America/Bogota' },
  { code: 'MX', name: 'Mexico', nameEs: 'México', flag: '🇲🇽', language: 'es', timezone: 'America/Mexico_City' },
  { code: 'AR', name: 'Argentina', nameEs: 'Argentina', flag: '🇦🇷', language: 'es', timezone: 'America/Buenos_Aires' },
  { code: 'VE', name: 'Venezuela', nameEs: 'Venezuela', flag: '🇻🇪', language: 'es', timezone: 'America/Caracas' },
  { code: 'PE', name: 'Peru', nameEs: 'Perú', flag: '🇵🇪', language: 'es', timezone: 'America/Lima' },
  { code: 'CL', name: 'Chile', nameEs: 'Chile', flag: '🇨🇱', language: 'es', timezone: 'America/Santiago' },
  { code: 'EC', name: 'Ecuador', nameEs: 'Ecuador', flag: '🇪🇨', language: 'es', timezone: 'America/Guayaquil' },
  { code: 'US', name: 'USA', nameEs: 'Estados Unidos', flag: '🇺🇸', language: 'en', timezone: 'America/New_York' },
  { code: 'ES', name: 'Spain', nameEs: 'España', flag: '🇪🇸', language: 'es', timezone: 'Europe/Madrid' },
  { code: 'BR', name: 'Brazil', nameEs: 'Brasil', flag: '🇧🇷', language: 'pt', timezone: 'America/Sao_Paulo' },
]

// ── Country → language mapping ─────────────────────────────
export const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  CO: 'es', MX: 'es', AR: 'es', VE: 'es', PE: 'es', CL: 'es',
  EC: 'es', BOL: 'es', PY: 'es', UY: 'es', CR: 'es', PA: 'es',
  GT: 'es', HN: 'es', SV: 'es', NI: 'es', CU: 'es', DO: 'es',
  PR: 'es', ES: 'es',
  BR: 'pt', PT: 'pt',
  US: 'en', GB: 'en', CA: 'en', AU: 'en',
}

// ── Default topics per country ─────────────────────────────
export const DEFAULT_TOPICS_BY_COUNTRY: Record<string, TopicSlug[]> = {
  CO: ['politics', 'security', 'economy', 'elections'],
  MX: ['politics', 'security', 'economy', 'culture'],
  AR: ['economy', 'politics', 'culture', 'international'],
  VE: ['politics', 'economy', 'human_rights', 'international'],
  US: ['politics', 'economy', 'tech', 'international'],
  ES: ['politics', 'economy', 'culture', 'international'],
  BR: ['politics', 'economy', 'environment', 'security'],
  DEFAULT: ['politics', 'economy', 'international', 'tech'],
}
