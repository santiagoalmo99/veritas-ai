import { createClient } from '@supabase/supabase-js'
import { TECHNIQUES, MEDIA_OUTLETS } from '../lib/mock-data'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// MOCK JOURNALISTS (extracted from MediaDashboardClient.tsx)
const JOURNALISTS = [
  { id: 'j-0', name: 'Patricia Montoya', score: 85, reliability: 0.9, articles: 62, outlets: ['Semana'], trends: 'up' },
  { id: 'j-1', name: 'Beatriz González', score: 12, reliability: 0.85, articles: 45, outlets: ['El Espectador'], trends: 'stable' },
  { id: 'j-2', name: 'Felipe Restrepo', score: 58, reliability: 0.6, articles: 30, outlets: ['El Tiempo'], trends: 'down' },
  { id: 'j-3', name: 'Carlos Mendoza', score: 68, reliability: 0.5, articles: 80, outlets: ['Semana'], trends: 'down' },
  { id: 'j-4', name: 'Laura Bernal', score: 25, reliability: 0.88, articles: 55, outlets: ['La Silla Vacía'], trends: 'up' },
  { id: 'j-5', name: 'Jorge Iván', score: 45, reliability: 0.7, articles: 40, outlets: ['Caracol Radio'], trends: 'stable' }
]

async function seed() {
  console.log('🌱 Starting Supabase seed process...')

  try {
    // 1. Seed Techniques
    console.log('Inserting Techniques...')
    const { error: techError } = await supabase.from('techniques').upsert(
      TECHNIQUES.map(t => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        name_es: t.nameEs,
        category: t.category,
        biopsychosocial_level: t.biopsychosocialLevel,
        description: t.description,
        description_es: t.descriptionEs,
        severity: t.severity,
        icon: t.icon,
        academic_source: t.academicSource || null
      }))
    )
    if (techError) throw techError

    // 2. Seed Media Outlets
    console.log('Inserting Media Outlets...')
    const { error: outletError } = await supabase.from('media_outlets').upsert(
      MEDIA_OUTLETS.map(m => ({
        id: m.id,
        name: m.name,
        domain: m.domain,
        country_code: m.countryCode,
        current_veritas_avg: m.currentVeritasAvg,
        articles_analyzed: m.articlesAnalyzed,
        alert_level: m.alertLevel,
        political_bias_score: m.politicalBiasScore,
        reliability_score: m.reliabilityScore,
        cred_score: m.credScore || null,
        top_techniques: m.topTechniques
      }))
    )
    if (outletError) throw outletError

    // 3. Seed Journalists
    console.log('Inserting Journalists...')
    const { error: journoError } = await supabase.from('journalists').upsert(
      JOURNALISTS.map(j => ({
        id: j.id,
        name: j.name,
        score: j.score,
        reliability: j.reliability,
        articles: j.articles,
        outlets: j.outlets,
        trends: j.trends
      }))
    )
    if (journoError) throw journoError

    // 4. Seed Articles (Skipped - using real-time ingestion instead)
    console.log('Skipping mock articles insertion to maintain 100% real data policy.')

    console.log('✅ Seed completed successfully! All data is now in Supabase.')
  } catch (error) {
    console.error('❌ Error during seed:', error)
  }
}

seed()
