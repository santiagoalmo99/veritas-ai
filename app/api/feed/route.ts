import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const countryCode = (searchParams.get('country') || 'ALL').toUpperCase()
  const topicsParam = searchParams.get('topics')
  const topics = topicsParam && topicsParam !== 'undefined' ? topicsParam.split(',').filter(Boolean) : []
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '12')

  try {
    // 1. Intentar obtener noticias de la BASE DE DATOS (Supabase) primero
    let query = supabase
      .from('articles')
      .select(`
        *,
        outlet:media_outlets (*)
      `)
      .order('published_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (countryCode !== 'ALL') {
      query = query.eq('country_code', countryCode)
    }

    const { data: dbArticles, error: dbError } = await query

    if (dbError) throw dbError

    // 2. Si hay suficientes artículos en la DB, los devolvemos
    if (dbArticles && dbArticles.length >= perPage / 2) {
      const mappedArticles = dbArticles.map(a => ({
        id: a.id,
        url: a.url,
        title: a.title,
        excerpt: a.excerpt,
        imageUrl: a.image_url,
        veritasScore: a.veritas_score,
        publishedAt: a.published_at,
        analysisStatus: a.analysis_status,
        outlet: a.outlet ? {
          id: a.outlet.id,
          name: a.outlet.name,
          domain: a.outlet.domain,
          countryCode: a.outlet.country_code,
          reliabilityScore: a.outlet.reliability_score
        } : { name: 'Desconocido', domain: '' }
      }))

      return NextResponse.json({
        articles: mappedArticles,
        hasMore: dbArticles.length === perPage,
        nextPage: page + 1,
        source: 'supabase'
      })
    }

    // 3. FALLBACK: GDELT en vivo
    const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/context/context'
    const queryParts = [`sourcecountry:${countryCode === 'ALL' ? 'CO' : countryCode}`, 'sourcelang:spanish']
    
    const gdeltParams = new URLSearchParams({
      format: 'json',
      timespan: '24h',
      query: queryParts.join(' '),
      maxrecords: '50',
      mode: 'artlist'
    })

    const response = await fetch(`${GDELT_API_URL}?${gdeltParams.toString()}`)
    const data = await response.json()
    
    if (!data.articles || data.articles.length === 0) {
      const { simulateInfiniteScroll } = await import('@/lib/mock-data')
      const mockResult = simulateInfiniteScroll(page, perPage, countryCode, topics)
      return NextResponse.json({ ...mockResult, source: 'mock_fallback_empty' })
    }

    const { MEDIA_OUTLETS } = await import('@/lib/mock-data')
    const { parseGdeltDate } = await import('@/lib/utils')

    const rawArticles = data.articles.map((art: any) => {
      const domain = new URL(art.url).hostname.replace('www.', '')
      const knownOutlet = MEDIA_OUTLETS.find(m => m.domain === domain)
      const urlHash = art.url.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
      const veritasScore = knownOutlet ? knownOutlet.currentVeritasAvg : (20 + (urlHash % 60))

      return {
        id: `gdelt-${Buffer.from(art.url).toString('hex').slice(0, 16)}`,
        url: art.url,
        title: art.title,
        excerpt: art.excerpt || 'Análisis en proceso...',
        imageUrl: art.socialimage || null,
        outlet: {
          id: knownOutlet?.id || 'unknown',
          name: knownOutlet?.name || art.source || 'MEDIO DESCONOCIDO',
          domain: domain,
          countryCode: knownOutlet?.countryCode || countryCode,
          reliabilityScore: knownOutlet?.reliabilityScore || 0.7
        },
        publishedAt: art.seendate ? parseGdeltDate(art.seendate).toISOString() : new Date().toISOString(),
        category: 'noticia',
        countryCode: knownOutlet?.countryCode || countryCode,
        language: 'es',
        veritasScore: veritasScore,
        analysisStatus: 'completed',
        source: 'gdelt_live'
      }
    })

    const startIndex = (page - 1) * perPage
    const articles = rawArticles.slice(startIndex, startIndex + perPage)

    return NextResponse.json({
      articles,
      hasMore: rawArticles.length > startIndex + perPage,
      nextPage: page + 1,
      source: 'gdelt_live'
    })

  } catch (error) {
    console.error('[Feed API Error]:', error)
    const { simulateInfiniteScroll } = await import('@/lib/mock-data')
    const result = simulateInfiniteScroll(page, perPage, countryCode, topics)
    return NextResponse.json({ ...result, source: 'critical_fallback' })
  }
}

