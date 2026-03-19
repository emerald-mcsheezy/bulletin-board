import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aoyshhaasusnmfalskvu.supabase.co'
const supabaseKey = 'sb_publishable__K0LRp0scUyFFstAxi94tg_FyiXL88j'

export const supabase = createClient(supabaseUrl, supabaseKey)