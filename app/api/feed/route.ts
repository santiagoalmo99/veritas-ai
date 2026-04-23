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
        politics: 'política gobierno',
        economy: 'economía finanzas mercados',
        tech: 'tecnología inteligencia artificial',
        science: 'ciencia investigación',
        health: 'salud medicina',
        environment: 'medio ambiente clima',
        culture: 'cultura arte',
        sports: 'deportes fútbol',
        security: 'seguridad crimen',
        international: 'internacional geopolítica',
        entertainment: 'entretenimiento cine',
        education: 'educación universidades',
        justice: 'justicia tribunal',
        human_rights: 'derechos humanos',
        elections: 'elecciones votación',
      },
      english: {
        politics: 'politics government',
        economy: 'economy finance markets',
        tech: 'technology artificial intelligence',
        science: 'science research',
        health: 'health medicine',
        environment: 'environment climate',
        culture: 'culture arts',
        sports: 'sports football soccer',
        security: 'security crime',
        international: 'international geopolitics',
        entertainment: 'entertainment cinema',
        education: 'education university',
        justice: 'justice court',
        human_rights: 'human rights',
        elections: 'elections voting',
      },
      portuguese: {
        politics: 'política governo',
        economy: 'economia finanças',
        tech: 'tecnologia inteligência artificial',
        science: 'ciência pesquisa',
        health: 'saúde medicina',
        environment: 'meio ambiente clima',
        culture: 'cultura arte',
        sports: 'esportes futebol',
        security: 'segurança crime',
        international: 'internacional geopolítica',
        entertainment: 'entretenimento cinema',
        education: 'educação universidade',
        justice: 'justiça tribunal',
        human_rights: 'direitos humanos',
        elections: 'eleições votação',
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

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase environment variables')
    return NextResponse.json({ error: 'Database credentials not configured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

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

    const { data: dbArticles, error: dbError } = await query

    if (dbError) {
      console.warn('⚠️ Supabase query warning:', dbError.message)
    }

    // 2. If DB has articles, return them directly
    if (dbArticles && dbArticles.length > 0) {
      return NextResponse.json({
        articles: dbArticles,
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
      const gdeltRes = await fetch(`${GDELT_API_URL}?${gdeltParams.toString()}`, {
        signal: AbortSignal.timeout(10000), // 10s timeout (down from 45s)
      })

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
        articles,
        hasMore: rawArticles.length >= limit,
        source: 'gdelt_live',
        nextPage: page + 1,
      })
    } catch (gdeltError: any) {
      console.error('❌ GDELT Fetch Error:', gdeltError.message)

      // Graceful degradation: return empty instead of 502
      return NextResponse.json({
        articles: [],
        hasMore: false,
        source: 'gdelt_unavailable',
        message: 'GDELT temporarily unavailable. Please try again.',
      })
    }
  } catch (error: any) {
    console.error('❌ Feed API Critical Error:', error)
    return NextResponse.json({
      error: 'Critical error in the news engine.',
      details: error.message || 'Unknown error',
    }, { status: 500 })
  }
}
