import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const inputClass =
  'mt-1 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-1.5 text-sm text-plum-100 outline-none focus:border-copper-400'

export function FeedbackWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [showError, setShowError] = useState(false)

  function reset() {
    setStatus('idle')
    setRating(0)
    setComment('')
    setName('')
    setRole('')
    setLocation('')
    setShowError(false)
  }

  async function handleSubmit() {
    if (!rating || !comment.trim()) {
      setShowError(true)
      return
    }
    setShowError(false)
    setStatus('submitting')

    const { error } = await supabase.from('feedback').insert({
      rating,
      comment: comment.trim(),
      name: name.trim() || null,
      role: role.trim() || null,
      location: location.trim() || null,
      email: email.trim() || null,
      page_path: window.location.pathname,
      user_id: user?.id ?? null,
    })

    if (error) {
      console.error(error)
      setStatus('error')
      return
    }

    supabase.functions
      .invoke('notify-feedback', {
        body: { rating, comment: comment.trim(), name, role, location, email, pagePath: window.location.pathname },
      })
      .catch(() => {})

    setStatus('sent')
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-plum-600 bg-plum-900 px-4 py-2.5 text-sm font-medium text-plum-200 shadow-lg shadow-black/30 transition-colors hover:border-copper-400 hover:text-copper-300"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        Leave feedback
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-30 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl border border-plum-700 bg-plum-900 p-5 shadow-2xl shadow-black/40 sm:w-96">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-plum-100">
            {status === 'sent' ? "Thanks — that's genuinely useful." : 'How has Encore Super been?'}
          </p>
          {status !== 'sent' && (
            <p className="mt-1 text-xs text-plum-400">
              Real feedback only — we may reach out to ask permission to feature it as a review.
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setOpen(false)
            reset()
          }}
          className="shrink-0 text-plum-500 hover:text-plum-300"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {status === 'sent' ? (
        <button
          onClick={() => {
            setOpen(false)
            reset()
          }}
          className="mt-4 w-full rounded-lg border border-plum-600 px-4 py-2 text-sm font-medium text-plum-200 hover:border-copper-400"
        >
          Close
        </button>
      ) : (
        <>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                className="text-2xl leading-none"
              >
                <span className={star <= (hoverRating || rating) ? 'text-copper-400' : 'text-plum-700'}>★</span>
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What's working, what's not — be honest."
            rows={3}
            className={`${inputClass} mt-3 resize-none`}
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (optional)"
              className={inputClass}
            />
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role (optional)"
              className={inputClass}
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              className={inputClass}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              className={inputClass}
            />
          </div>

          {showError && (
            <p className="mt-2 text-xs text-red-400">Add a star rating and a comment to submit.</p>
          )}
          {status === 'error' && (
            <p className="mt-2 text-xs text-red-400">Something went wrong — please try again.</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={status === 'submitting'}
            className="mt-3 w-full rounded-full bg-gradient-to-b from-copper-400 to-copper-500 px-4 py-2 text-sm font-semibold text-plum-950 shadow-lg shadow-copper-500/20 transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {status === 'submitting' ? 'Sending…' : 'Send feedback'}
          </button>
        </>
      )}
    </div>
  )
}
