import { ruleSections } from '../data/rules'
import { Card } from './ui/Badge'
import { Paywall } from './ui/Paywall'
import { useAccess } from '../context/AccessContext'
import type { View } from '../types'

export function RulesExplained({ setView }: { setView: (v: View) => void }) {
  const { hasFullAccess } = useAccess()

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl text-plum-200 sm:text-4xl">The Rules, Explained</h1>
      <p className="mt-3 text-plum-400">
        Plain-English summaries of the rules the calculator is built on, each linked
        back to its official source.
      </p>

      {!hasFullAccess ? (
        <div className="mt-10">
          <Paywall
            title="Full rulebook, unlocked with a subscription"
            body="Section 12(8), the labour/non-labour split, Payday Super deadlines, and the penalties — all explained in plain English with sources, for subscribers."
            setView={setView}
          />
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          {ruleSections.map((section) => (
            <Card key={section.id}>
              <h2 className="font-display text-xl text-plum-100">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm text-plum-400">
                {section.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <a
                href={section.source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-xs text-copper-400 hover:underline"
              >
                Source: {section.source.label} ↗
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
