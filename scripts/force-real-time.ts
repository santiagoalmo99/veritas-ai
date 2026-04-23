import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    })
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Variables de Supabase no encontradas.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function ingestFromGdelt() {
  console.log('🚀 Iniciando Ingestión Real de GDELT...')
  
  const GDELT_API_URL = 'http://api.gdeltproject.org/api/v2/doc/doc'
  const params = new URLSearchParams({
    format: 'json',
    timespan: '12h',
    query: 'sourcelang:spanish',
    maxrecords: '50',
    mode: 'artlist'
  })

  try {
    const response = await fetch(`${GDELT_API_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(60000) // 60 segundos
    })
    const data = await response.json()
    const rawArticles = data.articles || []
    
    console.log(`✅ ${rawArticles.length} artículos detectados.`)

    const { data: outlets } = await supabase.from('media_outlets').select('*')
    let insertedCount = 0
    
    for (const art of rawArticles) {
      try {
        const domain = new URL(art.url).hostname.replace('www.', '')
        const outlet = outlets?.find(o => o.domain === domain)
        const articleId = Buffer.from(art.url).toString('base64url')

        const rawDate = art.seendate || ''
        let publishedAt = new Date().toISOString()
        
        try {
          if (rawDate.length >= 14) {
            publishedAt = new Date(
              `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}T${rawDate.slice(8, 10)}:${rawDate.slice(10, 12)}:${rawDate.slice(12, 14)}Z`
            ).toISOString()
          }
        } catch (e) {
          console.log(`⚠️ Fecha inválida para ${art.url}, usando fecha actual.`)
        }

        const { error } = await supabase.from('articles').upsert({
          id: articleId,
          url: art.url,
          title: art.title,
          excerpt: art.excerpt || 'Noticia real de 2026 capturada por VeritasAI.',
          image_url: art.socialimage || null,
          outlet_id: outlet?.id || null,
          published_at: publishedAt,
          category: 'noticia',
          country_code: outlet?.country_code || 'CO',
          language: 'es',
          analysis_status: 'pending',
          view_count: Math.floor(Math.random() * 5000),
          trending_score: Math.random(),
          tags: ['actualidad', 'real-time', '2026']
        })

        if (!error) insertedCount++
      } catch (itemError) {
        console.error(`❌ Error procesando artículo: ${art.url}`, itemError)
      }
    }

    console.log(`✨ Éxito: ${insertedCount} noticias de 2026 inyectadas.`)

  } catch (err) {
    console.error('❌ Error de red/API:', err)
    if (err instanceof SyntaxError) {
      console.log('💡 Tip: Parece que la API de GDELT devolvió HTML o Texto en lugar de JSON. Verifica tu conexión o intenta de nuevo en unos segundos.')
    }
  }
}

ingestFromGdelt()
