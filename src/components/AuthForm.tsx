import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card } from './ui/Badge'

export function AuthForm({ prompt }: { prompt?: string }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = mode === 'signIn' ? await signIn(email, password) : await signUp(email, password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (mode === 'signUp') setCheckEmail(true)
  }

  if (checkEmail) {
    return (
      <Card className="mx-auto max-w-sm text-center">
        <p className="text-plum-200">Check your email to confirm your account, then sign in.</p>
        <button
          onClick={() => {
            setCheckEmail(false)
            setMode('signIn')
          }}
          className="mt-4 text-sm text-copper-300 hover:underline"
        >
          Back to sign in
        </button>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-sm">
      {prompt && <p className="mb-4 text-sm text-plum-400">{prompt}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-plum-200">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-plum-200">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-gradient-to-b from-copper-400 to-copper-500 px-6 py-2.5 font-semibold text-plum-950 shadow-lg shadow-copper-500/20 transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {mode === 'signIn' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
        className="mt-4 w-full text-center text-sm text-plum-400 hover:text-plum-200"
      >
        {mode === 'signIn' ? "Need an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </Card>
  )
}
