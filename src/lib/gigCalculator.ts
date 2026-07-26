import { addBusinessDays } from './businessDays'
import type { GigInput, GigResult } from '../types'

// Current SG rate, locked in at 12% from 1 July 2026 (no further legislated increase).
// Source: ATO "Super guarantee" key rates and thresholds page.
export const SG_RATE = 0.12
export const GST_RATE = 0.1

// Rounds to the nearest cent. Every monetary value below is rounded at the
// point it's computed, before it's ever combined into a displayed total —
// otherwise a line like "$545.45 + $65.45" can display a "Total" of $610.91
// (computed from the unrounded $65.454545...) instead of the $610.90 the
// two rounded figures shown actually add up to.
function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Super guarantee is calculated on the GST-EXCLUSIVE value of a fee — GST collected
// on an invoice isn't part of a contractor's earnings for super purposes.
// Source: ATO "Super for independent contractors".
export function calculateGig(input: GigInput): GigResult {
  const notes: string[] = []

  let feeExGst = input.totalFee
  let gstAmount = 0
  if (input.gstMode === 'inclusive') {
    feeExGst = round2(input.totalFee / (1 + GST_RATE))
    gstAmount = round2(input.totalFee - feeExGst)
  } else if (input.gstMode === 'exclusive') {
    gstAmount = round2(input.totalFee * GST_RATE)
  }
  const invoiceTotal = feeExGst + gstAmount

  if (gstAmount > 0) {
    notes.push(
      `GST of ${gstAmount.toFixed(2)} is excluded from the super calculation — super is only ever worked out on the GST-exclusive value of the fee (${feeExGst.toFixed(2)}).`
    )
  }

  const rawLabour = feeExGst - input.nonLabourAmount
  const labourComponent = round2(Math.max(0, rawLabour))
  if (input.nonLabourAmount > feeExGst) {
    notes.push(
      'The non-labour amount you entered is larger than the GST-exclusive fee, so it was capped — check your figures.'
    )
  }

  let likelyLiable = true
  if (input.paidAs === 'ownCompany') {
    likelyLiable = false
    notes.push(
      'You told us the fee is paid to your own company (not to you as an individual). The s.12(8) performer rule generally targets payments made directly to an individual, so the venue/booker paying your company is on different footing — get this checked, because the answer can flip depending on how the booking is structured.'
    )
  } else {
    notes.push(
      'Because you (or your band) were paid to perform, the payer generally has to treat you as an employee for super purposes — being a sole trader with an ABN, or invoicing as a "contractor," does not remove this obligation.'
    )
  }

  if (input.nonLabourAmount > 0 && likelyLiable) {
    notes.push(
      'Super is only calculated on the labour part of the fee. Amounts genuinely for equipment hire, PA/lighting hire, or travel/materials can be excluded if they are itemised in the booking agreement or invoice — otherwise the ATO expects a reasonable market-value split.'
    )
  }

  // A venue's own obligation genuinely stops at the bandleader when the
  // booking contract is only with the bandleader's business — the rest of
  // the band becomes the bandleader's problem to sort out, not the
  // venue's. See the BandContractWith type for the full reasoning.
  const bandleaderOnly =
    input.paidAs === 'bandRepresentative' &&
    input.perspective === 'payer' &&
    input.bandContractWith === 'bandleaderBusiness'

  // In bandleaderOnly mode, only the bandleader's own personal cut of the
  // lump sum is superable — the rest is money passing through to the other
  // members, not the bandleader's own earnings, so it doesn't belong in
  // THIS super calculation (same principle as the itemised invoice
  // examples: only what's actually attributable to the person you're
  // paying counts, not amounts they collect on someone else's behalf).
  const bandleaderShare = round2(Math.min(Math.max(0, input.bandleaderShare ?? 0), labourComponent))
  const superableAmount = bandleaderOnly ? bandleaderShare : labourComponent
  const superOwed = likelyLiable ? round2(superableAmount * SG_RATE) : 0

  let perMember: GigResult['perMember'] = null
  if (input.paidAs === 'bandRepresentative' && input.bandMemberCount > 1 && likelyLiable && !bandleaderOnly) {
    const usingCustomShares =
      input.bandCustomShares && input.bandCustomShares.length === input.bandMemberCount

    const wages = usingCustomShares
      ? input.bandCustomShares!.map((w) => round2(Math.max(0, w)))
      : Array.from({ length: input.bandMemberCount }, () => round2(labourComponent / input.bandMemberCount))

    perMember = wages.map((wage, i) => {
      const memberSuper = round2(wage * SG_RATE)
      return {
        name: input.bandMemberNames?.[i] || `Member ${i + 1}`,
        wage,
        superOwed: memberSuper,
        total: wage + memberSuper,
      }
    })

    if (usingCustomShares) {
      const enteredTotal = wages.reduce((sum, w) => sum + w, 0)
      if (Math.abs(enteredTotal - labourComponent) > 0.5) {
        notes.push(
          `The per-member wages you entered add up to ${enteredTotal.toFixed(2)}, but the labour component of the fee is ${labourComponent.toFixed(2)} — double-check the split.`
        )
      }
    }

    if (input.perspective === 'payer') {
      notes.push(
        "As the venue, your obligation is to make sure super lands in every band member's fund, on top of their wage — how the lump sum itself gets divided between members is between the band, typically administered by whoever collects it (e.g. the bandleader)."
      )
    } else {
      notes.push(
        usingCustomShares
          ? "As the person collecting the lump sum for the band, you generally become the one responsible for paying super into each band member's fund, on top of their wage."
          : `As the person collecting the lump sum for the band, you generally become the one responsible for paying super into each band member's fund, on top of their wage — split evenly here across ${input.bandMemberCount} members as a starting point. Switch to a custom split if members don't share the fee evenly.`
      )
    }
  }

  if (bandleaderOnly && likelyLiable) {
    notes.push(
      `Because your booking contract is with the bandleader's own business — not the whole band — your super obligation is generally limited to the bandleader's own share of the fee (${bandleaderShare.toFixed(2)}), not the full amount you're paying out. The rest is money the bandleader passes on to the other members, not their own earnings.`
    )
    notes.push(
      "The bandleader then becomes responsible, as the one engaging the rest of the band, for paying their super out of what they're paid — that part isn't covered by this calculation."
    )
    notes.push(
      "Get this contract structure confirmed in writing before the gig. If the booking is later treated as being with the whole band rather than just the bandleader's business, your liability could extend to the other members' super too."
    )
  }

  const paydayDate = input.paydayDate ? new Date(input.paydayDate) : new Date()
  const fundDeadline = addBusinessDays(paydayDate, 7)

  if (likelyLiable) {
    notes.push(
      'Under Payday Super (from 1 July 2026), this super must land in the right fund within 7 business days of the day the gig fee is actually paid — not by the old quarterly cut-off.'
    )
  }

  return {
    feeExGst,
    gstAmount,
    invoiceTotal,
    labourComponent,
    superOwed,
    perMember,
    fundDeadline,
    likelyLiable,
    notes,
  }
}
