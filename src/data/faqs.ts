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
      "I'm a bandleader (registrant) — how do I actually pay super to the rest of the band (contractor)? Do I need accounting software?",
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
  {
    id: 'first-year-grace-period',
    question:
      "I'm the one who has to pay super — a bandleader, small venue or festival — is there a grace period if I get it wrong in the first year?",
    preview:
      "Yes, sort of. The ATO's first-year approach (1 July 2026 – 30 June 2027) is built around genuine effort and quick fixes, not instant penalties — but doing nothing still puts you in the highest-risk category.",
    answer: [
      "The ATO's Practical Compliance Guideline PCG 2026/1 sets out how it's approaching Payday Super compliance for the first year only, from 1 July 2026 to 30 June 2027. It looks at your behaviour, not just the mistake.",
      "You're treated as low risk if you genuinely tried to pay every payday on time and fixed any contribution that didn't land properly as soon as you realised. Medium risk covers a slower fix — as long as it's resolved within 28 days after the end of the quarter the fee was paid in. High risk, the priority for compliance action, is for anyone who hasn't tried, or still has unpaid super sitting past that 28-day mark.",
      "This isn't a blanket exemption for small or volunteer-run outfits, though. Two community jazz festivals — Newcastle Hunter and Inverloch — cancelled their 2026 events rather than risk it, citing the impossibility of collecting bank and super fund details for hundreds of musicians inside the 7-business-day window. The leniency rewards genuinely trying and fixing issues fast — not deciding it's too hard and not attempting it at all.",
      'From 1 July 2027, this transitional approach ends and the full penalty regime applies with no first-year leeway.',
      "Practically: keep a record of every payment attempt, including any that failed or landed late, and how and when you corrected it — that record is what the low/medium risk assessment actually looks at.",
    ],
    sources: [
      {
        label: 'ATO — Getting it right: compliance in the first year of Payday Super',
        url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/missed-or-late-payday-super-payments/getting-it-right-compliance-in-the-first-year-of-payday-super',
      },
      {
        label: 'SmartCompany — Payday super rules blamed for axing two community music festivals',
        url: 'https://www.smartcompany.com.au/finance/payday-super-rules-blamed-axing-two-community-music-festivals/',
      },
    ],
  },
  {
    id: 'payer-cant-manage-it',
    question: "A venue, festival or booker told me they can't manage paying everyone's super in time — do I just miss out?",
    preview:
      "No — being short on time or admin capacity isn't a legal exemption. The super is still legally owed; a payer missing the deadline creates a debt to the ATO, not a reason it disappears for you.",
    answer: [
      "There's no exemption in the law for small operators, volunteers or non-profits — the section 12(8) performer rule and the 7-business-day Payday Super deadline apply the same way regardless of who's paying or how big they are.",
      "If a payer misses the deadline, they become liable for the super guarantee charge (SGC) — the shortfall plus interest and an administrative charge — assessed directly by the ATO rather than self-reported. Amounts the ATO successfully recovers get paid, with interest, into the affected performers' super funds.",
      "In practice this means the money isn't gone — it becomes the payer's debt to the ATO instead of your invoice. But recovery isn't instant or guaranteed, which is exactly why two Australian jazz festivals chose to cancel their 2026 events rather than risk it, and why it's worth actively following up rather than assuming it'll sort itself out.",
      "If you suspect a payer hasn't paid: check with your own super fund first (it should show as a received contribution, not just 'processing'), then confirm directly with the payer what they paid and when. If it's still unresolved, the ATO has a free online tool to report unpaid super from an employer or payer.",
    ],
    sources: [
      {
        label: 'ATO — Unpaid super from your employer',
        url: 'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/unpaid-super-from-your-employer',
      },
      {
        label: 'ATO — Report unpaid super contributions from my employer',
        url: 'https://www.ato.gov.au/calculators-and-tools/super-report-unpaid-super-contributions-from-my-employer',
      },
    ],
    premium: true,
  },
  {
    id: 'no-fund-on-file',
    question: "I don't have a super fund yet, or the venue/bandleader doesn't know which one to pay into — what happens?",
    preview:
      "The payer has to check the ATO's 'stapled fund' system for an existing fund in your name — and if you genuinely don't have one, they pay into their own default fund. No action needed from you beyond giving them your ID details.",
    answer: [
      'Normally you nominate your own super fund to whoever\'s paying you, usually via a Superannuation standard choice form, before or when you\'re first paid.',
      "If you don't give a payer your fund details, they're required to request your 'stapled' super fund from the ATO — this is whichever fund you're already linked to from previous work, found using your name, date of birth and TFN.",
      "If the ATO comes back with no stapled fund on record for you — common if this is your first ever paid gig — the payer must pay into their own nominated default fund, a standard APRA-regulated MySuper fund, so you still end up with an account even without actively choosing one.",
      "Worth doing anyway: nominate your own preferred fund once, rather than letting every new venue or bandleader default you into whatever fund they happen to use — otherwise you can end up with several small, scattered accounts each paying their own fees. Save your fund details once in Band Roster and you won't need to dig them out for the next gig.",
    ],
    sources: [
      {
        label: 'ATO — Select your default super fund',
        url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/setting-up-super-for-your-business/select-your-default-super-fund',
      },
      {
        label: 'ATO — Stapled super funds for employers',
        url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/setting-up-super-for-your-business/offer-employees-a-choice-of-super-fund/stapled-super-funds-for-employers',
      },
    ],
  },
  {
    id: 'check-super-was-paid',
    question: "How do I actually check whether a gig fee's super was paid, and how long should it take to show up?",
    preview:
      "Check your fund's app or member portal, or ATO online services via myGov — a contribution should be visible within a business day or two of the fund receiving it, not weeks.",
    answer: [
      'Two ways to check: log into your super fund directly (app, website, or phone them and quote your member number), or check ATO online services through myGov, which lists contributions reported against your account by any payer.',
      "From 1 July 2026, the payer's legal deadline is for the fund to receive the contribution, with enough information to allocate it, within 7 business days of the gig being paid. Funds then generally process and show the contribution against your account within a day or two of receiving it — so it's worth giving a short buffer past the 7-business-day mark before assuming something's gone wrong.",
      "If it still hasn't shown up: confirm directly with the payer what they paid, when, and to which fund — mistakes with the wrong fund or missing details are common and often just need re-sending. If that doesn't resolve it, the ATO's free online tool lets you report unpaid super from an employer or payer directly.",
    ],
    sources: [
      {
        label: 'ATO — Unpaid super from your employer',
        url: 'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/unpaid-super-from-your-employer',
      },
      {
        label: 'ATO — Getting it right: compliance in the first year of Payday Super',
        url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/missed-or-late-payday-super-payments/getting-it-right-compliance-in-the-first-year-of-payday-super',
      },
    ],
  },
  {
    id: 'historical-unpaid-super',
    question: "I've been gigging for years and never seen a cent of super — can I claim it for gigs from before 1 July 2026?",
    preview:
      'Potentially, yes — the underlying obligation to pay performers super isn\'t new. Payday Super in 2026 only changed how often it has to be paid, not whether it was ever owed in the first place.',
    answer: [
      "The rule that makes performers \"employees\" for super purposes — section 12(8) of the Superannuation Guarantee (Administration) Act 1992 — has existed for decades, long before Payday Super. Payday Super, from 1 July 2026, only changed the timing (quarterly to every payday), not whether the underlying super guarantee was owed on gigs before that date.",
      'That means if a venue or bandleader paid you to perform at any point the rule applied — and especially since the old $450-per-month exemption for small/casual payments was removed on 1 July 2022 — they may still owe you super for that gig now, even years later.',
      "The ATO doesn't publish a hard cut-off on how far back you can raise unpaid super, but its own guidance is upfront that recovery gets harder, and takes longer, the older the debt gets — so it's worth raising it as soon as you realise, rather than waiting.",
      "Practical first step: check with your fund that nothing was paid for that period, then raise it directly and in writing with whoever paid you — Encore Super's demand-letter tool on the Gig Calculator page generates this for you. If that goes nowhere, the ATO's free online tool lets you report unpaid super from an employer or payer directly, and the Fair Work Ombudsman can help pursue entitlements beyond the standard super rate.",
    ],
    sources: [
      {
        label: 'ATO — Super for sportspeople, performers, film makers and related activities',
        url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/work-out-if-you-have-to-pay-super/super-for-sportspeople-performers-film-makers-and-related-activities',
      },
      {
        label: 'ATO — Unpaid super from your employer',
        url: 'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/unpaid-super-from-your-employer',
      },
      {
        label: 'ATO — Report unpaid super contributions from my employer',
        url: 'https://www.ato.gov.au/calculators-and-tools/super-report-unpaid-super-contributions-from-my-employer',
      },
    ],
    premium: true,
  },
]
