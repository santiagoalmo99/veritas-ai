import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TECHNIQUES, MEDIA_OUTLETS, MOCK_ARTICLES } from '@/lib/mock-data'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const JOURNALISTS = [
    { id: 'j-0', name: 'Patricia Montoya', score: 85, reliability: 0.9, articles: 62, outlets: ['Semana'], trends: 'up' },
    { id: 'j-1', name: 'Beatriz González', score: 12, reliability: 0.85, articles: 45, outlets: ['El Espectador'], trends: 'stable' },
    { id: 'j-2', name: 'Felipe Restrepo', score: 58, reliability: 0.6, articles: 30, outlets: ['El Tiempo'], trends: 'down' },
    { id: 'j-3', name: 'Carlos Mendoza', score: 68, reliability: 0.5, articles: 80, outlets: ['Semana'], trends: 'down' },
    { id: 'j-4', name: 'Laura Bernal', score: 25, reliability: 0.88, articles: 55, outlets: ['La Silla Vacía'], trends: 'up' },
    { id: 'j-5', name: 'Jorge Iván', score: 45, reliability: 0.7, articles: 40, outlets: ['Caracol Radio'], trends: 'stable' }
  ]

  let logs = []

  try {
    // 1. Seed Techniques
    logs.push('Inserting Techniques...')
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
    logs.push('Inserting Media Outlets...')
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
    logs.push('Inserting Journalists...')
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

    // 4. Seed Articles
    logs.push('Inserting Articles...')
    for (const article of MOCK_ARTICLES) {
      const { error: articleError } = await supabase.from('articles').upsert({
        id: article.id,
        url: article.url,
        title: article.title,
        title_neutralized: article.titleNeutralized || null,
        excerpt: article.excerpt,
        image_url: article.imageUrl || null,
        outlet_id: article.outlet.id,
        journalist: article.journalist || null,
        journalist_score: article.journalistScore || null,
        published_at: article.publishedAt,
        category: article.category,
        country_code: article.countryCode,
        language: article.language,
        veritas_score: article.veritasScore || null,
        analysis_status: article.analysisStatus,
        analysis_confidence: article.analysisConfidence || null,
        view_count: article.viewCount,
        trending_score: article.trendingScore,
        summary_neutralized: article.summaryNeutralized || null,
        content_neutralized: article.contentNeutralized || null,
        primary_intent: article.primaryIntent || null,
        tags: article.tags,
        content: article.content || null
      })
      if (articleError) throw articleError

      if (article.techniquesDetected?.length > 0) {
        await supabase.from('article_techniques').delete().eq('article_id', article.id)
        const { error: techLinkError } = await supabase.from('article_techniques').insert(
          article.techniquesDetected.map(td => ({
            article_id: article.id,
            technique_id: td.technique.id,
            quote: td.quote,
            confidence: td.confidence,
            explanation: td.explanation
          }))
        )
        if (techLinkError) throw techLinkError
      }

      if (article.analysisLogs?.length > 0) {
        await supabase.from('article_analysis_logs').delete().eq('article_id', article.id)
        const { error: logError } = await supabase.from('article_analysis_logs').insert(
          article.analysisLogs.map(log => ({
            article_id: article.id,
            step_id: log.stepId,
            status: log.status,
            timestamp_val: log.timestamp,
            technical_detail: log.technicalDetail,
            technical_detail_es: log.technicalDetailEs
          }))
        )
        if (logError) throw logError
      }
    }

    logs.push('Seed completed successfully!')
    return NextResponse.json({ success: true, logs })
  } catch (error: any) {
    return NextResponse.json({ success: false, logs, error: error.message, details: error.details }, { status: 500 })
  }
}
