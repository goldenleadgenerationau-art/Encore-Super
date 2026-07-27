import { useEffect, useRef, useState } from 'react'
import { Card } from './ui/Badge'
import { useAuth } from '../context/AuthContext'
import { useAccess } from '../context/AccessContext'
import { supabase } from '../lib/supabaseClient'
import { loadSquareSdk } from '../lib/loadSquareSdk'
import { extractFunctionError } from '../lib/functionError'
import { AuthForm } from './AuthForm'

type BillingInterval = 'monthly' | 'yearly'

const included = [
  'Unlimited Gig Super Calculator use, including band lump-sum splitting',
  'Full Scenario Library, including agent bookings, own-company bookings, and band-representative situations',
  'Payday Deadline Tracker for every booking',
  'A saved Band Roster so you never re-type member details for a gig again',
  'CSV export of every calculation, ready for your accounting software',
  'One-click unpaid super demand letter (PDF) for any booking — cites the actual rules, ready to send',
  'Rule updates as ATO/Fair Work guidance changes, included for as long as you subscribe',
]

const plans: Record<
  BillingInterval,
  { label: string; price: string; unit: string; sublabel: string; badge?: string }
> = {
  yearly: {
    label: 'Yearly',
    price: '$99',
    unit: '/year',
    sublabel: 'works out to $8.25/month',
    badge: 'Recommended · save over $55/year',
  },
  monthly: {
    label: 'Monthly',
    price: '$12.99',
    unit: '/month',
    sublabel: 'billed every month',
    badge: "Less than the price of a pint at the venue you're playing!",
  },
}

function PlanSelector({
  billingInterval,
  setBillingInterval,
}: {
  billingInterval: BillingInterval
  setBillingInterval: (b: BillingInterval) => void
}) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {(Object.keys(plans) as BillingInterval[]).map((key) => {
        const plan = plans[key]
        const active = billingInterval === key
        return (
          <button
            key={key}
            onClick={() => setBillingInterval(key)}
            className={`rounded-2xl border p-5 text-left transition-colors ${
              active
                ? 'border-copper-400 bg-plum-900/80'
                : 'border-plum-700 bg-plum-900/40 hover:border-plum-600'
            }`}
          >
            {plan.badge && (
              <span className="inline-block rounded-full bg-copper-400/10 px-2.5 py-0.5 text-xs font-medium text-copper-300">
                {plan.badge}
              </span>
            )}
            <p className="mt-2 font-display text-2xl text-plum-100">
              {plan.price} <span className="text-sm font-sans text-plum-400">{plan.unit}</span>
            </p>
            <p className="mt-1 text-sm text-plum-400">{plan.sublabel}</p>
          </button>
        )
      })}
    </div>
  )
}

