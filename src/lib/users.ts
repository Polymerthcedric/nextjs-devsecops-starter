import { createClient } from '@supabase/supabase-js'
import type { Role } from './session'

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

function configuredDemoUser(username: string): UserRecord | null {
  const raw = process.env.DEMO_USERS
  if (!raw) return null

  try {
    const users = JSON.parse(raw) as UserRecord[]
    if (!Array.isArray(users)) return null
    return users.find((user) => user.username === username) ?? null
  } catch {
    return null
  }
}

let fallbackStore: UserRecord[] | null = null

function getFallbackStore(): UserRecord[] {
  if (!fallbackStore) {
    fallbackStore = [...fallbackUsers()]
  }
  return fallbackStore
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

async function getSupabaseUser(
  username: string,
): Promise<UserRecord | null> {
  const { data, error } = await getSupabaseClient()
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

async function createSupabaseUser(
  user: UserRecord,
): Promise<'created' | 'exists'> {
  const { error } = await getSupabaseClient()
    .from('users')
    .insert({
      username: user.username,
      password_hash: user.passwordHash,
      role: user.role,
    })

  if (error) {
    // unique_violation = username already taken
    if (error.code === '23505') return 'exists'
    throw error
  }
  return 'created'
}

// ---- Repository API ----

export async function getUserByUsername(
  username: string,
): Promise<UserRecord | null> {
  if (isSupabaseConfigured) {
    // Explicit demo users may coexist with the database, but the built-in
    // local-only admin is never enabled just because a database lookup fails.
    const demoUser = configuredDemoUser(username)
    if (demoUser) return demoUser

    try {
      return await getSupabaseUser(username)
    } catch (e) {
      console.error('Supabase user lookup error:', e)
      return null
    }
  }
  return getFallbackStore().find((u) => u.username === username) ?? null
}

export async function usernameExists(username: string): Promise<boolean> {
  const existing = await getUserByUsername(username)
  return existing !== null
}

// Creates a user. Returns 'created' on success, 'exists' if the username is
// already taken, or 'error' if the store is unavailable.
export async function createUser(
  user: UserRecord,
): Promise<'created' | 'exists' | 'error'> {
  if (isSupabaseConfigured) {
    try {
      return await createSupabaseUser(user)
    } catch (e) {
      console.error('Supabase user create error:', e)
      return 'error'
    }
  }

  const store = getFallbackStore()
  if (store.some((u) => u.username === user.username)) return 'exists'
  store.push(user)
  return 'created'
}
