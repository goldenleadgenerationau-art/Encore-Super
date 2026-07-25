import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.warn(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — accounts, saved band rosters, and billing will not work until they are configured. The calculator, scenarios, and other non-account tools still work.'
  )
}

// A syntactically valid placeholder URL so the client can construct without
// throwing when unconfigured — every real call will just fail gracefully
// (network/auth error) instead of crashing the whole app at import time.
export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-anon-key')
