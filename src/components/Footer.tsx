import type { View } from '../types'

export function Footer({ setView }: { setView: (v: View) => void }) {
  return (
    <footer className="border-t border-plum-800 px-6 py-10 text-sm text-plum-400">
      <div className="mx-auto max-w-6xl space-y-4">
        <p className="max-w-3xl">
          Encore Super provides general information about Australian superannuation
          guarantee rules as they apply to live performance work. It is not personal
          tax, legal, or financial advice and doesn't account for your specific
          circumstances. Confirm anything you rely on with the{' '}
          <a
            href="https://www.ato.gov.au"
            target="_blank"
            rel="noreferrer"
            className="text-copper-400 hover:underline"
          >
            ATO
          </a>{' '}
          or a registered tax agent before acting on it.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-plum-400/70">
            © {new Date().getFullYear()} Encore Super. Built for Australian performing musicians. Powered by{' '}
            <a
              href="https://www.goldenleadgeneration.com.au"
              target="_blank"
              rel="noreferrer"
              className="hover:text-plum-200 hover:underline"
            >
              Golden Lead Generation
            </a>
            .
          </p>
          <button onClick={() => setView('privacy')} className="text-plum-400/70 hover:text-plum-200 hover:underline">
            Privacy Policy
          </button>
          <button onClick={() => setView('terms')} className="text-plum-400/70 hover:text-plum-200 hover:underline">
            Terms of Service
          </button>
        </div>
      </div>
    </footer>
  )
}
