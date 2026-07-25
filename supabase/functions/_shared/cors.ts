// Every edge function called directly from the browser (via supabase.functions.invoke)
// needs to handle the preflight OPTIONS request and echo these headers back on every
// response, or the browser blocks the real request before it ever reaches the function.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
