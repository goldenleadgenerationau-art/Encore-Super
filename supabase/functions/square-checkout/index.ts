// Called by the frontend after the Square Web Payments SDK tokenizes a card.
// Creates (or reuses) a Square customer, stores the card, starts a subscription
// against one of two pre-configured plan variations ($12.99/month or
// $99/year), and records the result in `subscriptions` using the service-role key.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { squareFetch, requiredEnv } from '../_shared/square.ts'
import { corsHeaders } from '../_shared/cors.ts'

type BillingInterval = 'monthly' | 'yearly'

interface CheckoutBody {
  sourceId: string // card nonce from Square Web Payments SDK
  billingInterval: BillingInterval
}

function planVariationIdFor(interval: BillingInterval): string {
  return interval === 'yearly'
    ? requiredEnv('SQUARE_PLAN_VARIATION_ID_YEARLY')
    : requiredEnv('SQUARE_PLAN_VARIATION_ID_MONTHLY')
}

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

    const { sourceId, billingInterval } = (await req.json()) as CheckoutBody
    if (!sourceId) {
      return new Response(JSON.stringify({ error: 'Missing sourceId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (billingInterval !== 'monthly' && billingInterval !== 'yearly') {
      return new Response(JSON.stringify({ error: 'Missing or invalid billingInterval' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'))

    const { data: existing } = await admin
      .from('subscriptions')
      .select('square_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = existing?.square_customer_id as string | undefined

    if (!customerId) {
      const customerRes = await squareFetch<{ customer: { id: string } }>('/v2/customers', {
        method: 'POST',
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          email_address: user.email,
          reference_id: user.id,
        }),
      })
      customerId = customerRes.customer.id
    }

    const cardRes = await squareFetch<{ card: { id: string } }>('/v2/cards', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        source_id: sourceId,
        card: { customer_id: customerId },
      }),
    })

    const subscriptionRes = await squareFetch<{
      subscription: { id: string; status: string; charged_through_date?: string }
    }>('/v2/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        location_id: requiredEnv('SQUARE_LOCATION_ID'),
        customer_id: customerId,
        plan_variation_id: planVariationIdFor(billingInterval),
        card_id: cardRes.card.id,
      }),
    })

    await admin.from('subscriptions').upsert({
      user_id: user.id,
      square_customer_id: customerId,
      square_subscription_id: subscriptionRes.subscription.id,
      billing_interval: billingInterval,
      status: subscriptionRes.subscription.status,
      current_period_end: subscriptionRes.subscription.charged_through_date ?? null,
      updated_at: new Date().toISOString(),
    })

    return new Response(JSON.stringify({ status: subscriptionRes.subscription.status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Checkout failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