function SquareCheckoutForm({
  billingInterval,
  onSuccess,
}: {
  billingInterval: BillingInterval
  onSuccess: () => void
}) {
  const { refresh } = useAccess()
  const cardRef = useRef<SquareCard | null>(null)
  const [cardReady, setCardReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadSquareSdk()
      .then(async () => {
        if (cancelled || !window.Square) return
        const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID
        if (!appId || !locationId) {
          setError('Square is not configured yet (missing application/location ID).')
          return
        }
        const payments = window.Square.payments(appId, locationId)
        const card = await payments.card()
        await card.attach('#square-card-container')
        cardRef.current = card
        setCardReady(true)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load Square'))

    return () => {
      cancelled = true
      cardRef.current?.destroy()
    }
  }, [])

  async function handleSubscribe() {
    if (!cardRef.current) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await cardRef.current.tokenize()
      if (result.status !== 'OK' || !result.token) {
        setError(result.errors?.[0]?.message ?? 'Card was declined')
        setSubmitting(false)
        return
      }
      const { data, error: fnError } = await supabase.functions.invoke('square-checkout', {
        body: { sourceId: result.token, billingInterval },
      })
      if (fnError) {
        setError(await extractFunctionError(fnError, 'Checkout failed'))
        setSubmitting(false)
        return
      }
      if (data?.error) {
        setError(data.error)
        setSubmitting(false)
        return
      }
      await refresh()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div id="square-card-container" className="mt-6 rounded-lg border border-plum-600 bg-plum-950 p-3" />
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button
        onClick={handleSubscribe}
        disabled={!cardReady || submitting}
        className="mt-4 w-full rounded-full bg-gradient-to-b from-copper-400 to-copper-500 px-6 py-3 font-semibold text-plum-950 shadow-lg shadow-copper-500/20 transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {submitting ? 'Processing…' : `Subscribe — ${plans[billingInterval].price}${plans[billingInterval].unit}`}
      </button>
      {import.meta.env.VITE_SQUARE_ENVIRONMENT !== 'production' && (
        <p className="mt-3 text-xs text-plum-400">
          Square sandbox mode — use a{' '}
          <a
            href="https://developer.squareup.com/docs/testing/sandbox"
            target="_blank"
            rel="noreferrer"
            className="text-copper-400 hover:underline"
          >
            Square test card
          </a>
          , no real charge will be made.
        </p>
      )}
    </>
  )
}

function ManageSubscription() {
  const { subscriptionStatus, cancelAtPeriodEnd, currentPeriodEnd, cancelSubscription } = useAccess()
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const formattedEnd = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  if (cancelAtPeriodEnd || done) {
    return (
      <p className="mt-8 text-sm text-copper-300">
        Your subscription is cancelled and won't renew
        {formattedEnd ? ` — you'll keep full access until ${formattedEnd}.` : '.'}
      </p>
    )
  }

  async function handleCancel() {
    setCancelling(true)
    setError(null)
    const { error } = await cancelSubscription()
    setCancelling(false)
    if (error) {
      setError(error)
      return
    }
    setDone(true)
  }

  return (
    <div className="mt-8">
      <p className="text-sm text-copper-300">
        You already have full access{subscriptionStatus === 'ACTIVE' ? ' — subscription active.' : '.'}
      </p>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {confirming ? (
        <div className="mt-4 rounded-xl border border-dashed border-plum-600 p-4">
          <p className="text-sm text-plum-200">
            Cancel your subscription? You'll keep full access until the end of the current billing
            period, then it won't renew.
          </p>
          <div className="mt-3 flex justify-center gap-3">
            <button
              onClick={() => setConfirming(false)}
              className="rounded-full border border-plum-600 px-4 py-1.5 text-sm text-plum-200 hover:border-copper-400"
            >
              Never mind
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="rounded-full bg-red-500/90 px-4 py-1.5 text-sm font-medium text-plum-950 hover:bg-red-500 disabled:opacity-60"
            >
              {cancelling ? 'Cancelling…' : 'Yes, cancel'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="mt-3 text-sm text-plum-400 hover:text-red-400 hover:underline"
        >
          Cancel subscription
        </button>
      )}
    </div>
  )
}

export function Pricing() {
  const { user } = useAuth()
  const { hasFullAccess, subscriptionStatus } = useAccess()
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('yearly')
  const [justSubscribed, setJustSubscribed] = useState(false)

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-copper-400">Full access</p>
      <h1 className="mt-4 font-display text-4xl text-plum-100">Choose your plan</h1>
      <p className="mt-2 text-plum-400">Same full access either way. Cancel anytime.</p>

      <PlanSelector billingInterval={billingInterval} setBillingInterval={setBillingInterval} />

      <Card className="mt-8 text-left">
        <ul className="space-y-3 text-sm text-plum-200">
          {included.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-copper-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {!user ? (
        <div className="mt-8">
          <AuthForm prompt="Sign in (or create an account) to subscribe." />
        </div>
      ) : hasFullAccess ? (
        justSubscribed ? (
          <p className="mt-8 text-sm text-copper-300">
            {`Payment successful! You now have full access${subscriptionStatus === 'ACTIVE' ? ' — subscription active.' : '.'}`}
          </p>
        ) : (
          <ManageSubscription />
        )
      ) : (
        <SquareCheckoutForm billingInterval={billingInterval} onSuccess={() => setJustSubscribed(true)} />
      )}

      <p className="mt-6 text-xs text-plum-400">
        Encore Super provides general information, not personal financial or tax advice.
      </p>
    </div>
  )
}
