import { next } from '@vercel/functions'
import { routeMetaForPath, OG_IMAGE, SITE_URL } from './src/lib/seoMeta'

// Social/chat link-preview crawlers don't execute JS, so they only ever see
// the static index.html shell — no per-page title/description/OG tags,
// since those are injected by React at runtime. This serves those specific
// bots a minimal static HTML page with the real per-route meta instead.
// Googlebot is deliberately excluded — it renders JS and already sees the
// real content, so treating it specially here would add risk for no gain.
const BOT_UA_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|SkypeUriPreview|Pinterest|redditbot|Applebot|vkShare|Iframely|Embedly|Quora Link Preview|SignalBot/i

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderBotHtml(pathname: string): string {
  const meta = routeMetaForPath(pathname)
  const canonical = `${SITE_URL}${meta.path}`
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const robots = meta.noindex ? '\n    <meta name="robots" content="noindex, follow" />' : ''

  return `<!doctype html>
<html lang="en-AU">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonical}" />${robots}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Encore Super" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
  </head>
  <body></body>
</html>`
}

export default function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') ?? ''
  if (!BOT_UA_PATTERN.test(userAgent)) {
    return next()
  }

  const { pathname } = new URL(request.url)
  return new Response(renderBotHtml(pathname), {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

// Only run on page routes — anything without a file extension. Static
// assets (JS/CSS/images/sitemap.xml/robots.txt) skip the middleware
// entirely and are served directly, same as before.
export const config = {
  matcher: ['/((?!.*\\..*).*)'],
}
