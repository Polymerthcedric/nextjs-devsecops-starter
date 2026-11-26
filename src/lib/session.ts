// Session helpers use Web Crypto and do not depend on a database or
// Node-specific crypto modules, so they can be reused in route and proxy code.

export type Role = 'admin' | 'user'

export interface Session {
  sub: string
  username: string
  role: Role
  iat: number
  exp: number
}

export const COOKIE_NAME = 'session'

// ---- HS256 signing helpers using the Web Crypto API ----

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (process.env.NODE_ENV === 'production') {
    if (!secret || new TextEncoder().encode(secret).byteLength < 32) {
      throw new Error('SESSION_SECRET must be at least 32 bytes in production')
    }
    return secret
  }
  return secret || 'dev-insecure-session-secret-change-me'
}

function base64UrlEncode(input: ArrayBuffer | Uint8Array | string): string {
  const bytes =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : input instanceof ArrayBuffer
        ? new Uint8Array(input)
        : input
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(input: string): Uint8Array<ArrayBuffer> {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function getSecretKey(): Promise<CryptoKey> {
  const secret = getSessionSecret()
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
  return key
}

export async function signSession(session: Session): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64UrlEncode(JSON.stringify(session))
  const unsigned = `${header}.${payload}`
  const key = await getSecretKey()
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(unsigned),
  )
  return `${unsigned}.${base64UrlEncode(signature)}`
}

export async function verifySession(token: string): Promise<Session | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, payload, signature] = parts

  const key = await getSecretKey()
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlDecode(signature),
    new TextEncoder().encode(`${header}.${payload}`),
  )
  if (!valid) return null

  try {
    const session = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payload)),
    ) as Session
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return session
  } catch {
    return null
  }
}
