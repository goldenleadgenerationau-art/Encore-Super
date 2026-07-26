export interface InvoiceLine {
  description: string
  amount: number
  superable?: boolean // true = counts toward the labour component super is calculated on
}

export interface InvoiceExample {
  id: string
  title: string
  audience: string
  context: string
  lines: InvoiceLine[]
  closingNote: string
  gstNote?: string
}

export const invoiceExamples: InvoiceExample[] = [
  {
    id: 'solo-performer',
    title: 'Solo performer',
    audience: 'For performers invoicing a venue or client',
    context: 'A solo guitarist plays a 3-hour wedding reception set and supplies their own PA system.',
    lines: [
      { description: 'Performance fee — 3-hour solo set', amount: 650, superable: true },
      { description: 'PA / sound equipment hire', amount: 150, superable: false },
    ],
    closingNote:
      "Only the $650 performance fee is labour for super purposes — the PA hire is itemised on its own line so it's excluded. The super line below is shown for clarity on the full cost, but it isn't actually paid to the performer along with the invoice — it goes straight into their fund separately.",
    gstNote:
      "If you're GST-registered, add 10% GST as its own line on top of the fee — never superable. See the GST line in the venue example below for how that looks.",
  },
  {
    id: 'band-performance',
    title: 'Band performance',
    audience: 'For a bandleader invoicing on behalf of the band',
    context: 'A 4-piece band plays a 4-hour function for one combined fee, invoiced by the bandleader under his own ABN.',
    lines: [
      { description: 'Alex (bandleader) — performance fee', amount: 600, superable: true },
      { description: 'Sam, Jordan, Casey — performance fees (collected by Alex, paid on to the band)', amount: 1400, superable: false },
    ],
    closingNote:
      "Because Alex invoices this under his own ABN, the payer's direct super obligation is generally limited to Alex's own $600 share — not the full $2,000 he then distributes to the rest of the band. Alex becomes responsible for paying Sam, Jordan and Casey's super out of what he pays them, separately from this invoice. Whether the payer's liability instead extends to the whole band depends on how the booking is actually contracted — see the lump-sum scenario above.",
    gstNote:
      "If the invoice includes GST, add it as one line on the $2,000 total the same way — never superable. See the venue example below for how a GST line looks.",
  },
  {
    id: 'venue-received',
    title: "What a venue should ask for",
    audience: 'For venues/bookers checking an invoice before paying',
    context: 'A GST-registered solo DJ invoices a venue for a 5-hour set, including lighting hire.',
    lines: [
      { description: 'Performance fee — 5-hour DJ set (ex GST)', amount: 1000, superable: true },
      { description: 'Lighting hire (ex GST)', amount: 200, superable: false },
      { description: 'GST (10%)', amount: 120, superable: false },
    ],
    closingNote:
      "As the venue, only the $1,000 performance fee counts toward super — GST and the itemised lighting hire don't. If an invoice you receive doesn't itemise non-labour costs like this, the ATO's default position is to treat the whole amount as labour — so it's worth asking for one itemised like this, and budgeting for the super line below on top, before you pay.",
  },
]
