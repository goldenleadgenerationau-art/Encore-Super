import type { View } from '../types'

export const SITE_URL = 'https://encoresuper.com.au'
export const OG_IMAGE = `${SITE_URL}/og-image.png`

export interface RouteMeta {
  view: View
  path: string
  title: string
  description: string
  // Only pages with real, indexable content on first load are worth Google
  // crawling — Pricing/Roster carry PII or a live sign-in form, and their
  // content doesn't matter for search intent, so they stay noindex.
  noindex?: boolean
}

export const ROUTES: RouteMeta[] = [
  {
    view: 'home',
    path: '/',
    title: 'Encore Super — Superannuation Calculator for Australian Performing Musicians',
    description:
      "Work out exactly what super is owed on a gig fee under Australia's Payday Super rules. Free Gig Super Calculator, Payday Deadline Tracker, and plain-English rules for musicians, bands, and bookers.",
  },
  {
    view: 'calculator',
    path: '/gig-calculator',
    title: 'Gig Super Calculator — Work Out Super on Any Booking | Encore Super',
    description:
      "Enter a real gig fee — solo, band lump sum, or agent-booked — and see exactly what superannuation guarantee is owed, including GST and labour/non-labour splits, under Australia's Payday Super rules.",
  },
  {
    view: 'deadline',
    path: '/payday-deadline-tracker',
    title: 'Payday Super Deadline Tracker for Gig Payments | Encore Super',
    description:
      "From 1 July 2026, super must land in a performer's fund within 7 business days of payday. Enter a payday to see the exact deadline, instantly.",
  },
  {
    view: 'coverage',
    path: '/am-i-covered',
    title: 'Am I Covered? Check If Your Gig Owes Super | Encore Super',
    description:
      'A 3-question walkthrough that tells you, in plain English, whether a booking is likely to trigger a superannuation guarantee obligation under section 12(8).',
  },
  {
    view: 'scenarios',
    path: '/scenarios',
    title: 'Super Scenarios for Musicians — Solo, Band, Agent & More | Encore Super',
    description:
      'Solo gigs, session work, band splits, private functions, DJ sets, busking, your own company — mapped to who actually owes super under Australian law.',
  },
  {
    view: 'rules',
    path: '/rules-explained',
    title: 'Australian Super Rules for Performers, Explained | Encore Super',
    description:
      'Plain-English summaries of section 12(8), the labour/non-labour split, Payday Super deadlines, and penalties for missed super — each linked to its official ATO or Fair Work source.',
  },
  {
    view: 'faq',
    path: '/faq',
    title: 'FAQs — Paying Super to a Band Without Accounting Software | Encore Super',
    description:
      'Practical questions musicians actually ask — like how a bandleader pays super to the rest of the band without accounting software, using a free super fund employer portal.',
  },
  {
    view: 'pricing',
    path: '/pricing',
    title: 'Pricing — Encore Super',
    description:
      'Full access to the Gig Super Calculator, Payday Deadline Tracker, Scenario Library, Band Roster, and CSV export for $12.99/month or $99/year.',
    noindex: true,
  },
  {
    view: 'roster',
    path: '/band-roster',
    title: 'Band Roster — Encore Super',
    description: "Save your band's member names and super fund details so you never re-type them for a gig again.",
    noindex: true,
  },
  {
    view: 'privacy',
    path: '/privacy-policy',
    title: 'Privacy Policy — Encore Super',
    description: 'How Encore Super collects, uses, and protects your data.',
  },
  {
    view: 'terms',
    path: '/terms-of-service',
    title: 'Terms of Service — Encore Super',
    description: 'The terms that apply when you use Encore Super.',
  },
  {
    view: 'landing',
    path: '/for-musicians',
    title: 'Free Gig Super Calculator for Australian Musicians | Encore Super',
    description:
      "Find out exactly what superannuation a gig owes you — and when it must land under Australia's new Payday Super rules. Try the free calculator built for gigging musicians.",
    // Ad/campaign landing page — deliberately not competing with the
    // homepage for the same organic search terms, but this entry still
    // has to exist so the social-crawler bot middleware (see middleware.ts)
    // serves the right OG/title tags for FB/IG ad link previews.
    noindex: true,
  },
]

export const VIEW_TO_PATH: Record<View, string> = Object.fromEntries(
  ROUTES.map((r) => [r.view, r.path])
) as Record<View, string>

const PATH_TO_ROUTE: Record<string, RouteMeta> = Object.fromEntries(ROUTES.map((r) => [r.path, r]))

export function routeMetaForPath(pathname: string): RouteMeta {
  return PATH_TO_ROUTE[pathname] ?? ROUTES[0]
}
