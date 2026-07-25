import { OG_IMAGE, SITE_URL, type RouteMeta } from '../lib/seoMeta'

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Encore Super',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  areaServed: 'AU',
}

const SOFTWARE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Encore Super',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description:
    'Superannuation calculator and Payday Super deadline tracker built for Australian performing musicians, bands, and bookers.',
  offers: [
    { '@type': 'Offer', price: '12.99', priceCurrency: 'AUD', name: 'Monthly' },
    { '@type': 'Offer', price: '99.00', priceCurrency: 'AUD', name: 'Yearly' },
  ],
}

// React 19 natively hoists title/meta/link/script tags rendered anywhere in
// the tree into <head>, de-duping by tag identity as this component
// re-renders — no helmet-style library needed, and no risk of it silently
// leaving stale tags behind (a real bug hit here: react-helmet-async's own
// tag-replacement bookkeeping wasn't running under React 19, so it just
// appended duplicates next to the static tags instead of replacing them).
export function Seo({ meta }: { meta: RouteMeta }) {
  const canonical = `${SITE_URL}${meta.path}`
  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />
      {meta.noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Encore Super" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {meta.path === '/' && (
        <script type="application/ld+json">{JSON.stringify(ORG_JSON_LD)}</script>
      )}
      {(meta.path === '/' || meta.path === '/pricing') && (
        <script type="application/ld+json">{JSON.stringify(SOFTWARE_JSON_LD)}</script>
      )}
    </>
  )
}
