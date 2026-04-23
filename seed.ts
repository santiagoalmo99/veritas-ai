import { supabaseAdmin } from './lib/supabase-admin'
import { MEDIA_OUTLETS } from './lib/mock-data'

async function seed() {
  console.log('🌱 Seeding Media Outlets to Supabase...')
  
  const formatted = MEDIA_OUTLETS.map(o => ({
    id: o.id,
    name: o.name,
    domain: o.domain,
    country_code: o.countryCode,
    current_veritas_avg: o.currentVeritasAvg,
    articles_analyzed: o.articlesAnalyzed,
    alert_level: o.alertLevel,
    political_bias_score: o.politicalBiasScore,
    reliability_score: o.reliabilityScore,
    cred_score: o.credScore,
    top_techniques: o.topTechniques
  }))

  const { error } = await supabaseAdmin
    .from('media_outlets')
    .upsert(formatted, { onConflict: 'id' })

  if (error) {
    console.error('❌ Error seeding:', error)
  } else {
    console.log('✅ Seed successful!')
  }
}

seed()
