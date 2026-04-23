import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Leer .env.local manualmente para evitar dependencia de 'dotenv'
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
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no encontrados.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function clearMocks() {
  console.log('🧹 Limpiando artículos simulados...')
  
  await supabase.from('article_techniques').delete().neq('article_id', 'keep')
  await supabase.from('article_analysis_logs').delete().neq('article_id', 'keep')
  const { error } = await supabase.from('articles').delete().neq('id', 'keep')

  if (error) console.error('❌ Error:', error)
  else console.log('✅ Base de datos purificada.')
}

clearMocks()
