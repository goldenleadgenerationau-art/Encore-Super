export interface RuleSection {
  id: string
  title: string
  preview: string
  body: string[]
  source: { label: string; url: string }
}

export const ruleSections: RuleSection[] = [
  {
    id: 'performer-rule',
    title: "The performer rule (s.12(8)) — why your ABN doesn't get you out of this",
    preview:
      "Yes, even with an ABN — you're treated as an employee for super purposes the moment you're paid to perform.",
    body: [
      'Under section 12(8) of the Superannuation Guarantee (Administration) Act 1992, anyone paid to perform, present, or participate in a performance — or to provide services required for one — is treated as an employee for super purposes.',
      'This overrides the usual "ABN means you\'re a contractor" assumption. A venue, promoter, or bandleader that pays you to play is generally required to pay you super, full stop.',
      'The old $450-per-month earnings threshold that used to exempt small/casual payments was removed from 1 July 2022 — so even a single low-value gig can trigger a super obligation now.',
    ],
    source: {
      label: 'ATO — Super for sportspeople, performers, film makers and related activities',
      url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/work-out-if-you-have-to-pay-super/super-for-sportspeople-performers-film-makers-and-related-activities',
    },
  },
  {
    id: 'labour-split',
    title: 'Labour vs non-labour: super is only calculated on part of the fee',
    preview:
      'Only the labour part of your fee counts — genuinely separate costs like PA hire can be excluded if itemised.',
    body: [
      'Super guarantee is only ever calculated on the labour component of what you\'re paid — your ordinary time earnings (from 1 July 2026, called "qualifying earnings").',
      'If your gig fee bundles in something genuinely separate — PA or lighting hire, travel, materials — that portion can be excluded, provided it\'s itemised in the contract/invoice or can be justified at a reasonable market value.',
      "If a contract doesn't split these out and can't reasonably be split (a single bundled service), the ATO may treat the whole thing as labour. When in doubt, itemise your invoices.",
      "If you're GST-registered and charging GST on top of your fee, that GST is excluded from the super calculation too — super is only ever worked out on the GST-exclusive labour value.",
    ],
    source: {
      label: 'ATO — Super for independent contractors',
      url: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/work-out-if-you-have-to-pay-super/super-for-independent-contractors',
    },
  },
  {
    id: 'payday-super',
    title: 'Payday Super (from 1 July 2026) — the deadline changed',
    preview:
      "From 1 July 2026, super is due every payday, not quarterly — within 7 business days of the fee being paid.",
    body: [
      'Before 1 July 2026, employers only had to settle super quarterly. From 1 July 2026, super must be paid every payday — at the same time as the wage or fee — and must actually land in the performer\'s chosen fund within 7 business days of that payday.',
      'This applies to casual and one-off engagements too, not just ongoing employees — there is no "it was just a single gig" exemption.',
      'Super guarantee is now calculated at 12% of "qualifying earnings" (QE), a broader concept than the old ordinary time earnings — it includes casual loading, commissions, bonuses and most regular allowances, but excludes overtime, expense reimbursements and most termination payments.',
    ],
    source: {
      label: 'Fair Work Ombudsman — Payday Super: new rules starting 1 July 2026',
      url: 'https://www.fairwork.gov.au/newsroom/news/payday-super-new-rules-starting-1-july-2026',
    },
  },
  {
    id: 'penalties',
    title: "What happens if it's missed",
    preview:
      'Miss the deadline and the payer faces the super guarantee charge — plus an uplift, and penalties up to 200%.',
    body: [
      "If super isn't received by the fund within the deadline, the payer becomes liable for the super guarantee charge (SGC) — this is assessed directly by the ATO, not self-reported like normal SG.",
      'The SGC includes an administrative uplift amount on top of the shortfall, and penalties can run up to 200% of the charge (though the ATO can remit part or all of that in genuine cases).',
      "This is one reason it's worth confirming who's responsible for super before the gig, not after.",
    ],
    source: {
      label: 'ATO — Payday superannuation announcements',
      url: 'https://www.ato.gov.au/about-ato/new-legislation/in-detail/superannuation/payday-superannuation',
    },
  },
]

export const sgRate = {
  ratePercent: 12,
  effectiveFrom: '1 July 2026',
  note: 'No further legislated increase is currently scheduled beyond 12%.',
}
