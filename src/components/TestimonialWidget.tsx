import { useEffect, useState } from 'react'
import { testimonials } from '../data/testimonials'

const DISMISS_KEY = 'encoreSuper.testimonialWidgetDismissed'
const ROTATE_MS = 8000

function Stars({ count }: { count: number }) {
  return (
    <span className="text-copper-300" aria-label={`${count} out of 5 stars`}>
      {'★'.repeat(count)}
      <span className="text-plum-700">{'★'.repeat(5 - count)}</span>
    </span>
  )
}

export function TestimonialWidget() {
  const [dismissed, setDismissed] = useState(true)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === 'true')
  }, [])

  useEffect(() => {
    if (dismissed || paused || testimonials.length < 2) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [dismissed, paused])

  if (dismissed) return null

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
  }

  const t = testimonials[index]

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="fixed bottom-4 right-4 z-30 w-[calc(100vw-2rem)] max-w-xs sm:right-6 sm:bottom-6"
    >
      <div className="relative overflow-hidden rounded-2xl border border-plum-700 bg-plum-900/95 p-4 shadow-2xl shadow-black/40 backdrop-blur">
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-2.5 top-2.5 text-plum-400 hover:text-plum-200"
        >
          ✕
        </button>

        <span className="inline-block rounded-full border border-plum-600 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-plum-400">
          Example feedback
        </span>

        <div key={index} className="animate-testimonial-swipe mt-2 pr-4">
          <Stars count={t.stars} />
          <p className="mt-1.5 text-sm font-medium text-plum-100">{t.title}</p>
          <p className="mt-1.5 max-h-40 overflow-y-auto text-xs leading-relaxed text-plum-400">
            “{t.quote}”
          </p>
          <p className="mt-2 text-xs text-plum-300">
            — {t.name}, {t.role} ({t.location})
          </p>
        </div>

        <div className="mt-3 flex justify-center gap-1.5">
          {testimonials.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-1 rounded-full ${i === index ? 'bg-copper-400' : 'bg-plum-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
