import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type Role = 'admin' | 'user'

export interface Session {
  sub: string
  username: string
  role: Role
  iat: number
  exp: number
}

export const COOKIE_NAME = 'session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 // 24 hours

// Minimal demo credential store. In a real SaaS you'd back this with a
// database (Supabase/Postgres) and bcrypt/argon2-hashed passwords. This
// stays dependency-free so the boilerplate runs anywhere, on any free tier.
const USERS = [
  {
    username: 'admin',
    // plaintext for demo only -- do NOT ship this pattern in production
    password: 'admin123',
    role: 'admin' as Role,
  },
  {
    username: 'user',
    password: 'user123',
    role: 'user' as Role,
  },
]

export function verifyCredentials(username: string, password: string): Session | null {
  const user = USERS.find(
    (u) => u.username === username && u.password === password,
  )
  if (!user) return null

  const now = Math.floor(Date.now() / 1000)
  return {
    sub: user.username,
    username: user.username,
    role: user.role,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  }
}

// ---- HS256 signing helpers using the Web Crypto API (Edge-compatible) ----

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
  const secret =
    process.env.SESSION_SECRET || 'dev-insecure-session-secret-change-me'
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

export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export async function requireRole(role: Role): Promise<Session> {
  const session = await getSession()
  if (!session || session.role !== role) {
    redirect('/login')
  }
  return session
}
