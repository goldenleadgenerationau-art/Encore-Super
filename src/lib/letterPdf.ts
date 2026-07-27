const currency = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })

function formatLongDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatLongDateObj(d: Date): string {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export interface DemandLetterParams {
  senderName: string
  senderEmail?: string
  venueName: string
  performanceDate: string // ISO
  paydayDate: string // ISO
  fundDeadline: Date
  labourComponent: number
  superOwed: number
  isBand: boolean
}

// A factual, non-threatening request for confirmation/payment of super owed
// on a specific booking — not a legal demand, deliberately, since this app
// isn't providing legal advice and shouldn't read like it's escalating on
// the performer's behalf. Framed as "please confirm or action this",
// citing the actual rules, with a clear disclaimer at the bottom.
// jsPDF is dynamically imported so it (and its dependencies) only get
// fetched when someone actually generates a letter, instead of bloating
// every page load with a library most visitors will never trigger.
export async function downloadDemandLetterPdf(params: DemandLetterParams) {
  const { jsPDF } = await import('jspdf')
  const {
    senderName,
    senderEmail,
    venueName,
    performanceDate,
    paydayDate,
    fundDeadline,
    labourComponent,
    superOwed,
    isBand,
  } = params

  const today = new Date()
  const deadlinePassed = today.getTime() > fundDeadline.getTime()
  const who = isBand ? 'the band' : 'me'
  const whoOwed = isBand ? "the band's" : 'my'

  const paragraphs: string[] = [
    `On ${formatLongDate(performanceDate)}, ${isBand ? 'the band' : 'I'} performed for ${venueName} for a fee that included a labour component of ${currency.format(labourComponent)}.`,
    `Under section 12(8) of the Superannuation Guarantee (Administration) Act 1992, a performer engaged and paid to perform is treated as an employee for superannuation guarantee purposes — this applies regardless of ABN or contractor status, and there is no minimum-fee exemption.`,
    `On that basis, superannuation guarantee of ${currency.format(superOwed)} (12% of the labour component) was payable on this booking, on top of the fee.`,
    `Under Payday Super, this amount was required to reach ${who === 'the band' ? "the band members'" : 'my'} nominated super fund${isBand ? '(s)' : ''} within 7 business days of payday (${formatLongDate(paydayDate)}) — by ${formatLongDateObj(fundDeadline)}.`,
    deadlinePassed
      ? `As of the date of this letter, that deadline has passed and ${who === 'the band' ? 'we have' : 'I have'} not received confirmation that ${whoOwed} superannuation guarantee payment has been made.`
      : `This deadline is approaching — ${who === 'the band' ? 'we would' : 'I would'} appreciate confirmation that ${whoOwed} superannuation guarantee payment is being arranged.`,
    `Could you please confirm whether this payment has been made or, if not, arrange for it to be paid as soon as possible? If super isn't received by the fund within the required timeframe, the payer may become liable for the superannuation guarantee charge (SGC) — assessed directly by the ATO, and including an administrative uplift and potential penalties of up to 200% of the shortfall.`,
    `Happy to provide fund details again or discuss this further if useful.`,
  ]

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const marginX = 22
  const pageWidth = doc.internal.pageSize.getWidth()
  const maxWidth = pageWidth - marginX * 2
  let y = 25

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(formatLongDateObj(today), marginX, y)
  y += 12

  doc.text(venueName, marginX, y)
  y += 10

  doc.setFont('helvetica', 'bold')
  const subjectLines = doc.splitTextToSize(
    `Re: Superannuation guarantee payment — booking on ${formatLongDate(performanceDate)}`,
    maxWidth
  )
  doc.text(subjectLines, marginX, y)
  y += subjectLines.length * 6 + 8

  doc.setFont('helvetica', 'normal')
  doc.text(`Dear ${venueName},`, marginX, y)
  y += 10

  for (const p of paragraphs) {
    const lines = doc.splitTextToSize(p, maxWidth)
    if (y + lines.length * 6 > 270) {
      doc.addPage()
      y = 25
    }
    doc.text(lines, marginX, y)
    y += lines.length * 6 + 6
  }

  y += 4
  doc.text('Kind regards,', marginX, y)
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text(senderName, marginX, y)
  if (senderEmail) {
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.text(senderEmail, marginX, y)
  }

  // Footer disclaimer + attribution, pinned near the bottom of the last page.
  const footerY = 280
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  const disclaimer = doc.splitTextToSize(
    'This letter is general information based on current ATO and Fair Work guidance, not legal or financial advice — get your specific situation checked with the ATO or a registered tax agent before relying on it. Generated using Encore Super (encoresuper.com.au).',
    maxWidth
  )
  doc.text(disclaimer, marginX, footerY)

  const filename = `super-payment-letter-${venueName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${performanceDate || 'gig'}.pdf`
  doc.save(filename)
}
