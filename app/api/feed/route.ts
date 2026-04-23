import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

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
    const category = searchParams.get('category') || 'ALL'
    const countryCode = searchParams.get('countryCode') || 'ALL'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 12
    const offset = (page - 1) * limit

    // 1. Intentar obtener noticias de la Base de Datos (Supabase)
    let query = supabase
      .from('articles')
      .select('*, outlet:media_outlets(*)')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category !== 'ALL') {
      query = query.eq('category', category.toLowerCase())
    }
    if (countryCode !== 'ALL') {
      query = query.eq('country_code', countryCode)
    }

    const { data: dbArticles, error: dbError } = await query

    // 2. Si hay datos en la DB, los devolvemos directamente
    if (dbArticles && dbArticles.length > 0) {
      return NextResponse.json({
        articles: dbArticles,
        hasMore: dbArticles.length === limit,
        source: 'supabase'
      })
    }

    // 3. Si la DB está vacía (Bootstrap), le pedimos a GDELT en tiempo real
    console.log('🔄 DB Vacía. Solicitando datos reales a GDELT...')
    
    const GDELT_API_URL = 'http://api.gdeltproject.org/api/v2/doc/doc'
    const gdeltParams = new URLSearchParams({
      format: 'json',
      timespan: '24h',
      query: 'sourcelang:spanish',
      maxrecords: '24',
      mode: 'artlist'
    })

    const gdeltRes = await fetch(`${GDELT_API_URL}?${gdeltParams.toString()}`, {
      next: { revalidate: 300 }, // Caché de 5 min
      signal: AbortSignal.timeout(45000)
    })

    const gdeltData = await gdeltRes.json()
    const rawArticles = gdeltData.articles || []

    if (rawArticles.length === 0) {
      return NextResponse.json({
        articles: [],
        hasMore: false,
        source: 'gdelt_empty',
        message: 'No hay noticias reales en las últimas 24h.'
      })
    }

    // 4. Mapear e inyectar en la DB para futuras consultas (Autónomo)
    const articles = rawArticles.map((art: any) => {
      const articleId = Buffer.from(art.url).toString('base64url')
      const rawDate = art.seendate || ''
      let publishedAt = new Date().toISOString()
      
      if (rawDate.length >= 14) {
        try {
          publishedAt = new Date(
            `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}T${rawDate.slice(8, 10)}:${rawDate.slice(10, 12)}:${rawDate.slice(12, 14)}Z`
          ).toISOString()
        } catch (e) {}
      }

      return {
        id: articleId,
        url: art.url,
        title: art.title,
        excerpt: art.excerpt || 'Noticia real de 2026 capturada por VeritasAI.',
        image_url: art.socialimage || null,
        published_at: publishedAt,
        analysis_status: 'pending',
        trending_score: Math.random(),
        language: 'es',
        country_code: countryCode === 'ALL' ? 'ES' : countryCode
      }
    })

    // Upsert asíncrono para que no bloquee la respuesta
    supabase.from('articles').upsert(articles).then(() => {
      console.log('✅ DB poblada automáticamente con noticias de GDELT.')
    })

    return NextResponse.json({
      articles,
      hasMore: false,
      source: 'gdelt_live'
    })

  } catch (error) {
    console.error('❌ Feed API Error:', error)
    return NextResponse.json({ 
      error: 'Error crítico en el motor de noticias reales.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
