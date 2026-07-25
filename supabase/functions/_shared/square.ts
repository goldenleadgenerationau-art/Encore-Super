// Thin fetch wrapper around the Square REST API, mirroring the style of the
// GHL client in the receptionist project (services/ghl.ts): typed, throws a
// clear config error if secrets are missing, one function per call site.

const SQUARE_API_VERSION = Deno.env.get('SQUARE_API_VERSION') ?? '2026-05-20'

export class SquareConfigError extends Error {}

function baseUrl(): string {
  const env = Deno.env.get('SQUARE_ENVIRONMENT') ?? 'sandbox'
  return env === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com'
}

export async function squareFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = Deno.env.get('SQUARE_ACCESS_TOKEN')
  if (!accessToken) throw new SquareConfigError('SQUARE_ACCESS_TOKEN is not configured')

  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': SQUARE_API_VERSION,
      Authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
  })

  const body = await res.json()
  if (!res.ok) {
    throw new Error(`Square API error (${res.status}): ${JSON.stringify(body.errors ?? body)}`)
  }
  return body as T
}

export function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new SquareConfigError(`${name} is not configured`)
  return value
}
