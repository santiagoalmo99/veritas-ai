// VeritasAI — Seed / Reference Data
// Used ONLY for initial database population (seed scripts)
// Production code reads from Supabase — never import this in runtime routes

import { Technique, MediaOutlet, Topic } from './types'

export const TECHNIQUES: Technique[] = [
  {
    id: 't1',
    slug: 'loaded-language',
    name: 'Loaded Language',
    nameEs: 'Lenguaje Cargado',
    category: 'emotional',
    biopsychosocialLevel: 'psychological',
    description: 'Use of words with strong emotional connotations to influence the audience.',
    descriptionEs: 'Uso de palabras con fuertes connotaciones emocionales para influir en la audiencia.',
    severity: 0.6,
    icon: 'message-square-warning'
  },
  {
    id: 't2',
    slug: 'fear-mongering',
    name: 'Fear Mongering',
    nameEs: 'Generación de Miedo',
    category: 'emotional',
    biopsychosocialLevel: 'biological',
    description: 'Creating anxiety or panic to manipulate public opinion.',
    descriptionEs: 'Creación de ansiedad o pánico para manipular la opinión pública.',
    severity: 0.9,
    icon: 'skull'
  },
  {
    id: 't3',
    slug: 'false-dilemma',
    name: 'False Dilemma',
    nameEs: 'Falso Dilema',
    category: 'cognitive',
    biopsychosocialLevel: 'psychological',
    description: 'Presenting only two options when more exist.',
    descriptionEs: 'Presentar solo dos opciones cuando existen más.',
    severity: 0.5,
    icon: 'split'
  },
  {
    id: 't4',
    slug: 'moral-engineering',
    name: 'Moral Engineering',
    nameEs: 'Ingeniería Moral',
    category: 'narrative',
    biopsychosocialLevel: 'social',
    description: 'Framing issues as a battle between good and evil.',
    descriptionEs: 'Encuadrar problemas como una batalla entre el bien y el mal.',
    severity: 0.7,
    icon: 'balance-scale'
  },
  {
    id: 't5',
    slug: 'anchoring-bias',
    name: 'Anchoring Bias',
    nameEs: 'Sesgo de Anclaje',
    category: 'cognitive',
    biopsychosocialLevel: 'psychological',
    description: 'Relying too heavily on the first piece of information offered.',
    descriptionEs: 'Depender demasiado de la primera pieza de información ofrecida.',
    severity: 0.4,
    icon: 'anchor'
  }
]

export const MEDIA_OUTLETS: MediaOutlet[] = [
  {
    id: 'mo1',
    name: 'Semana',
    domain: 'semana.com',
    countryCode: 'CO',
    currentVeritasAvg: 68,
    articlesAnalyzed: 1240,
    alertLevel: 'orange',
    politicalBiasScore: 0.8,
    reliabilityScore: 0.45,
    topTechniques: ['loaded-language', 'fear-mongering']
  },
  {
    id: 'mo2',
    name: 'El Tiempo',
    domain: 'eltiempo.com',
    countryCode: 'CO',
    currentVeritasAvg: 42,
    articlesAnalyzed: 2150,
    alertLevel: 'yellow',
    politicalBiasScore: 0.4,
    reliabilityScore: 0.72,
    topTechniques: ['anchoring-bias']
  },
  {
    id: 'mo3',
    name: 'El Espectador',
    domain: 'elespectador.com',
    countryCode: 'CO',
    currentVeritasAvg: 28,
    articlesAnalyzed: 1890,
    alertLevel: 'green',
    politicalBiasScore: -0.2,
    reliabilityScore: 0.85,
    topTechniques: ['moral-engineering']
  },
  {
    id: 'mo4',
    name: 'La Silla Vacía',
    domain: 'lasillavacia.com',
    countryCode: 'CO',
    currentVeritasAvg: 15,
    articlesAnalyzed: 950,
    alertLevel: 'green',
    politicalBiasScore: -0.1,
    reliabilityScore: 0.92,
    topTechniques: []
  },
  {
    id: 'mo5',
    name: 'Caracol Radio',
    domain: 'caracol.com.co',
    countryCode: 'CO',
    currentVeritasAvg: 35,
    articlesAnalyzed: 3100,
    alertLevel: 'yellow',
    politicalBiasScore: 0.2,
    reliabilityScore: 0.78,
    topTechniques: ['loaded-language']
  },
  {
    id: 'mo6',
    name: 'Infobae',
    domain: 'infobae.com',
    countryCode: 'AR',
    currentVeritasAvg: 55,
    articlesAnalyzed: 5200,
    alertLevel: 'orange',
    politicalBiasScore: 0.6,
    reliabilityScore: 0.58,
    topTechniques: ['fear-mongering']
  },
  {
    id: 'mo7',
    name: 'Página/12',
    domain: 'pagina12.com.ar',
    countryCode: 'AR',
    currentVeritasAvg: 72,
    articlesAnalyzed: 2800,
    alertLevel: 'orange',
    politicalBiasScore: -0.9,
    reliabilityScore: 0.48,
    topTechniques: ['loaded-language', 'moral-engineering']
  },
  {
    id: 'mo8',
    name: 'The New York Times',
    domain: 'nytimes.com',
    countryCode: 'US',
    currentVeritasAvg: 12,
    articlesAnalyzed: 15000,
    alertLevel: 'green',
    politicalBiasScore: -0.3,
    reliabilityScore: 0.95,
    topTechniques: []
  }
]

export const TOPICS: Topic[] = [
  {
    slug: 'politics',
    label: 'Politics',
    labelEs: 'Política',
    emoji: '🏛️',
    description: 'Government, legislation, and political movements.'
  },
  {
    slug: 'economy',
    label: 'Economy',
    labelEs: 'Economía',
    emoji: '📈',
    description: 'Markets, finance, and economic indicators.'
  },
  {
    slug: 'tech',
    label: 'Technology',
    labelEs: 'Tecnología',
    emoji: '🚀',
    description: 'Innovation, software, and digital trends.'
  },
  {
    slug: 'security',
    label: 'Security',
    labelEs: 'Seguridad',
    emoji: '🛡️',
    description: 'Public order, conflict, and defense.'
  },
  {
    slug: 'international',
    label: 'International',
    labelEs: 'Internacional',
    emoji: '🌍',
    description: 'Global events and foreign relations.'
  }
]
