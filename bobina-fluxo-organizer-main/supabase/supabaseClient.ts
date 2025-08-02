import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string = process.env.SUPABASE_URL || ''
const supabaseKey: string = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  throw new Error('URL ou chave do Supabase não está definida nas variáveis de ambiente.')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)
