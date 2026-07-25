// Square requires loading the Web Payments SDK fresh from their CDN for PCI
// compliance — it must not be bundled/self-hosted. This injects the correct
// script (sandbox vs production) once and resolves when it's ready.
let loadPromise: Promise<void> | null = null

export function loadSquareSdk(): Promise<void> {
  if (window.Square) return Promise.resolve()
  if (loadPromise) return loadPromise

  const env = import.meta.env.VITE_SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
  const src =
    env === 'production'
      ? 'https://web.squarecdn.com/v1/square.js'
      : 'https://sandbox.web.squarecdn.com/v1/square.js'

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load the Square payments SDK'))
    document.head.appendChild(script)
  })

  return loadPromise
}
