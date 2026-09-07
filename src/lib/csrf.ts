// Origin-based CSRF defense-in-depth.
//
// SameSite=Lax on the session cookie already blocks cross-site POSTs in
// modern browsers, but we additionally reject state-changing requests whose
// Origin/Referer doesn't match our own host. Belt and suspenders — the
// DevSecOps way.
//
// Accepts an optional list of extra allowed origins (e.g. a staging domain).

const ALLOWED_ORIGINS = new Set<string>()
for (const extra of (process.env.ALLOWED_ORIGINS ?? '').split(',')) {
  if (extra.trim()) ALLOWED_ORIGINS.add(extra.trim())
}

// An Origin is same-origin when its host matches the host the request was
// served from (the Host header) or the canonical APP_HOST. Comparing against
// Host — not a single configured domain — means any hostname pointing at this
// deployment (custom domain, vercel.app URL, preview deploy) is accepted
// without env churn. An explicit ALLOWED_ORIGINS entry (full origin, e.g. a
// staging domain) always wins.
function originAllowed(origin: string | null, requestHost: string | null): boolean {
  if (!origin) return false
  if (origin === 'null') return false // sandboxed/opaque origins

  if (ALLOWED_ORIGINS.has(origin)) return true

  try {
    const { host } = new URL(origin)
    return host === requestHost || host === process.env.APP_HOST
  } catch {
    return false
  }
}

// Returns true if the request is same-origin (no CSRF risk).
export function isSameOrigin(request: Request): boolean {
  if (process.env.NODE_ENV !== 'production') {
    // Local dev sends Origin "null"/"http://localhost:3000"; be permissive so
    // the demo runs smoothly. Production enforces the check strictly.
    return true
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Origin is authoritative when present; fall back to Referer.
  const source = origin ?? referer
  return originAllowed(source, request.headers.get('host'))
}