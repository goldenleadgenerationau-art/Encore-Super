// Called by the frontend when a signed-in subscriber cancels. Cancels the
// subscription in Square (takes effect at the end of the current billing
// period, not immediately), marks the row so the UI can say "won't renew",
// and sends an internal notification — the final status flip to CANCELED
// still comes from square-webhook when Square actually ends it.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { squareFetch, requiredEnv } from '../_shared/square.ts'
import { corsHeaders } from '../_shared/cors.ts'

// TODO: same interim address as notify-signup — switch once a domain is
// verified in Resend.
const SALES_INBOX = 'goldenleadgenerationau@gmail.com'
const FROM_ADDRESS = 'Encore Super <onboarding@resend.dev>'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const callerClient = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_ANON_KEY'), {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: authError,
    } = await callerClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not signed in' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'))

    const { data: sub } = await admin
      .from('subscriptions')
      .select('square_subscription_id, billing_interval, status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!sub?.square_subscription_id) {
      return new Response(JSON.stringify({ error: 'No subscription found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (sub.status !== 'ACTIVE') {
      return new Response(JSON.stringify({ error: 'Subscription is not active' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const cancelRes = await squareFetch<{
      subscription: { status: string; charged_through_date?: string; canceled_date?: string }
    }>(`/v2/subscriptions/${sub.square_subscription_id}/cancel`, { method: 'POST' })

    await admin
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        status: cancelRes.subscription.status,
        current_period_end: cancelRes.subscription.charged_through_date ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    // Awaited (not fire-and-forget) — Deno Deploy can terminate the isolate
    // right after the response is sent, which would kill an in-flight
    // un-awaited request. A failure here is logged but never blocks the
    // cancellation itself, which has already been applied above.
    try {
      const notifyRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requiredEnv('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [SALES_INBOX],
          subject: `Encore Super subscription cancelled: ${user.email}`,
          text: `A subscriber cancelled.\n\nEmail: ${user.email}\nPlan: ${sub.billing_interval}\nEnds: ${cancelRes.subscription.charged_through_date ?? cancelRes.subscription.canceled_date ?? 'unknown'}\nTime: ${new Date().toISOString()}`,
        }),
      })
      if (!notifyRes.ok) console.error('cancellation notify failed', await notifyRes.text())
    } catch (err) {
      console.error('cancellation notify failed', err)
    }

    return new Response(
      JSON.stringify({ cancelled: true, endsAt: cancelRes.subscription.charged_through_date ?? null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Cancellation failed' }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
