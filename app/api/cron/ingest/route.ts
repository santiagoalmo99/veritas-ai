import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MEDIA_OUTLETS } from '@/lib/mock-data'
import { parseGdeltDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/context/context'

// Solo permitir llamadas con un token secreto para seguridad en Vercel
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
    
    // 1. Fetch from GDELT (last 24h, high volume)
    const gdeltParams = new URLSearchParams({
      format: 'json',
      timespan: '24h',
      query: 'sourcelang:spanish',
      maxrecords: '150',
      mode: 'artlist'
    })

    const response = await fetch(`${GDELT_API_URL}?${gdeltParams.toString()}`)
    const data = await response.json()

    if (!data.articles || data.articles.length === 0) {
      return NextResponse.json({ message: 'No new articles found in GDELT' })
    }

    // 2. Filter and Map to DB Schema
    const articlesToInsert = data.articles.map((art: any) => {
      const domain = new URL(art.url).hostname.replace('www.', '')
      const knownOutlet = MEDIA_OUTLETS.find(m => m.domain === domain)
      
      // Heuristic score for ingestion
      const urlHash = art.url.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
      const veritasScore = knownOutlet ? knownOutlet.currentVeritasAvg : (20 + (urlHash % 50))

      return {
        id: `gdelt-${Buffer.from(art.url).toString('hex').slice(0, 16)}`,
        url: art.url,
        title: art.title,
        excerpt: art.excerpt || 'Análisis automatizado en proceso...',
        image_url: art.socialimage || null,
        outlet_id: knownOutlet?.id || 'unknown',
        journalist: art.source || 'Redacción',
        published_at: art.seendate ? parseGdeltDate(art.seendate).toISOString() : new Date().toISOString(),
        category: 'noticia',
        country_code: knownOutlet?.countryCode || 'ALL',
        language: 'es',
        veritas_score: veritasScore,
        analysis_status: 'completed',
        trending_score: Math.floor(Math.random() * 100),
        tags: []
      }
    })

    // 3. Upsert to Supabase
    const { error, count } = await supabase
      .from('articles')
      .upsert(articlesToInsert, { 
        onConflict: 'url',
        ignoreDuplicates: false 
      })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      ingested: articlesToInsert.length,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[Cron Ingest Error]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
