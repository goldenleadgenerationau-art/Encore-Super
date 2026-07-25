import { addBusinessDays } from './businessDays'
import type { GigInput, GigResult } from '../types'

// Current SG rate, locked in at 12% from 1 July 2026 (no further legislated increase).
// Source: ATO "Super guarantee" key rates and thresholds page.
export const SG_RATE = 0.12
export const GST_RATE = 0.1

// Super guarantee is calculated on the GST-EXCLUSIVE value of a fee — GST collected
// on an invoice isn't part of a contractor's earnings for super purposes.
// Source: ATO "Super for independent contractors".
export function calculateGig(input: GigInput): GigResult {
  const notes: string[] = []

  let feeExGst = input.totalFee
  let gstAmount = 0
  if (input.gstMode === 'inclusive') {
    feeExGst = input.totalFee / (1 + GST_RATE)
    gstAmount = input.totalFee - feeExGst
  } else if (input.gstMode === 'exclusive') {
    gstAmount = input.totalFee * GST_RATE
  }
  const invoiceTotal = feeExGst + gstAmount

  if (gstAmount > 0) {
    notes.push(
      `GST of ${gstAmount.toFixed(2)} is excluded from the super calculation — super is only ever worked out on the GST-exclusive value of the fee (${feeExGst.toFixed(2)}).`
    )
  }

  const rawLabour = feeExGst - input.nonLabourAmount
  const labourComponent = Math.max(0, rawLabour)
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

  const superOwed = likelyLiable ? labourComponent * SG_RATE : 0

  let perMember: GigResult['perMember'] = null
  if (input.paidAs === 'bandRepresentative' && input.bandMemberCount > 1 && likelyLiable) {
    const usingCustomShares =
      input.bandCustomShares && input.bandCustomShares.length === input.bandMemberCount

    const wages = usingCustomShares
      ? input.bandCustomShares!.map((w) => Math.max(0, w))
      : Array.from({ length: input.bandMemberCount }, () => labourComponent / input.bandMemberCount)

    perMember = wages.map((wage, i) => ({
      name: input.bandMemberNames?.[i] || `Member ${i + 1}`,
      wage,
      superOwed: wage * SG_RATE,
      total: wage + wage * SG_RATE,
    }))

    if (usingCustomShares) {
      const enteredTotal = wages.reduce((sum, w) => sum + w, 0)
      if (Math.abs(enteredTotal - labourComponent) > 0.5) {
        notes.push(
          `The per-member wages you entered add up to ${enteredTotal.toFixed(2)}, but the labour component of the fee is ${labourComponent.toFixed(2)} — double-check the split.`
        )
      }
      notes.push(
        "As the person collecting the lump sum for the band, you generally become the one responsible for paying super into each band member's fund, on top of their wage."
      )
    } else {
      notes.push(
        `As the person collecting the lump sum for the band, you generally become the one responsible for paying super into each band member's fund, on top of their wage — split evenly here across ${input.bandMemberCount} members as a starting point. Switch to a custom split if members don't share the fee evenly.`
      )
    }
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
