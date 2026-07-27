import type { View } from '../types'
import { Card } from './ui/Badge'

const features = [
  {
    title: 'Gig Super Calculator',
    body: 'Enter a real gig fee — solo, band lump sum, or agent-booked — and see exactly what super is owed and when it must land.',
    view: 'calculator' as View,
  },
  {
    title: 'Payday Deadline Tracker',
    body: "Payday Super means every gig has its own 7-business-day clock. Never guess the deadline again.",
    view: 'deadline' as View,
  },
  {
    title: 'Am I Covered?',
    body: 'A 3-question walkthrough that tells you, in plain English, whether a booking is likely to trigger super at all.',
    view: 'coverage' as View,
  },
  {
    title: 'Scenario Library',
    body: 'Solo gigs, session work, band splits, private functions, DJ sets, busking, your own company — mapped to who actually owes what.',
    view: 'scenarios' as View,
  },
]

export function Home({ setView }: { setView: (v: View) => void }) {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-copper-400">
          For Australian performing musicians
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-plum-100 sm:text-5xl">
          Super, sorted — one gig at a time.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl rounded-2xl border border-copper-400/30 bg-copper-400/5 px-5 py-4 text-base font-medium text-plum-100 sm:text-lg">
          According to a{' '}
          <a
            href="https://www.meaa.org/mediaroom/insecure-work-and-poor-pay-forces-musicians-to-hang-up-their-instruments-new-survey/"
            target="_blank"
            rel="noreferrer"
            className="text-copper-300 underline decoration-copper-400/50 hover:text-copper-200"
          >
            Media, Entertainment &amp; Arts Alliance (MEAA) survey
          </a>
          , 82% of Australian musicians have never received a single cent of superannuation
          for a gig — usually because tracking it is too hard.
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-plum-400">
          Payday Super changed the rules from 1 July 2026. Encore Super turns the ATO
          rulebook into a calculator built around how live performance actually gets
          booked and paid — solo sets, band splits, agents, private functions, and
          everything in between.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setView('calculator')}
            className="rounded-full bg-gradient-to-b from-copper-400 to-copper-500 px-6 py-3 font-semibold text-plum-950 shadow-lg shadow-copper-500/20 transition-transform hover:scale-[1.03]"
          >
            Try the Gig Calculator
          </button>
          <button
            onClick={() => setView('pricing')}
            className="rounded-full border border-plum-600 px-6 py-3 font-medium text-plum-200 hover:border-copper-400"
          >
            See full access — from $12.99/mo
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.view} className="cursor-pointer transition-colors hover:border-copper-400/40" >
              <button onClick={() => setView(f.view)} className="text-left">
                <h2 className="font-display text-lg text-plum-100">{f.title}</h2>
                <p className="mt-2 text-sm text-plum-400">{f.body}</p>
                <span className="mt-3 inline-block text-sm text-copper-400">Open →</span>
              </button>
            </Card>
          ))}
        </div>

        <Card className="mt-5 cursor-pointer border-copper-400/30 bg-gradient-to-b from-plum-900 to-plum-900/40 transition-colors hover:border-copper-400/50">
          <button onClick={() => setView('calculator')} className="w-full text-left sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <h2 className="font-display text-lg text-plum-100">Export straight to your books</h2>
              <p className="mt-2 max-w-2xl text-sm text-plum-400">
                Every calculation comes with a one-click CSV download — fee, super, and GST line items, ready
                to import into your accounting software. A plain file you review yourself, not a live sync.
              </p>
            </div>
            <span className="mt-3 inline-block shrink-0 text-sm text-copper-400 sm:mt-0">Try the calculator →</span>
          </button>
        </Card>
      </section>

      <section className="border-t border-plum-800 bg-plum-900/40 px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl text-plum-100">Built on the actual rules, not guesswork</h2>
          <p className="mt-3 text-plum-400">
            Every figure traces back to the Superannuation Guarantee (Administration)
            Act 1992 and current ATO / Fair Work Ombudsman guidance — see the sources on
            the Rules Explained page.
          </p>
          <button
            onClick={() => setView('rules')}
            className="mt-6 rounded-full border border-plum-600 px-5 py-2.5 text-sm text-plum-200 hover:border-copper-400"
          >
            Read the rules explained
          </button>
        </div>
      </section>
    </div>
  )
}
