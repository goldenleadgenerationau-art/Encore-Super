// Receives Square subscription lifecycle events (subscription.created,
// subscription.updated) and keeps `subscriptions.status` in sync. This is
// what actually reflects cancellations/failed renewals, not just the
// initial checkout call.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { requiredEnv } from '../_shared/square.ts'

async function isValidSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false
  const signatureKey = requiredEnv('SQUARE_WEBHOOK_SIGNATURE_KEY')
  const notificationUrl = requiredEnv('SQUARE_WEBHOOK_URL')

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(signatureKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(notificationUrl + rawBody))
  const expected = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))
  return expected === signatureHeader
}

interface SquareSubscriptionEvent {
  type: string
  data: {
    object: {
      subscription: {
        id: string
        status: string
        charged_through_date?: string
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-square-hmacsha256-signature')

  if (!(await isValidSignature(rawBody, signature))) {
    return new Response('Invalid signature', { status: 401 })
  }

  const event = JSON.parse(rawBody) as SquareSubscriptionEvent

  if (event.type === 'subscription.created' || event.type === 'subscription.updated') {
    const sub = event.data.object.subscription
    const admin = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'))

    await admin
      .from('subscriptions')
      .update({
        status: sub.status,
        current_period_end: sub.charged_through_date ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('square_subscription_id', sub.id)
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})
