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

// 'none' — not GST registered, no GST applies to the fee.
// 'inclusive' — the entered fee already has 10% GST built into it.
// 'exclusive' — the entered fee is before GST; GST is added on top.
export type GstMode = 'none' | 'inclusive' | 'exclusive'

export interface GigInput {
  totalFee: number
  gstMode: GstMode
  nonLabourAmount: number
  paidAs: PaidAs
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
