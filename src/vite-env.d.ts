/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SQUARE_APPLICATION_ID: string
  readonly VITE_SQUARE_LOCATION_ID: string
  readonly VITE_SQUARE_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface SquareCardTokenizeResult {
  status: string
  token?: string
  errors?: { message: string }[]
}

interface SquareCard {
  attach: (selector: string) => Promise<void>
  tokenize: () => Promise<SquareCardTokenizeResult>
  destroy: () => Promise<void>
}

interface SquarePayments {
  card: () => Promise<SquareCard>
}

interface Window {
  Square?: {
    payments: (appId: string, locationId: string) => SquarePayments
  }
}
