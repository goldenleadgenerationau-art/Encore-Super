export interface Scenario {
  id: string
  title: string
  situation: string
  whoOwes: string
  keyPoints: string[]
  premium?: boolean
}

export const scenarios: Scenario[] = [
  {
    id: 'sole-trader',
    title: "I'm a sole trader with an ABN — does that change anything?",
    situation: 'Most gigging musicians invoice venues and agents using their own ABN as a sole trader, and are used to being treated as contractors for tax purposes.',
    whoOwes: "Whoever engages and pays you to perform — same as if you had no ABN at all.",
    keyPoints: [
      "For most contractors, super only applies if the contract is \"wholly or principally for labour.\" Performers skip that test entirely — s.12(8) makes you an employee for super purposes just by being paid to perform, ABN or not.",
      'Having an ABN, issuing a tax invoice, and calling yourself a contractor all still relate to income tax and GST — none of that removes the super guarantee obligation on whoever pays you.',
      "This is the single most common misunderstanding among gigging musicians — don't assume ABN status means no super is owed.",
    ],
  },
  {
    id: 'solo-venue',
    title: 'Solo artist booked directly by a venue',
    situation: 'A pub, bar, or restaurant books you directly to play a set for a fee.',
    whoOwes: 'The venue.',
    keyPoints: [
      "You're paid to perform, so s.12(8) treats you as an employee of the venue for super purposes.",
      'Your ABN or "contractor" wording in the booking doesn\'t change this.',
      'There is no minimum-fee exemption anymore — the old $450/month threshold was removed from 1 July 2022, so even a one-off low-value gig can trigger super.',
    ],
  },
  {
    id: 'session-musician',
    title: 'Session musician hired by another musician or bandleader',
    situation: 'A bandleader or solo artist pays you out of their own pocket to back them for a show.',
    whoOwes: 'The person who engaged and paid you — i.e. the bandleader, not the venue.',
    keyPoints: [
      'Whoever makes the payment for your performance is generally the one liable, even if they are themselves a performer being paid by the venue.',
      'This is easy to miss: a bandleader can owe super to their own hired musicians while also being owed super by the venue.',
    ],
  },
  {
    id: 'band-lump-sum',
    title: 'Bandleader collects one lump sum for the whole band',
    situation: 'The venue pays a single fee to one band member (or the band\'s representative), who then divides it among everyone.',
    whoOwes: 'It depends on who the venue\'s booking contract is actually with. If it\'s with the band (named as the act, or the members), the venue generally owes super across the whole band. If it\'s only with the bandleader\'s own business — who arranges the rest of the band themselves — the venue\'s obligation is generally limited to the bandleader\'s own share, and the bandleader becomes responsible for the others\' super in turn.',
    keyPoints: [
      'This is the single biggest thing to get confirmed in writing before the gig — it decides whether the venue\'s liability covers one person or the whole band.',
      'Whoever ends up liable for the whole band is generally treated as administering super for the rest of the group, not just paying their own.',
      "Use the Gig Calculator's \"venue / booker\" mode to run both versions and see exactly how the numbers differ.",
    ],
    premium: true,
  },
  {
    id: 'private-function',
    title: 'Wedding or private function booked via an agent',
    situation: 'A booking agent arranges the gig and the client pays the agent, who pays you.',
    whoOwes: 'Usually whoever actually makes the payment to you — check your agreement, since agents sometimes structure this differently.',
    keyPoints: [
      'If the agent pays you directly out of the fee they collected, the agent is generally the liable party.',
      'If the client pays you directly and the agent only introduces the booking, the client is generally liable.',
      'Get the payment flow confirmed in writing before the event.',
    ],
    premium: true,
  },
  {
    id: 'private-direct',
    title: 'Private client (e.g. a couple) books and pays you directly',
    situation: 'No agent or venue in the middle — a private individual books you for their event and pays your fee.',
    whoOwes: 'The private client who paid you.',
    keyPoints: [
      "Private individuals can be liable for super too — it's not limited to businesses.",
      'In practice this is under-enforced for one-off private bookings, but the legal obligation still exists.',
    ],
  },
  {
    id: 'dj-set',
    title: 'DJ set at a venue or club',
    situation: "You're booked to DJ rather than play an instrument live.",
    whoOwes: 'The venue or promoter that books and pays you.',
    keyPoints: [
      's.12(8) covers being paid to "perform, present, or participate in" music, entertainment, or a similar activity — DJing squarely fits this.',
      'Same labour/non-labour split applies if your fee bundles in equipment hire.',
    ],
  },
  {
    id: 'busking',
    title: 'Busking',
    situation: 'You perform in a public space and passers-by give money voluntarily.',
    whoOwes: 'Nobody, generally — there is no single party engaging and paying you to perform.',
    keyPoints: [
      'Super guarantee requires a payer who engages you for the performance; voluntary tips from the public don\'t create that relationship.',
      'If a council or event pays you a fee to busk at a scheduled event, that\'s a different situation — treat it like a standard booking.',
    ],
  },
  {
    id: 'own-company',
    title: 'You invoice through your own Pty Ltd company',
    situation: 'Your company (not you personally) issues the invoice and receives the gig fee.',
    whoOwes: 'Not straightforward — this is one of the few situations where the s.12(8) performer rule may not apply the same way, because the payment is made to a company rather than an individual.',
    keyPoints: [
      "This is a genuine grey area — company structures change the analysis and it's easy to get wrong in either direction.",
      'Get this specific situation checked with a registered tax agent or the ATO before relying on it.',
    ],
    premium: true,
  },
  {
    id: 'band-partnership',
    title: "Your band is a registered partnership",
    situation: 'The band itself (not any one member) is registered as a formal partnership — you lodge a partnership tax return and split net income between partners, and that\'s who invoices the venue.',
    whoOwes: 'Genuinely unclear — this sits in the same grey area as invoicing through a company, for a different reason.',
    keyPoints: [
      "The ATO's own guidance on the general contractor rules (SGR 2005/1) says payments made to a partnership — rather than to an individual — generally don't create an employer/employee relationship, because a partner can't be an \"employee\" of the partnership, and the same reasoning is usually applied to whoever the partnership contracts with.",
      "But that reasoning leans on the ordinary contractor test requiring a contract \"wholly or principally for a person's labour\" — and the ATO's own ruling notes the s.12(8) performer rule this whole site is built around isn't limited that way. So it's a genuinely open question whether being a partnership shields a band from s.12(8) the same way it shields ordinary contractors.",
      "This isn't settled either way — don't assume you're covered, and don't assume you're not. Get this specific situation checked with a registered tax agent or the ATO before relying on it.",
    ],
    premium: true,
  },
  {
    id: 'residency',
    title: 'Regular weekly residency at the same venue',
    situation: 'You play the same venue every week on an ongoing arrangement.',
    whoOwes: 'The venue, on every payday.',
    keyPoints: [
      'Payday Super applies per payday, not per calendar quarter — a weekly residency means weekly super obligations from 1 July 2026, not one lump catch-up.',
      'Regular ongoing arrangements are also more likely to attract scrutiny if super is missed, simply because there\'s a pattern to check.',
    ],
  },
]
