import type { View } from '../../types'
import { Card } from './Badge'

export function Paywall({
  title,
  body,
  setView,
}: {
  title: string
  body: string
  setView: (v: View) => void
}) {
  return (
    <Card className="mx-auto max-w-md text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-copper-400">Full access</p>
      <p className="mt-3 font-display text-2xl text-plum-100">{title}</p>
      <p className="mt-3 text-sm text-plum-400">{body}</p>
      <button
        onClick={() => setView('pricing')}
        className="mt-6 w-full rounded-full bg-gradient-to-b from-copper-400 to-copper-500 px-6 py-3 font-semibold text-plum-950 shadow-lg shadow-copper-500/20 transition-transform hover:scale-[1.01]"
      >
        See plans — from $99/year
      </button>
    </Card>
  )
}
