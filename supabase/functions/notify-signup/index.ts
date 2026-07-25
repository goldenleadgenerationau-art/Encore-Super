// Called by the frontend right after a sign-up succeeds. Sends an internal
// notification to the sales inbox via Resend — best-effort only, a failure
// here never blocks or errors out the user's actual sign-up.
import { requiredEnv } from '../_shared/square.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface NotifyBody {
  email: string
}

// TODO: switch to sales@encoresuper.com.au once a domain is verified in
// Resend without needing a paid plan (free tier caps at one verified domain
// per account, and their unverified/testing sender can only deliver to the
// Resend account owner's own address) — this is that address for now.
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
    const { email } = (await req.json()) as NotifyBody
    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${requiredEnv('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [SALES_INBOX],
        subject: `New Encore Super sign-up: ${email}`,
        text: `New account created on Encore Super.\n\nEmail: ${email}\nTime: ${new Date().toISOString()}`,
      }),
    })

    if (!res.ok) {
      console.error('Resend error', await res.text())
      return new Response(JSON.stringify({ error: 'Failed to send notification' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Notify failed' }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
