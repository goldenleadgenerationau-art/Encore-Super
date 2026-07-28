// Called by the frontend right after a feedback submission is saved to the
// `feedback` table. Sends an internal notification to the sales inbox via
// Resend — best-effort only, a failure here never blocks or errors out the
// user's actual submission (the row is already saved by that point).
//
// Deliberately self-contained (no imports from ../_shared) so it can be
// pasted directly into the Supabase Dashboard's single-file function editor,
// which can't resolve relative imports into a sibling function's folder.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

interface NotifyBody {
  rating: number
  comment: string
  name?: string
  role?: string
  location?: string
  email?: string
  pagePath?: string
}

// TODO: switch to sales@encoresuper.com.au once a domain is verified in
// Resend without needing a paid plan — see notify-signup for the same note.
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
    const body = (await req.json()) as NotifyBody
    if (!body.comment || !body.rating) {
      return new Response(JSON.stringify({ error: 'Missing rating or comment' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stars = '★'.repeat(body.rating) + '☆'.repeat(5 - body.rating)
    const attribution = [body.name, body.role, body.location].filter(Boolean).join(', ') || 'Anonymous'

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${requiredEnv('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [SALES_INBOX],
        subject: `New Encore Super feedback: ${stars}`,
        text: [
          `New feedback submitted on Encore Super.`,
          ``,
          `Rating: ${stars} (${body.rating}/5)`,
          `From: ${attribution}`,
          body.email ? `Email: ${body.email}` : null,
          body.pagePath ? `Page: ${body.pagePath}` : null,
          ``,
          `"${body.comment}"`,
          ``,
          `Time: ${new Date().toISOString()}`,
        ]
          .filter((line) => line !== null)
          .join('\n'),
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
