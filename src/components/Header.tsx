import type { View } from '../types'
import { Logo } from './ui/Logo'
import { useAuth } from '../context/AuthContext'

const NAV: { id: View; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'calculator', label: 'Gig Calculator' },
  { id: 'deadline', label: 'Payday Deadline' },
  { id: 'coverage', label: 'Am I Covered?' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'rules', label: 'Rules Explained' },
  { id: 'faq', label: 'FAQs' },
  { id: 'roster', label: 'Band Roster' },
]

export function Header({ view, setView }: { view: View; setView: (v: View) => void }) {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-plum-700 bg-plum-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-left"
        >
          <Logo size={26} />
          <span className="font-display text-xl tracking-wide text-copper-300">Encore Super</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                view === item.id
                  ? 'bg-plum-800 text-copper-300'
                  : 'text-plum-400 hover:text-plum-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => signOut()}
              className="hidden text-sm text-plum-400 hover:text-plum-200 sm:inline"
            >
              Sign out ({user.email})
            </button>
          ) : (
            <button
              onClick={() => setView('pricing')}
              className="hidden text-sm text-plum-400 hover:text-plum-200 sm:inline"
            >
              Sign in
            </button>
          )}
          <button
            onClick={() => setView('pricing')}
            className="rounded-full bg-gradient-to-b from-copper-400 to-copper-500 px-4 py-2 text-sm font-semibold text-plum-950 shadow-lg shadow-copper-500/20 transition-transform hover:scale-[1.03]"
          >
            Get full access — from $12.99/mo
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-plum-800 px-4 py-2 md:hidden">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
              view === item.id ? 'bg-plum-800 text-copper-300' : 'text-plum-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
