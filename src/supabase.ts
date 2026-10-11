import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null

export async function saveResponse(row: Record<string, unknown>) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local')
  }
  // No .select() afterwards: respondents are allowed to insert, but not to read rows back.
  const { error } = await supabase.from('responses').insert(row)
  if (error) throw error
}
