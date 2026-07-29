import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from './ui/Logo'
import { Footer } from './Footer'
import { Seo } from './Seo'
import { routeMetaForPath, VIEW_TO_PATH } from '../lib/seoMeta'
import type { View } from '../types'

// Scroll-reveal: adds .is-visible (which triggers the fade-up keyframe) the
// first time a section enters the viewport. IntersectionObserver only, no
// animation library in this project.
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function useCountUp(target: number, trigger: boolean, durationMs = 1400) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!trigger) return
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [trigger, target, durationMs])

  return value
}

function Reveal({ children, className = '', delayMs = 0 }: { children: React.ReactNode; className?: string; delayMs?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ animationDelay: visible ? `${delayMs}ms` : undefined }}
    >
      {children}
    </div>
  )
}

function EqualizerHero() {
  const bars = [
    { h: 70, delay: '0s', color: 'var(--color-plum-400)' },
    { h: 100, delay: '0.15s', color: 'var(--color-copper-500)' },
    { h: 130, delay: '0.3s', color: 'var(--color-copper-400)' },
    { h: 160, delay: '0.1s', color: 'var(--color-copper-300)' },
    { h: 110, delay: '0.25s', color: 'var(--color-plum-200)' },
    { h: 140, delay: '0.05s', color: 'var(--color-copper-400)' },
    { h: 80, delay: '0.35s', color: 'var(--color-copper-500)' },
  ]
  return (
    <div className="relative flex h-48 items-end justify-center gap-2.5 sm:h-56 sm:gap-3">
      <div className="animate-glow-pulse absolute inset-0 -z-10 rounded-full bg-copper-400/20 blur-3xl" />
      {bars.map((b, i) => (
        <span
          key={i}
          className="eq-bar w-4 rounded-t-full sm:w-5"
          style={{ height: b.h, backgroundColor: b.color, animationDelay: b.delay }}
        />
      ))}
    </div>
  )
}

const TICKER_ITEMS = [
  'Payday Super starts 1 July 2026',
  '7 business days to land, every gig',
  '82% of AU musicians have never been paid super for a gig',
  'Built on actual ATO & Fair Work rules',
]

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="overflow-hidden border-y border-copper-400/20 bg-plum-900/60 py-3">
      <div className="animate-ticker flex w-max gap-10 whitespace-nowrap text-sm font-medium tracking-wide text-copper-300">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            {item}
            <span className="text-plum-600">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const steps = [
  {
    n: '01',
    title: 'Enter the gig fee',
    body: 'Solo set, band lump sum, or agent-booked — tell it who paid what, and how.',
  },
  {
    n: '02',
    title: 'Get the exact numbers',
    body: 'Super owed, GST, labour split, and the fund deadline — down to the dollar and the date.',
  },
  {
    n: '03',
    title: 'Export or chase it',
    body: "CSV for your books, or a ready-to-send PDF letter the moment a gig's overdue.",
  },
]

const features = [
  {
    title: 'Gig Super Calculator',
    body: 'The only calculator built around how live performance actually gets booked and paid.',
  },
  {
    title: 'Payday Deadline Tracker',
    body: 'Every gig gets its own 7-business-day clock. Never guess the deadline again.',
  },
  {
    title: '"Am I Covered?" check',
    body: 'A 3-question walkthrough that tells you, plainly, whether a booking triggers super.',
  },
  {
    title: 'Unpaid super letters',
    body: "Didn't get paid? Generate a factual, rule-cited PDF letter in one click.",
  },
]

const plans = [
  { label: 'Monthly', price: '$12.99', unit: '/mo', note: 'Cancel anytime' },
  { label: 'Yearly', price: '$99', unit: '/yr', note: 'Works out to $8.25/mo · save $55+', featured: true },
]

