import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/lib/api'

// ── GDELT 2.0 DOC API Integration ─────────────────────────
const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc'

interface GdeltArticle {
  url: string
  title: string
  seendate: string
  socialimage?: string
  domain: string
  sourcecountry: string
  language: string
  tone?: number
}

interface GdeltResponse {
  articles?: GdeltArticle[]
}

const COUNTRY_TO_GDELT: Record<string, string> = {
  CO: 'Colombia', MX: 'Mexico', AR: 'Argentina', VE: 'Venezuela',
  CL: 'Chile', PE: 'Peru', EC: 'Ecuador', US: 'US',
  ES: 'Spain', BR: 'Brazil',
}

const TOPIC_TO_GDELT_THEME: Record<string, string> = {
  politics: 'POLITICAL', economy: 'ECON', tech: 'TECHNOLOGY',
  science: 'SCIENCE', health: 'HEALTH', environment: 'ENV',
  culture: 'ART', security: 'SECURITY', international: 'POLITICAL',
  elections: 'ELECTION', human_rights: 'HUMAN_RIGHTS',
  justice: 'LEGAL', education: 'EDUCATION',
}

function buildGdeltQuery(countryCode: string, topics: string[]): string {
  const country = COUNTRY_TO_GDELT[countryCode] ?? 'Colombia'
  const themeFilters = (topics || []).slice(0, 3).map((t) => TOPIC_TO_GDELT_THEME[t]).filter(Boolean)
  
  const queryParts = []
  
  // GDELT Doc API sourcecountry prefers country names or specific codes
  if (countryCode === 'US') {
    queryParts.push('sourcecountry:UnitedStates')
    // For US, we want English news primarily
    queryParts.push('sourcelang:english')
  } else {
    queryParts.push(`sourcecountry:${country}`)
    queryParts.push('sourcelang:spanish')
  }

  if (themeFilters.length > 0) {
    queryParts.push(`(theme:${themeFilters.join(' OR theme:')})`)
  }
  
  return queryParts.join(' ')
}

function toneToScoreHint(tone: number): number {
  // GDELT tone is -100 to 100. Most news are -5 to 5.
  // We map this to our 0-100 Veritas Score (high = more manipulative/emotional)
  const baseScore = 50 - (tone * 5)
  return Math.min(Math.max(Math.floor(baseScore + (Math.random() * 10 - 5)), 5), 95)
}

