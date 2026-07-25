// Gates the calculator's free-once trial server-side, keyed by caller IP, so
// it can't be reset just by clearing localStorage or opening a private
// window. First request from an IP for a given feature consumes the free
// use and is allowed; every request after that for the same IP+feature is
// denied. Deliberately anonymous (no JWT) since this runs before sign-up.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CheckBody {
  feature: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { feature } = (await req.json()) as CheckBody
    if (!feature) {
      return new Response(JSON.stringify({ error: 'Missing feature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Insert only succeeds the first time this IP+feature pair is seen —
    // that first success IS the free use being granted and consumed in the
    // same step, so there's no window for a race to grant two.
    const { error } = await supabase
      .from('free_use_log')
      .insert({ ip_address: ip, feature })

    const allowed = !error
    if (error && error.code !== '23505') {
      // Anything other than a duplicate-key conflict is a real failure —
      // fail open so a DB hiccup doesn't block a genuine first-time visitor.
      console.error('free_use_log insert error', error)
      return new Response(JSON.stringify({ allowed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ allowed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ allowed: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
