import { Card } from './ui/Badge'

export function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl text-plum-200 sm:text-4xl">Terms of Service</h1>
      <p className="mt-3 text-plum-400">Last updated 25 July 2026.</p>

      <div className="mt-10 space-y-6">
        <Card>
          <h2 className="font-display text-xl text-plum-100">What Encore Super is</h2>
          <p className="mt-3 text-sm text-plum-400">
            Encore Super is a calculator and record-keeping tool that helps Australian performing
            musicians work out superannuation guarantee obligations on live performance fees. It
            provides general information based on current ATO and Fair Work Ombudsman guidance — it
            is not personal financial, tax, or legal advice, and doesn't account for your specific
            circumstances. Encore Super does not process, remit, or facilitate any wage or
            superannuation payment — every figure it produces, including any downloadable file, is
            for your own reference and action.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-plum-100">Accounts</h2>
          <p className="mt-3 text-sm text-plum-400">
            You're responsible for keeping your account credentials secure and for any activity under
            your account. You must be legally able to enter into this agreement — for example, on
            behalf of yourself, your band, or your business.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-plum-100">Subscription and billing</h2>
          <p className="mt-3 text-sm text-plum-400">
            Full access is available as a $12.99 AUD monthly or $99 AUD yearly subscription, billed
            through Square. Subscriptions renew automatically at the end of each billing period until
            cancelled. You can cancel at any time; cancelling stops future renewals but doesn't refund
            the current billing period. We may change pricing for future billing periods with
            reasonable notice.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-plum-100">Acceptable use</h2>
          <p className="mt-3 text-sm text-plum-400">
            Use Encore Super for its intended purpose — working out your own or your band's super
            obligations. Don't attempt to disrupt the service, access other users' data, or rely on
            it as a substitute for advice from the ATO or a registered tax agent for decisions with
            real financial or legal consequences.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-plum-100">No warranty, limitation of liability</h2>
          <p className="mt-3 text-sm text-plum-400">
            Encore Super is provided "as is." While every figure is built on current legislation and
            official guidance, rules change, and we don't guarantee the calculator will be error-free
            or suitable for every situation. To the extent permitted by law, Encore Super and its
            operators aren't liable for any loss arising from reliance on the app in place of
            professional advice.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-plum-100">Termination</h2>
          <p className="mt-3 text-sm text-plum-400">
            You can stop using Encore Super and cancel your subscription at any time. We may suspend
            or terminate accounts that breach these terms, misuse the service, or where required by
            law.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-plum-100">Governing law and contact</h2>
          <p className="mt-3 text-sm text-plum-400">
            These terms are governed by the laws of Australia. For any question about these terms,
            contact{' '}
            <a href="mailto:notifications@encoresuper.com.au" className="text-copper-400 hover:underline">
              notifications@encoresuper.com.au
            </a>
            . We may update these terms from time to time; the date above reflects the most recent
            change.
          </p>
        </Card>
      </div>
    </div>
  )
}
