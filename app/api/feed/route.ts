import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

// ── Country → GDELT Language mapping ──────────────────────────
const COUNTRY_GDELT_LANG: Record<string, string> = {
  CO: 'spanish', MX: 'spanish', AR: 'spanish', VE: 'spanish',
  PE: 'spanish', CL: 'spanish', EC: 'spanish', ES: 'spanish',
  US: 'english', GB: 'english', CA: 'english', AU: 'english',
  BR: 'portuguese', PT: 'portuguese',
}

// ── Build GDELT query based on country and category ──────────
function buildGdeltQuery(country: string, category: string): string {
  const lang = COUNTRY_GDELT_LANG[country] || 'spanish'
  let query = `sourcelang:${lang}`

  // Add category keywords if not ALL
  if (category !== 'ALL') {
    const categoryKeywords: Record<string, Record<string, string>> = {
      spanish: {
        politics: 'política',
        economy: 'economía',
        tech: 'tecnología',
        science: 'ciencia',
        health: 'salud',
        environment: 'clima',
        culture: 'cultura',
        sports: 'deportes',
        security: 'seguridad',
        international: 'internacional',
        entertainment: 'entretenimiento',
        education: 'educación',
        justice: 'justicia',
        human_rights: 'derechos humanos',
        elections: 'elecciones',
      },
      english: {
        politics: 'politics',
        economy: 'economy',
        tech: 'technology',
        science: 'science',
        health: 'health',
        environment: 'climate',
        culture: 'culture',
        sports: 'sports',
        security: 'security',
        international: 'international',
        entertainment: 'entertainment',
        education: 'education',
        justice: 'justice',
        human_rights: 'human rights',
        elections: 'elections',
      },
      portuguese: {
        politics: 'política',
        economy: 'economia',
        tech: 'tecnologia',
        science: 'ciência',
        health: 'saúde',
        environment: 'clima',
        culture: 'cultura',
        sports: 'esportes',
        security: 'segurança',
        international: 'internacional',
        entertainment: 'entretenimento',
        education: 'educação',
        justice: 'justiça',
        human_rights: 'direitos humanos',
        elections: 'eleições',
      },
    }

    const categories = category.toLowerCase().split(',')
    const langKeywords = categoryKeywords[lang] || categoryKeywords.spanish
    const keywords = categories
      .map(c => langKeywords[c.trim()])
      .filter(Boolean)
      .join(' OR ')

    if (keywords) {
      query += ` (${keywords})`
    }
  }

  return query
}

// ── Country → content language code ───────────────────────────
function getContentLanguage(country: string): string {
  if (['US', 'GB', 'CA', 'AU'].includes(country)) return 'en'
  if (['BR', 'PT'].includes(country)) return 'pt'
  return 'es'
}

// ── Ultimate RSS Fallback (Zero-Dependency) ───────────────────
async function fetchRssFallback(lang: string, country: string) {
  let url = 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada'
  if (lang === 'en') url = 'http://feeds.bbci.co.uk/news/rss.xml'
  if (lang === 'pt') url = 'https://g1.globo.com/rss/g1/'

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    const text = await res.text()
    
    // Simple regex XML parser
    const items = text.split(/<item[\s>]/i).slice(1)
    return items.map((item, i) => {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || item.match(/<title>(.*?)<\/title>/i)
      const linkMatch = item.match(/<link>(.*?)<\/link>/i)
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) || item.match(/<description>(.*?)<\/description>/i)
      const imgMatch = item.match(/<media:content[^>]*url="([^"]+)"/i) || item.match(/<enclosure[^>]*url="([^"]+)"/i)
      
      const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : 'Noticia Internacional'
      const articleUrl = linkMatch ? linkMatch[1] : `https://news.google.com/?item=${i}`
      let excerpt = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 160) : ''
      if (excerpt && !excerpt.endsWith('.')) excerpt += '...'
      const image_url = imgMatch ? imgMatch[1] : null

      return mapToArticle({
        id: `rss-${Date.now()}-${i}`,
        url: articleUrl,
        title,
        excerpt,
        image_url,
        published_at: new Date().toISOString(),
        analysis_status: 'pending',
        trending_score: 0.8 + Math.random() * 0.2,
        language: lang,
        country_code: country,
        // Mock outlet to satisfy UI without needing Supabase FK
        outlet: {
           name: lang === 'en' ? 'BBC News' : lang === 'pt' ? 'G1 Globo' : 'El País',
           domain: lang === 'en' ? 'bbc.co.uk' : lang === 'pt' ? 'globo.com' : 'elpais.com',
           currentVeritasAvg: 65 + Math.floor(Math.random() * 20)
        }
      })
    }).slice(0, 15) // Max 15 articles
  } catch (e) {
    console.error('RSS Fallback failed:', e)
    return []
  }
}

