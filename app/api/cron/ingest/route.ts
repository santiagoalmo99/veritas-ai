import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseGdeltDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/doc/doc'

// Only allow calls with a secret token for security in Vercel
const CRON_SECRET = process.env.CRON_SECRET || 'veritas_debug_key'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  if (authHeader !== `Bearer ${CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('[Cron Ingest]: Starting news ingestion from GDELT...')

    // 1. Load known outlets from Supabase (real data, not mock)
    const { data: dbOutlets } = await supabase
      .from('media_outlets')
      .select('id, domain, country_code, current_veritas_avg')

    const outletMap = new Map(
      (dbOutlets || []).map(o => [o.domain, o])
    )
    
    // 2. Fetch from GDELT (last 24h, high volume)
    const gdeltParams = new URLSearchParams({
      format: 'json',
      timespan: '24h',
      query: 'sourcelang:spanish',
      maxrecords: '150',
      mode: 'artlist'
    })

    const response = await fetch(`${GDELT_API_URL}?${gdeltParams.toString()}`, {
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error(`GDELT responded with ${response.status}`)
    }

    const data = await response.json()

    if (!data.articles || data.articles.length === 0) {
      return NextResponse.json({ message: 'No new articles found in GDELT' })
    }

    // 3. Filter and Map to DB Schema
    const articlesToInsert = data.articles.map((art: any) => {
      let domain = ''
      try {
        domain = new URL(art.url).hostname.replace('www.', '')
      } catch {
        domain = 'unknown'
      }

      const knownOutlet = outletMap.get(domain)
      
      // Heuristic score for ingestion
      const urlHash = art.url.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
      const veritasScore = knownOutlet ? knownOutlet.current_veritas_avg : (20 + (urlHash % 50))

      return {
        id: `gdelt-${Buffer.from(art.url).toString('hex').slice(0, 16)}`,
        url: art.url,
        title: art.title,
        excerpt: art.excerpt || null,
        image_url: art.socialimage || null,
        outlet_id: knownOutlet?.id || null,
        journalist: art.source || null,
        published_at: art.seendate ? parseGdeltDate(art.seendate).toISOString() : new Date().toISOString(),
        category: 'politics', // Default category, can be enhanced with NLP
        country_code: knownOutlet?.country_code || 'ALL',
        language: 'es',
        veritas_score: veritasScore,
        analysis_status: 'pending',
        trending_score: Math.floor(Math.random() * 100),
        tags: []
      }
    })

    // 4. Filter out articles without valid outlet_id (FK constraint protection)
    const validArticles = articlesToInsert.filter((a: any) => a.outlet_id !== null)
    const skippedCount = articlesToInsert.length - validArticles.length

    // 5. Upsert to Supabase
    if (validArticles.length > 0) {
      const { error } = await supabase
        .from('articles')
        .upsert(validArticles, { 
          onConflict: 'id',
          ignoreDuplicates: true 
        })

      if (error) throw error
    }

    return NextResponse.json({ 
      success: true, 
      ingested: validArticles.length,
      skipped: skippedCount,
      reason_skipped: skippedCount > 0 ? 'No matching outlet in database' : undefined,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[Cron Ingest Error]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
