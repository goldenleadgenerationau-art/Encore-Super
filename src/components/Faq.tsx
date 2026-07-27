import { faqs } from '../data/faqs'
import { Card, PremiumBadge } from './ui/Badge'
import { useAccess } from '../context/AccessContext'
import type { View } from '../types'

export function Faq({ setView }: { setView: (v: View) => void }) {
  const { hasFullAccess } = useAccess()

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl text-plum-200 sm:text-4xl">FAQs</h1>
      <p className="mt-3 text-plum-400">
        The practical questions that come up once you know what's owed — like how to
        actually pay it.
      </p>

      <div className="mt-10 space-y-6">
        {faqs.map((f) => {
          const locked = f.premium && !hasFullAccess
          return (
            <Card key={f.id}>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl text-plum-100">{f.question}</h2>
                {f.premium && <PremiumBadge />}
              </div>
              <p className="mt-2 text-sm text-plum-200">{f.preview}</p>

              {locked ? (
                <div className="mt-4 rounded-xl border border-dashed border-plum-600 p-4 text-sm text-plum-400">
                  The full answer is part of full access.{' '}
                  <button onClick={() => setView('pricing')} className="text-copper-400 hover:underline">
                    See plans — from $12.99/mo
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-3 space-y-3 text-sm text-plum-400">
                    {f.answer.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1">
                    {f.sources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs text-copper-400 hover:underline"
                      >
                        Source: {source.label} ↗
                      </a>
                    ))}
                  </div>
                </>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
