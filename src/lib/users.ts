import { createClient } from '@supabase/supabase-js'
import type { Role } from './auth'

export interface UserRecord {
  username: string
  passwordHash: string
  role: Role
}

// ---------------------------------------------------------------------------
// User repository.
//
// Backed by Supabase/Postgres when configured; otherwise falls back to an
// env-seeded in-memory store so the boilerplate still demos with no external
// services (same fail-open philosophy as the Redis rate limiter).
// ---------------------------------------------------------------------------

const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// Env-seeded fallback users: JSON array of { username, passwordHash, role }.
// Generate hashes with: npm run hash-password -- <password>
// Example: DEMO_USERS='[{"username":"admin","passwordHash":"...","role":"admin"}]'
function fallbackUsers(): UserRecord[] {
  const raw = process.env.DEMO_USERS
  if (raw) {
    try {
      return JSON.parse(raw) as UserRecord[]
    } catch {
      // fall through to the built-in demo
    }
  }

  // Built-in demo user (password: admin123). In production, remove this and
  // set DEMO_USERS, or configure Supabase.
  return [
    {
      username: 'admin',
      passwordHash:
        'pbkdf2$210000$M10lPa1EV50LrDWXU35ENw==$O5EGKNQykU1QQKSyPvJohdb92q/neAc+nZg1Oe4++YtLUOo0uB03zthtc2Ly5HB384yL+oJyg4BsSeWdApTYMQ==',
      role: 'admin',
    },
  ]
}

async function getSupabaseUser(
  username: string,
): Promise<UserRecord | null> {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const client = createClient(url, key)
  const { data, error } = await client
    .from('users')
    .select('username, password_hash, role')
    .eq('username', username)
    .single()

  if (error || !data) return null
  return {
    username: data.username,
    passwordHash: data.password_hash,
    role: data.role as Role,
  }
}

export async function getUserByUsername(
  username: string,
): Promise<UserRecord | null> {
  if (isSupabaseConfigured) {
    try {
      return await getSupabaseUser(username)
    } catch (e) {
      console.error('Supabase user lookup error:', e)
    }
  }
  const user = fallbackUsers().find((u) => u.username === username)
  return user ?? null
}
