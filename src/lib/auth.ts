import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserByUsername } from './users'
import { verifyPassword } from './password'
import {
  COOKIE_NAME,
  signSession,
  verifySession,
  type Role,
  type Session,
} from './session'

export type { Role, Session }
export { COOKIE_NAME, signSession, verifySession }

const SESSION_TTL_SECONDS = 60 * 60 * 24 // 24 hours

// Reads the user from the repository (Supabase or env-seeded fallback) and
// verifies their password against the stored PBKDF2 hash.
export async function verifyCredentials(
  username: string,
  password: string,
): Promise<Session | null> {
  const normalizedUsername = username.trim()
  if (
    process.env.NODE_ENV === 'production' &&
    normalizedUsername === 'admin' &&
    password === 'admin123'
  ) {
    return null
  }

  const user = await getUserByUsername(normalizedUsername)
  if (!user) return null

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return null

  const now = Math.floor(Date.now() / 1000)
  return {
    sub: user.username,
    username: user.username,
    role: user.role,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
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

// Requires any authenticated session, regardless of role.
export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}