const faqItems = [
  {
    q: "I get paid cash or bank transfer, not through payroll — does this still apply?",
    a: "Yes. Super is worked out on how you're paid to perform, not the payment method. Cash, transfer, or invoice all count the same way under the rules.",
  },
  {
    q: 'Do I need an ABN to use this?',
    a: "No — the calculator works whether you're paid as an individual, as a band representative, or through your own company. It asks which applies.",
  },
  {
    q: "What if a venue won't pay the super they owe?",
    a: "Full access includes a one-click, rule-cited PDF letter you can send — factual, not a legal threat, just the numbers and the law.",
  },
  {
    q: 'Is this legal or tax advice?',
    a: "No — it's general information built from the actual ATO and Fair Work rules. Confirm anything you rely on with the ATO or a registered tax agent.",
  },
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {faqItems.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q} className="overflow-hidden rounded-2xl border border-plum-700 bg-plum-900/50">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-medium text-plum-100">{item.q}</span>
              <span className={`shrink-0 text-copper-400 transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </button>
            {isOpen && <p className="px-5 pb-4 text-sm leading-relaxed text-plum-400">{item.a}</p>}
          </div>
        )
      })}
    </div>
  )
}

function StatCard({ prefix = '', target, suffix = '', label, source, trigger }: { prefix?: string; target: number; suffix?: string; label: string; source?: { label: string; url: string }; trigger: boolean }) {
  const value = useCountUp(target, trigger)
  const display = Number.isInteger(target) ? Math.round(value) : value.toFixed(2)
  return (
    <div className="rounded-2xl border border-plum-700 bg-plum-900/50 px-6 py-8 text-center">
      <p className="font-display text-4xl text-copper-300 sm:text-5xl">
        {prefix}
        {display}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-plum-300">{label}</p>
      {source && (
        <a href={source.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-plum-500 underline decoration-plum-600 hover:text-plum-300">
          {source.label}
        </a>
      )}
    </div>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const { ref: statsRef, visible: statsVisible } = useReveal<HTMLDivElement>()
  const goTo = (path: string) => () => navigate(path)
  const setView = (v: View) => navigate(VIEW_TO_PATH[v])
  const meta = routeMetaForPath('/for-musicians')

  return (
    <div className="flex min-h-svh flex-col bg-plum-950">
      <Seo meta={meta} />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <button onClick={goTo('/')} className="flex items-center gap-2">
          <Logo size={26} />
          <span className="font-display text-lg tracking-wide text-copper-300">Encore Super</span>
        </button>
        <button
          onClick={goTo('/pricing')}
          className="rounded-full bg-gradient-to-b from-copper-400 to-copper-500 px-4 py-2 text-sm font-semibold text-plum-950 shadow-lg shadow-copper-500/20 transition-transform hover:scale-[1.03]"
        >
          See pricing
        </button>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pb-10 pt-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-copper-400/40 bg-copper-400/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-copper-300">
            <span className="animate-dot-pulse h-1.5 w-1.5 rounded-full bg-copper-400" />
            Payday Super starts 1 July 2026
          </span>

          <h1 className="animate-fade-up mt-6 font-display text-4xl leading-tight text-plum-100 sm:text-6xl">
            Stop leaving super on the stage.
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg text-plum-400" style={{ animationDelay: '0.1s' }}>
            Enter any gig fee and see exactly what superannuation is owed — and the exact date it
            has to land — built around how live performance actually gets booked and paid.
          </p>

          <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={goTo('/gig-calculator')}
              className="rounded-full bg-gradient-to-b from-copper-400 to-copper-500 px-7 py-3.5 font-semibold text-plum-950 shadow-lg shadow-copper-500/20 transition-transform hover:scale-[1.03]"
            >
              Calculate my gig's super — free
            </button>
            <button
              onClick={goTo('/pricing')}
              className="rounded-full border border-plum-600 px-7 py-3.5 font-medium text-plum-200 hover:border-copper-400"
            >
              Full access from $12.99/mo
            </button>
          </div>

          <div className="mt-4">
            <EqualizerHero />
          </div>
        </section>

        <Ticker />

        <section className="px-6 py-16">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl text-plum-100">See it in action</h2>
            <p className="mt-2 text-plum-400">A quick walkthrough of the Gig Super Calculator.</p>
          </Reveal>
          <Reveal delayMs={100} className="mx-auto mt-8 max-w-3xl">
            <div className="overflow-hidden rounded-2xl border border-plum-700 shadow-2xl shadow-black/40">
              <div className="relative aspect-video">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/aS7EID34NPc"
                  title="Encore Super — Gig Super Calculator walkthrough"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          </Reveal>
        </section>

        <section ref={statsRef} className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-5 sm:grid-cols-3">
            <StatCard
              target={82}
              suffix="%"
              label="of Australian musicians have never received super for a gig"
              source={{
                label: 'MEAA survey',
                url: 'https://www.meaa.org/mediaroom/insecure-work-and-poor-pay-forces-musicians-to-hang-up-their-instruments-new-survey/',
              }}
              trigger={statsVisible}
            />
            <StatCard target={7} label="business days super must land after payday" trigger={statsVisible} />
            <StatCard prefix="$" target={8.25} label="per month, billed yearly, for full access" trigger={statsVisible} />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16">
          <Reveal className="text-center">
            <h2 className="font-display text-3xl text-plum-100">Three steps, every gig</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delayMs={i * 120}>
                <div className="relative rounded-2xl border border-plum-700 bg-plum-900/50 p-6">
                  <span className="font-display text-3xl text-copper-400/40">{s.n}</span>
                  <h3 className="mt-2 font-display text-lg text-plum-100">{s.title}</h3>
                  <p className="mt-2 text-sm text-plum-400">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-t border-plum-800 bg-plum-900/30 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <Reveal className="text-center">
              <h2 className="font-display text-3xl text-plum-100">Everything you need, nothing you don't</h2>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {features.map((f, i) => (
                <Reveal key={f.title} delayMs={i * 100}>
                  <div className="h-full rounded-2xl border border-plum-700 bg-plum-900/60 p-6 transition-colors hover:border-copper-400/40">
                    <h3 className="font-display text-lg text-plum-100">{f.title}</h3>
                    <p className="mt-2 text-sm text-plum-400">{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-plum-800 bg-plum-900/30 px-6 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl text-plum-100">Simple pricing</h2>
            <p className="mt-2 text-plum-400">Same full access either way. Cancel anytime.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {plans.map((p) => (
                <div
                  key={p.label}
                  className={`rounded-2xl border p-6 text-left ${p.featured ? 'border-copper-400 bg-plum-900/80' : 'border-plum-700 bg-plum-900/40'}`}
                >
                  {p.featured && (
                    <span className="inline-block rounded-full bg-copper-400/10 px-2.5 py-0.5 text-xs font-medium text-copper-300">
                      Recommended
                    </span>
                  )}
                  <p className="mt-2 font-display text-3xl text-plum-100">
                    {p.price} <span className="font-sans text-sm text-plum-400">{p.unit}</span>
                  </p>
                  <p className="mt-1 text-sm text-plum-400">{p.note}</p>
                </div>
              ))}
            </div>
            <button
              onClick={goTo('/pricing')}
              className="mt-8 rounded-full bg-gradient-to-b from-copper-400 to-copper-500 px-7 py-3.5 font-semibold text-plum-950 shadow-lg shadow-copper-500/20 transition-transform hover:scale-[1.03]"
            >
              Get full access
            </button>
          </div>
        </section>

        <section className="px-6 py-16">
          <Reveal className="mb-10 text-center">
            <h2 className="font-display text-3xl text-plum-100">Questions, answered</h2>
          </Reveal>
          <Faq />
        </section>

        <section className="relative overflow-hidden border-t border-plum-800 px-6 py-20 text-center">
          <div className="animate-glow-pulse absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-copper-400/20 blur-3xl" />
          <h2 className="font-display text-3xl text-plum-100 sm:text-4xl">
            Know exactly what every gig owes you.
          </h2>
          <button
            onClick={goTo('/gig-calculator')}
            className="mt-8 rounded-full bg-gradient-to-b from-copper-400 to-copper-500 px-8 py-4 font-semibold text-plum-950 shadow-lg shadow-copper-500/20 transition-transform hover:scale-[1.03]"
          >
            Try the calculator — free
          </button>
        </section>
      </main>

      <Footer setView={setView} />
    </div>
  )
}
