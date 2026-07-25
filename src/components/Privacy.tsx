import { Card } from './ui/Badge'

export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl text-plum-200 sm:text-4xl">Privacy Policy</h1>
      <p className="mt-3 text-plum-400">
        Last updated 25 July 2026. This describes exactly what Encore Super collects and why —
        nothing more than what the app actually does.
      </p>

      <div className="mt-10 space-y-6">
        <Card>
          <h2 className="font-display text-xl text-plum-100">What Encore Super doesn't do</h2>
          <p className="mt-3 text-sm text-plum-400">
            Encore Super is a calculator and record-keeping tool. It does not process, hold, or move
            any wage or superannuation payment on your behalf, and it never asks for or stores your
            bank account details, BSB, or Tax File Number. Where the app produces a payment summary,
            it's a CSV file generated and downloaded entirely in your browser — that file is never
            transmitted to us or anyone else.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-plum-100">What we collect</h2>
          <ul className="mt-3 space-y-3 text-sm text-plum-400">
            <li>
              <span className="font-medium text-plum-200">Account details</span> — the email address
              and password you sign up with. Passwords are handled by our authentication provider
              (Supabase) and are never visible to us in plain text.
            </li>
            <li>
              <span className="font-medium text-plum-200">Band Roster entries</span> — if you choose
              to save a band, we store the band name, member names, and the super fund details you
              enter for each member (fund name, USI, member account number). This is optional — the
              calculator works without an account.
            </li>
            <li>
              <span className="font-medium text-plum-200">Calculator inputs</span> — fees, dates, and
              GST settings you type into the Gig Calculator stay in your browser for that session
              only, unless you explicitly save them via Band Roster.
            </li>
            <li>
              <span className="font-medium text-plum-200">Payment details</span> — handled entirely by
              Square when you subscribe. Your card number never reaches our servers; we only ever
              receive a subscription status and a Square-generated customer reference.
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-plum-100">Who we share it with</h2>
          <p className="mt-3 text-sm text-plum-400">
            We use a small number of service providers to run Encore Super, and don't sell or share
            your data beyond what's needed for them to do that:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-plum-400">
            <li>
              <span className="font-medium text-plum-200">Supabase</span> — hosts our database and
              handles sign-in. Your Band Roster and account data live here, protected so only you can
              read your own records.
            </li>
            <li>
              <span className="font-medium text-plum-200">Square</span> — processes subscription
              payments. PCI-DSS compliant; card details are tokenised by Square and never touch our
              systems.
            </li>
            <li>
              <span className="font-medium text-plum-200">Resend</span> — sends a small number of
              internal, non-marketing emails (e.g. notifying us when someone signs up). This isn't
              used to email you.
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-plum-100">Security and retention</h2>
          <p className="mt-3 text-sm text-plum-400">
            Data in transit is encrypted (HTTPS). Your Band Roster and account records are protected
            by row-level access rules so they're only ever readable by you, not by other users. We
            keep your data for as long as your account is active. You can request deletion of your
            account and everything attached to it at any time by contacting us below — we'll action
            it within a reasonable timeframe.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-plum-100">Your rights and contact</h2>
          <p className="mt-3 text-sm text-plum-400">
            You can access, correct, or delete your data at any time. For any privacy request or
            question, contact us at{' '}
            <a href="mailto:notifications@encoresuper.com.au" className="text-copper-400 hover:underline">
              notifications@encoresuper.com.au
            </a>
            . If we make material changes to this policy, we'll update the date at the top of this
            page.
          </p>
        </Card>
      </div>
    </div>
  )
}
