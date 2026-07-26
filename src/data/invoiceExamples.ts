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
  },
  {
    id: 'band-performance',
    title: 'Band performance',
    audience: 'For a bandleader invoicing on behalf of the band',
    context: 'A 4-piece band plays a 4-hour function for one combined fee, invoiced by the bandleader.',
    lines: [{ description: 'Band performance fee — 4-hour function, 4 performers', amount: 2000, superable: true }],
    closingNote:
      "The invoice itself is one lump sum, but it's worth attaching a per-member breakdown for the booker's records — e.g. Alex (bandleader) $600, Sam $500, Jordan $500, Casey $400 — so whoever ends up responsible for super has a clear starting point per person. Who that obligation actually falls to (the venue for the whole band, or just the bandleader) depends on the booking contract — see the lump-sum scenario above. The super line below is shown as one combined figure across the band for clarity; in practice it's paid per member, into each of their own funds.",
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
