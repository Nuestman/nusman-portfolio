/** Client portal URL. Production: portal.nusman.dev. Local: portal hostname on Desk port. */
export function portalAppUrl(): string {
  const fromEnv = import.meta.env.VITE_PORTAL_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  if (import.meta.env.PROD) {
    return 'https://portal.nusman.dev'
  }
  return 'http://portal.localhost:3000'
}