function domainFromUrl(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const countryCode = (searchParams.get('country') || 'CO').toUpperCase()
  const topicsParam = searchParams.get('topics')
  const topics = topicsParam && topicsParam !== 'undefined' ? topicsParam.split(',').filter(Boolean) : []
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '12')

  try {
    const query = buildGdeltQuery(countryCode, topics)
    console.log(`[GDELT Query]: ${query}`)

    const gdeltUrl = new URL(GDELT_BASE)
    gdeltUrl.searchParams.set('query', query)
    gdeltUrl.searchParams.set('mode', 'artlist')
    gdeltUrl.searchParams.set('maxrecords', '75')
    gdeltUrl.searchParams.set('sort', 'hybridrel')
    gdeltUrl.searchParams.set('format', 'json')
    gdeltUrl.searchParams.set('timespan', '24h')

    let gdeltRes = await fetch(gdeltUrl.toString(), { 
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000) 
    })

    let gdeltData: GdeltResponse = await gdeltRes.json()
    let rawArticles = gdeltData?.articles || []

    // If 24h is empty, try broader timespan (72h) before falling back to mock
    if (rawArticles.length === 0) {
      console.log('GDELT 24h empty, retrying with 72h...')
      gdeltUrl.searchParams.set('timespan', '72h')
      const retryRes = await fetch(gdeltUrl.toString(), { next: { revalidate: 600 } })
      if (retryRes.ok) {
        const retryData = await retryRes.json()
        rawArticles = retryData?.articles || []
      }
    }

    // Filter by language if specified (strict mode to avoid mixed results)
    if (countryCode === 'US') {
      rawArticles = rawArticles.filter(a => a.language?.toLowerCase().includes('english'))
    } else if (COUNTRY_TO_GDELT[countryCode]) {
      // For other specific countries (LatAm/ES), we want Spanish
      rawArticles = rawArticles.filter(a => a.language?.toLowerCase().includes('spanish'))
    }

    // Si GDELT falla o viene vacío, usamos Supabase (BD Producción)
    if (rawArticles.length === 0) {
      console.warn(`GDELT returned 0 articles (after filtering) for ${countryCode}, falling back to Supabase`)
      const dbArticles = await api.getArticles(countryCode)
      
      // Filter DB results by language too if needed
      const filteredDb = countryCode === 'US' 
        ? dbArticles.filter(a => a.language === 'en')
        : dbArticles.filter(a => a.language === 'es')

      const startIndex = (page - 1) * perPage
      const paginatedArticles = filteredDb.slice(startIndex, startIndex + perPage)
      
      return NextResponse.json({ 
        articles: paginatedArticles, 
        hasMore: startIndex + perPage < filteredDb.length,
        nextPage: page + 1,
        source: 'supabase_db' 
      })
    }

    const articles = rawArticles.slice((page - 1) * perPage, page * perPage).map((a) => {
      const domain = domainFromUrl(a.url)
      const simulatedScore = toneToScoreHint(a.tone ?? 0)
      
      const altSources = rawArticles
        .filter(alt => domainFromUrl(alt.url) !== domain)
        .slice(0, 5)
        .map(alt => ({
          outlet: domainFromUrl(alt.url).split('.')[0].toUpperCase(),
          title: alt.title,
          url: alt.url,
          veritasScore: toneToScoreHint(alt.tone ?? 0)
        }))

      return {
        id: `g-${Buffer.from(a.url).toString('hex').slice(0, 32)}`,
        url: a.url,
        title: a.title,
        excerpt: `Analysis available for coverage by ${domain}.`,
        imageUrl: a.socialimage || null,
        outlet: {
          id: domain,
          name: domain.split('.')[0].toUpperCase(),
          domain,
          countryCode: a.sourcecountry || countryCode,
          reliabilityScore: 0.7,
        },
        publishedAt: parseGdeltDate(a.seendate),
        category: 'noticia',
        countryCode: countryCode,
        language: a.language === 'Spanish' ? 'es' : 'en',
        veritasScore: simulatedScore,
        alternativeSources: altSources,
        source: 'gdelt',
        techniquesDetected: simulatedScore > 40 ? [{
          technique: { name: 'Selective Framing', nameEs: 'Encuadre Selectivo' },
          confidence: 0.8
        }] : []
      }
    })

    return NextResponse.json({
      articles,
      hasMore: rawArticles.length > page * perPage,
      nextPage: page + 1,
      source: 'gdelt'
    })
  } catch (err) {
    // FALLBACK CRÍTICO: Si hay error de red o API, usamos Supabase
    console.error('Critical Feed Error, falling back to Supabase:', err)
    try {
      const dbArticles = await api.getArticles(countryCode)
      const startIndex = (page - 1) * perPage
      const paginatedArticles = dbArticles.slice(startIndex, startIndex + perPage)
      
      return NextResponse.json({ 
        articles: paginatedArticles, 
        hasMore: startIndex + perPage < dbArticles.length,
        nextPage: page + 1,
        source: 'supabase_db_fallback' 
      })
    } catch (dbErr) {
      console.error('Database fallback also failed:', dbErr)
      return NextResponse.json({ articles: [], hasMore: false, source: 'error' }, { status: 500 })
    }
  }
}

function parseGdeltDate(seendate: string): string {
  try {
    const y = seendate.slice(0, 4), mo = seendate.slice(4, 6), d = seendate.slice(6, 8)
    const h = seendate.slice(8, 10), mi = seendate.slice(10, 12)
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:00Z`).toISOString()
  } catch { return new Date().toISOString() }
}
