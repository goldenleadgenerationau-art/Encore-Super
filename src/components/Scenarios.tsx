import { scenarios } from '../data/scenarios'
import { invoiceExamples } from '../data/invoiceExamples'
import { Card, PremiumBadge } from './ui/Badge'
import { Paywall } from './ui/Paywall'
import { useAccess } from '../context/AccessContext'
import { SG_RATE } from '../lib/gigCalculator'
import type { View } from '../types'

const currency = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })

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

      <div className="mt-14">
        <h2 className="font-display text-2xl text-plum-100">Example itemised invoices</h2>
        <p className="mt-2 max-w-2xl text-sm text-plum-400">
          What a properly itemised invoice actually looks like — so it's clear what counts as
          labour for super, and what doesn't.
        </p>
        <p className="mt-1 max-w-2xl text-xs text-plum-400">
          These are illustrative examples only, not templates to copy exactly — always check the
          actual numbers against your own booking.
        </p>

        {!hasFullAccess ? (
          <div className="mt-6">
            <Paywall
              title="Itemised invoice examples, unlocked with a subscription"
              body="Real worked examples for a solo performer, a band invoicing as a group, and what a venue should ask for before paying — for subscribers."
              setView={setView}
            />
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {invoiceExamples.map((ex) => {
              const invoiceTotal = ex.lines.reduce((sum, l) => sum + l.amount, 0)
              const superableAmount = ex.lines.reduce((sum, l) => sum + (l.superable ? l.amount : 0), 0)
              const superAmount = superableAmount * SG_RATE
              const totalCost = invoiceTotal + superAmount
              return (
                <Card key={ex.id}>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-copper-400">{ex.audience}</p>
                  <h3 className="mt-1 font-display text-lg text-plum-100">{ex.title}</h3>
                  <p className="mt-2 text-sm text-plum-400">{ex.context}</p>

                  <div className="mt-4 divide-y divide-plum-700/60 rounded-lg border border-plum-700">
                    {ex.lines.map((line, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                        <span className="text-plum-200">
                          {line.description}
                          {line.superable === false && (
                            <span className="ml-2 text-xs text-plum-400">(not superable)</span>
                          )}
                        </span>
                        <span className="shrink-0 text-plum-200">{currency.format(line.amount)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium">
                      <span className="text-plum-100">Invoice total</span>
                      <span className="text-plum-100">{currency.format(invoiceTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 bg-copper-400/5 px-3 py-2 text-sm">
                      <span className="text-copper-300">
                        Superannuation guarantee (12%)
                        <span className="ml-2 text-xs text-plum-400">(paid to the fund, not on this invoice)</span>
                      </span>
                      <span className="shrink-0 text-copper-300">{currency.format(superAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-semibold">
                      <span className="text-plum-100">Total cost</span>
                      <span className="text-copper-300">{currency.format(totalCost)}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-plum-400">{ex.closingNote}</p>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
