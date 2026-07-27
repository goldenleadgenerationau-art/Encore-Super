export interface Faq {
  id: string
  question: string
  preview: string
  answer: string[]
  sources: { label: string; url: string }[]
  premium?: boolean
}

export const faqs: Faq[] = [
  {
    id: 'bandleader-pay-band-super',
    question:
      "I'm a bandleader — how do I actually pay super to the rest of the band? Do I need accounting software?",
    preview: 'No — you can do this for free through a super fund\'s employer portal, no accounting software required.',
    answer: [
      "No, you don't need accounting software. You can register directly with a super fund's employer portal and pay through that.",
      "What you can't do is just transfer the money to someone's bank account — super has to be paid through a SuperStream-compliant method, which sends the payment and the required data (who it's for, which fund, how much) to the right fund together, electronically.",
      'The ATO used to run a free clearing house for exactly this (the Small Business Superannuation Clearing House), but it stopped taking new employers from 1 October 2025 and shut down completely on 1 July 2026 — it wasn\'t built to handle Payday Super\'s 7-business-day timeframe.',
      "A straightforward free alternative: register directly with a major industry super fund's employer portal — for example, AustralianSuper's Employer Portal includes a built-in, SuperStream-compliant clearing house at no cost, and is built for Payday Super's faster timing.",
      "To set each band member up as a payee, you'll typically need their full name, address, date of birth, super fund and member number, and TFN. If they invoice you as a sole trader — common for musicians — select \"contractor\" rather than \"employee\" when the portal asks for their status. That correctly reflects that they're covered under the performer-specific super rule (s.12(8)), not standard employment.",
      "From there, every time you pay the band you process a contribution through the portal and lodge it — fiddly to set up the first time, quick after that.",
      "Worth pairing with something to track what's actually owed per gig and per member, even without full accounting software — that's what the Gig Calculator, Band Roster, and CSV export on this site are for.",
    ],
    sources: [
      {
        label: 'ATO — SuperStream for employers',
        url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/paying-super-on-payday/superstream-for-employers',
      },
      {
        label: 'ATO — How to transition from the Small Business Superannuation Clearing House',
        url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/payday-super-resources/how-to-transition-from-the-small-business-superannuation-clearing-house',
      },
      {
        label: 'AustralianSuper — Employer Portal & Clearing House',
        url: 'https://www.australiansuper.com/employers/why-register-with-us/employer-portal',
      },
    ],
  },
]
