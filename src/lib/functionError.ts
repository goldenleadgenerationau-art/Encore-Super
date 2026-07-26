// supabase-js throws a generic "Edge Function returned a non-2xx status
// code" for any failed invoke() call and leaves `data` null — the actual
// {error: "..."} body our functions send back is only reachable via
// error.context, an unread Response object. Without this, every specific
// error message (declined card, "no subscription found", etc.) gets
// replaced by that one generic line.
export async function extractFunctionError(error: unknown, fallback: string): Promise<string> {
  const context = (error as { context?: Response })?.context
  if (context && typeof context.json === 'function') {
    try {
      const body = await context.json()
      if (body?.error) return body.error as string
    } catch {
      // body wasn't JSON — fall through to the generic message below
    }
  }
  return (error as { message?: string })?.message ?? fallback
}
