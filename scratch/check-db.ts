import { supabaseAdmin } from './lib/supabase-service'

async function checkOutlets() {
  const { data, error } = await supabaseAdmin.from('media_outlets').select('id, name').limit(10)
  if (error) {
    console.error(error)
  } else {
    console.log('Outlets:', data)
  }
}

checkOutlets()
