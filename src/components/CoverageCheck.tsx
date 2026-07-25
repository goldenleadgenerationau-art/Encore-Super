import { useState } from 'react'
import type { View } from '../types'
import { Card } from './ui/Badge'

type StepId = 'performing' | 'paidTo' | 'engaged'
type OutcomeId = 'covered' | 'not-performer' | 'company-greyarea' | 'no-payer'

interface Step {
  id: StepId
  question: string
  yesGoesTo: StepId | OutcomeId
  noGoesTo: StepId | OutcomeId
}

const steps: Record<StepId, Step> = {
  performing: {
    id: 'performing',
    question:
      'Were you paid to perform — or to provide a service needed for the performance to happen (e.g. as part of the act)?',
    yesGoesTo: 'paidTo',
    noGoesTo: 'not-performer',
  },
  paidTo: {
    id: 'paidTo',
    question:
      "Was the fee paid to you personally as an individual — including as a sole trader with an ABN — or to you as the one collecting it for your band, rather than to your own registered company?",
    yesGoesTo: 'engaged',
    noGoesTo: 'company-greyarea',
  },
  engaged: {
    id: 'engaged',
    question:
      'Did someone actually engage and pay you — a venue, promoter, agent, or private client — as opposed to receiving voluntary tips from the public?',
    yesGoesTo: 'covered',
    noGoesTo: 'no-payer',
  },
}

const outcomes: Record<OutcomeId, { title: string; body: string; tone: 'good' | 'warn' | 'neutral' }> = {
  covered: {
    title: "You're very likely covered",
    body: "Under s.12(8) of the SG Act, whoever engaged and paid you to perform is generally required to treat you as an employee for super — 12% on the labour part of your fee, landing in your fund within 7 business days of payday under Payday Super.",
    tone: 'good',
  },
  'not-performer': {
    title: "The performer-specific rule probably doesn't apply directly",
    body: "Section 12(8) targets people paid to perform or to help a performance happen. If that's not what you were doing, general contractor tests (like the 'mainly for labour' rule) might still apply — worth getting that checked separately.",
    tone: 'neutral',
  },
  'company-greyarea': {
    title: 'Grey area — payments to your own company work differently',
    body: 'When your company invoices and receives the fee rather than you personally, the s.12(8) performer rule may not apply the same way. This is a genuine grey area — get it checked with a registered tax agent.',
    tone: 'warn',
  },
  'no-payer': {
    title: 'Likely no super obligation here',
    body: "Super guarantee needs someone engaging and paying you specifically to perform. Voluntary tips from the public — like busking — generally don't create that relationship.",
    tone: 'neutral',
  },
}

export function CoverageCheck({ setView }: { setView: (v: View) => void }) {
  const [current, setCurrent] = useState<StepId | OutcomeId>('performing')
  const [history, setHistory] = useState<(StepId | OutcomeId)[]>([])

  function answer(yes: boolean) {
    const step = steps[current as StepId]
    if (!step) return
    setHistory((h) => [...h, current])
    setCurrent(yes ? step.yesGoesTo : step.noGoesTo)
  }

  function restart() {
    setCurrent('performing')
    setHistory([])
  }

  function back() {
    setHistory((h) => {
      const prev = h[h.length - 1]
      if (prev) setCurrent(prev)
      return h.slice(0, -1)
    })
  }

  const isOutcome = current in outcomes
  const outcome = isOutcome ? outcomes[current as OutcomeId] : null
  const step = !isOutcome ? steps[current as StepId] : null

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-3xl text-plum-200 sm:text-4xl">Am I Covered?</h1>
      <p className="mt-3 text-plum-400">
        A quick walkthrough to see whether super guarantee is likely to apply to a
        specific booking.
      </p>

      <Card className="mt-8">
        {step && (
          <>
            <p className="text-lg text-plum-100">{step.question}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => answer(true)}
                className="rounded-lg bg-copper-400 px-5 py-2 font-medium text-plum-950 hover:bg-copper-300"
              >
                Yes
              </button>
              <button
                onClick={() => answer(false)}
                className="rounded-lg border border-plum-600 px-5 py-2 text-plum-200 hover:border-plum-400"
              >
                No
              </button>
            </div>
            {history.length > 0 && (
              <button onClick={back} className="mt-6 text-sm text-plum-400 hover:text-plum-200">
                ← Back
              </button>
            )}
          </>
        )}

        {outcome && (
          <>
            <p
              className={`text-sm font-medium uppercase tracking-wide ${
                outcome.tone === 'good'
                  ? 'text-copper-300'
                  : outcome.tone === 'warn'
                    ? 'text-amber-400'
                    : 'text-plum-400'
              }`}
            >
              Result
            </p>
            <p className="mt-2 font-display text-2xl text-plum-100">{outcome.title}</p>
            <p className="mt-3 text-plum-400">{outcome.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {outcome.tone === 'good' && (
                <button
                  onClick={() => setView('calculator')}
                  className="rounded-lg bg-copper-400 px-5 py-2 font-medium text-plum-950 hover:bg-copper-300"
                >
                  Calculate what's owed →
                </button>
              )}
              <button onClick={restart} className="rounded-lg border border-plum-600 px-5 py-2 text-plum-200 hover:border-plum-400">
                Start over
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
