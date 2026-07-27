export interface Testimonial {
  stars: number
  title: string
  quote: string
  name: string
  role: string
  location: string
}

// Illustrative only — not real customer quotes yet. Swap these out for
// genuine testimonials once collected; keep the "Example feedback" label
// in TestimonialWidget.tsx until then so nothing reads as a fabricated
// review (Australian Consumer Law takes a dim view of fake testimonials).
export const testimonials: Testimonial[] = [
  {
    stars: 5,
    title: 'Absolute game-changer for solo acts.',
    quote:
      "I play 3 to 4 pub gigs a week and tracking which venues actually paid my super used to be a complete nightmare. For $12.99, this tool does all the heavy lifting. I just log the gig, export the CSV at tax time, and hand it to my accountant. It's already helped me claw back over $600 in unpaid super from a venue that 'forgot' to pay. Best money I spend each month.",
    name: 'Tom L.',
    role: 'Solo Acoustic Artist',
    location: 'Melbourne',
  },
  {
    stars: 5,
    title: "Finally, a tool that understands the 'labor component' rule.",
    quote:
      'As a session drummer, invoicing is always messy because I have to split my gear hire from my performance fee so venues don’t complain about the super calculation. Encore Super handles that split instantly. The built-in calculator is completely foolproof and saves me hours of manual spreadsheet math every weekend.',
    name: 'Sarah M.',
    role: 'Session Musician & Educator',
    location: 'Sydney',
  },
  {
    stars: 5,
    title: 'The new template section is worth the subscription alone.',
    quote:
      'Managing super for a 5-piece corporate band was driving me crazy. Being able to export a clean CSV per gig and instantly generate a formal PDF letter to send straight to corporate clients is incredible. It looks highly professional, and clients pay up without arguing. If you gig regularly in Australia, you need this.',
    name: 'Marcus T.',
    role: 'Band Leader & Agency Owner',
    location: 'Brisbane',
  },
  {
    stars: 5,
    title: 'Stopped me from losing thousands in retirement savings.',
    quote:
      "I honestly didn't think DJs were eligible for super under an ABN until I found this site. Turns out I've been missing out for years. This app makes it so easy to track what promoters owe me. It's dead simple, no accounting fluff, just straight-up utility. Highly recommend to anyone in the electronic music scene.",
    name: 'DJ K-Roc',
    role: 'DJ',
    location: 'Perth',
  },
]
