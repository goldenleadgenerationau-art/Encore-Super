export type View =
  | 'home'
  | 'calculator'
  | 'deadline'
  | 'coverage'
  | 'scenarios'
  | 'rules'
  | 'pricing'
  | 'roster'
  | 'privacy'
  | 'terms'

export type PayerType = 'venue' | 'agentOrPromoter' | 'privateClient' | 'anotherMusician'

export type PaidAs = 'individual' | 'bandRepresentative' | 'ownCompany'

// Who's using the calculator: the performer/band receiving the fee, or the
// venue/booker working out what they owe. Same math either way except for
// the band-lump-sum case, where a payer needs one extra question a
// performer never needs to answer (see bandContractWith).
export type Perspective = 'performer' | 'payer'

// Only relevant when paidAs === 'bandRepresentative' and perspective ===
// 'payer'. A venue's super obligation genuinely differs depending on who
// their booking contract is actually with:
// 'wholeBand' — the contract is with the band (named as the act, or the
//   members) and the lump sum is just a payment convenience. The venue
//   owes super across the whole band.
// 'bandleaderBusiness' — the contract is only with the bandleader's own
//   business, who separately arranges the rest of the band. The venue's
//   obligation is generally limited to the bandleader's own share; the
//   bandleader becomes responsible for the others' super in turn.
export type BandContractWith = 'wholeBand' | 'bandleaderBusiness'

// 'none' — not GST registered, no GST applies to the fee.
// 'inclusive' — the entered fee already has 10% GST built into it.
// 'exclusive' — the entered fee is before GST; GST is added on top.
export type GstMode = 'none' | 'inclusive' | 'exclusive'

export interface GigInput {
  totalFee: number
  gstMode: GstMode
  nonLabourAmount: number
  paidAs: PaidAs
  perspective: Perspective
  bandContractWith?: BandContractWith
  bandleaderShare?: number // only used when bandContractWith === 'bandleaderBusiness' — the bandleader's own personal cut of the lump sum, which is all that's superable from the payer's side
  bandMemberCount: number
  bandCustomShares?: number[] // per-member wage $, only used when the split isn't even
  bandMemberNames?: string[] // optional, pulled from a saved band roster
  paydayDate: string // ISO date the fee is actually paid
}

export interface BandMemberBreakdown {
  name: string
  wage: number
  superOwed: number
  total: number
}

export interface GigResult {
  feeExGst: number
  gstAmount: number
  invoiceTotal: number
  labourComponent: number
  superOwed: number
  perMember: BandMemberBreakdown[] | null
  fundDeadline: Date
  likelyLiable: boolean
  notes: string[]
}