// ── Helper to map snake_case to camelCase Article ─────────────────
function mapToArticle(art: any): any {
  return {
    id: art.id,
    url: art.url,
    title: art.title,
    titleNeutralized: art.title_neutralized || art.titleNeutralized || null,
    excerpt: art.excerpt || '',
    imageUrl: art.image_url || art.imageUrl || null,
    outlet: art.outlet || null,
    publishedAt: art.published_at || art.publishedAt || new Date().toISOString(),
    category: art.category || 'noticia',
    countryCode: art.country_code || art.countryCode || 'CO',
    language: art.language || 'es',
    veritasScore: art.veritas_score || art.veritasScore || null,
    analysisStatus: art.analysis_status || art.analysisStatus || 'pending',
    techniquesDetected: art.techniques_detected || art.techniquesDetected || [],
    viewCount: art.view_count || art.viewCount || 0,
    trendingScore: art.trending_score || art.trendingScore || 0,
    tags: art.tags || [],
  }
}

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    // Return empty state gracefully instead of 500 so UI doesn't crash
    return NextResponse.json({ 
      articles: [], 
      hasMore: false, 
      source: 'gdelt_empty',
      message: 'Faltan variables de entorno de Supabase en Vercel.' 
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || searchParams.get('topics') || searchParams.get('topic') || 'ALL'
    const country = searchParams.get('country') || searchParams.get('countryCode') || 'ALL'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('perPage') || '12')
    const offset = (page - 1) * limit

    // 1. Try fetching from Supabase first (cached/ingested articles)
    let query = supabase
      .from('articles')
      .select('*, outlet:media_outlets(*)')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category !== 'ALL') {
      const categoryList = category.toLowerCase().split(',')
      query = query.in('category', categoryList)
    }
    if (country !== 'ALL') {
      query = query.eq('country_code', country)
    }

    let dbArticles: any[] | null = null
    let dbError: any = null

    try {
      const result = await query
      dbArticles = result.data
      dbError = result.error
    } catch (e: any) {
      console.warn('⚠️ Supabase network error (fallback to GDELT):', e.message)
    }

    if (dbError) {
      console.warn('⚠️ Supabase query warning:', dbError.message)
    }

    // 2. If DB has articles, return them directly
    if (dbArticles && dbArticles.length > 0) {
      return NextResponse.json({
        articles: dbArticles.map(mapToArticle),
        hasMore: dbArticles.length === limit,
        source: 'supabase',
        nextPage: page + 1,
      })
    }

    // 3. DB empty → fetch from GDELT in real-time
    console.log(`🔄 DB empty for country=${country}. Fetching real-time from GDELT...`)

    const gdeltQuery = buildGdeltQuery(country === 'ALL' ? 'CO' : country, category)
    const contentLang = getContentLanguage(country === 'ALL' ? 'CO' : country)

    const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/doc/doc'
    const gdeltParams = new URLSearchParams({
      format: 'json',
      timespan: '24h',
      query: gdeltQuery,
      maxrecords: String(Math.min(limit * 2, 50)),
      mode: 'artlist',
    })

    try {
      // Bulletproof timeout using Promise.race (avoids AbortSignal edge cases)
      const fetchPromise = fetch(`${GDELT_API_URL}?${gdeltParams.toString()}`)
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error('GDELT Timeout')), 6000)
      })
      
      const gdeltRes = await Promise.race([fetchPromise, timeoutPromise])

      if (!gdeltRes.ok) {
        throw new Error(`GDELT API responded with ${gdeltRes.status}`)
      }

      const gdeltData = await gdeltRes.json()
      const rawArticles = gdeltData.articles || []

      if (rawArticles.length === 0) {
        return NextResponse.json({
          articles: [],
          hasMore: false,
          source: 'gdelt_empty',
          message: 'No real-time news found for this region in the last 24h.',
        })
      }

      // 4. Map GDELT articles to our schema (WITHOUT outlet_id to avoid FK violations)
      const articles = rawArticles.map((art: any) => {
        // Simple edge-compatible hash for ID
        let hash = 0;
        for (let i = 0; i < art.url.length; i++) {
          hash = ((hash << 5) - hash) + art.url.charCodeAt(i);
          hash = hash & hash;
        }
        const articleId = `gdelt-${Math.abs(hash)}-${Date.now()}`;
        const rawDate = art.seendate || ''
        let publishedAt = new Date().toISOString()

        if (rawDate.length >= 14) {
          try {
            publishedAt = new Date(
              `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}T${rawDate.slice(8, 10)}:${rawDate.slice(10, 12)}:${rawDate.slice(12, 14)}Z`
            ).toISOString()
          } catch (_e) {
            // Keep default
          }
        }

        return {
          id: articleId,
          url: art.url,
          title: art.title,
          excerpt: art.excerpt || null,
          image_url: art.socialimage || null,
          published_at: publishedAt,
          analysis_status: 'pending',
          trending_score: Math.random(),
          language: contentLang,
          country_code: country === 'ALL' ? 'CO' : country,
          // NOTE: outlet_id intentionally omitted — FK constraint in Supabase
          // Articles will be enriched with outlet_id by the cron ingestion job
        }
      })

      // Map to frontend camelCase AFTER saving to Supabase
      const mappedArticles = articles.map(mapToArticle)

      // 5. Background upsert (non-blocking) — only fields without FK constraints
      void (async () => {
        try {
          // Try upsert; if outlet_id NOT NULL constraint fails, we just skip persistence
          // The articles are still returned to the user from GDELT directly
          const { error: upsertError } = await supabase
            .from('articles')
            .upsert(articles, { onConflict: 'id', ignoreDuplicates: true })

          if (upsertError) {
            console.warn('⚠️ Background upsert skipped (likely FK constraint):', upsertError.message)
          } else {
            console.log(`✅ ${articles.length} articles cached from GDELT`)
          }
        } catch (e) {
          console.warn('⚠️ Background upsert error:', e)
        }
      })()

      // Return GDELT articles immediately (don't wait for upsert)
      return NextResponse.json({
        articles: mappedArticles,
        hasMore: rawArticles.length >= limit,
        source: 'gdelt_live',
        nextPage: page + 1,
      })
    } catch (gdeltError: any) {
      console.error('❌ GDELT Fetch Error (Falling back to RSS):', gdeltError.message)

      // Ultimate Fallback: Fetch real news from public RSS feeds
      const rssArticles = await fetchRssFallback(contentLang, country === 'ALL' ? 'CO' : country)
      
      if (rssArticles.length > 0) {
        return NextResponse.json({
          articles: rssArticles,
          hasMore: false,
          source: 'rss_fallback',
          message: 'Mostrando últimas noticias de agencias principales (GDELT no disponible).',
        })
      }

      // Graceful degradation: return empty only if EVERYTHING fails
      return NextResponse.json({
        articles: [],
        hasMore: false,
        source: 'gdelt_unavailable',
        message: 'Servicios de noticias temporalmente no disponibles.',
      })
    }
  } catch (error: any) {
    console.error('❌ Feed API Critical Error:', error)
    // Never return 500, always return empty array gracefully to prevent UI crash
    return NextResponse.json({
      articles: [],
      hasMore: false,
      source: 'error',
      message: 'Error crítico en el motor de noticias.',
      details: error.message || 'Unknown error',
    })
  }
}
