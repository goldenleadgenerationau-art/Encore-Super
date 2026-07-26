import { scenarios } from '../data/scenarios'
import { Card, PremiumBadge } from './ui/Badge'
import { useAccess } from '../context/AccessContext'
import type { View } from '../types'

export function Scenarios({ setView }: { setView: (v: View) => void }) {
  const { hasFullAccess } = useAccess()

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-display text-3xl text-plum-200 sm:text-4xl">Scenario Library</h1>
      <p className="mt-3 max-w-2xl text-plum-400">
        Live performance work rarely fits a single template. Find the situation closest
        to yours.
      </p>

      <div className="mt-10 space-y-5">
        {scenarios.map((s) => {
          const locked = s.premium && !hasFullAccess
          return (
            <Card key={s.id}>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl text-plum-100">{s.title}</h2>
                {s.premium && <PremiumBadge />}
              </div>
              <p className="mt-2 text-sm text-plum-400">{s.situation}</p>

              {locked ? (
                <div className="mt-4 rounded-xl border border-dashed border-plum-600 p-4 text-sm text-plum-400">
                  Who owes super and the full breakdown for this scenario are part of full access.{' '}
                  <button onClick={() => setView('pricing')} className="text-copper-400 hover:underline">
                    See plans — from $99/year
                  </button>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm">
                    <span className="font-medium text-copper-300">Who generally owes super: </span>
                    <span className="text-plum-200">{s.whoOwes}</span>
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-plum-400">
                    {s.keyPoints.map((point, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-plum-400" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
