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
// env-seeded in-memory store for local development.
// ---------------------------------------------------------------------------

const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
)

function isUserRecord(value: unknown): value is UserRecord {
  if (!value || typeof value !== 'object') return false
  const user = value as Record<string, unknown>
  return (
    typeof user.username === 'string' &&
    typeof user.passwordHash === 'string' &&
    (user.role === 'admin' || user.role === 'user')
  )
}

function configuredDemoUsers(): UserRecord[] | null {
  const raw = process.env.DEMO_USERS
  if (!raw) return null

  try {
    const users: unknown = JSON.parse(raw)
    if (Array.isArray(users) && users.every(isUserRecord)) return users
  } catch {
    return null
  }
  return null
}

// Generate the development password hash with: npm run hash-password -- <password>
function fallbackUsers(): UserRecord[] {
  if (process.env.NODE_ENV === 'production') return []
  const users = configuredDemoUsers()
  if (users) return users

  // Built-in demo user (password: admin123) is limited to local development.
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
  return configuredDemoUsers()?.find((user) => user.username === username) ?? null
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
    if (process.env.NODE_ENV !== 'production') {
      const demoUser = configuredDemoUser(username)
      if (demoUser) return demoUser
    }

    try {
      return await getSupabaseUser(username)
    } catch (e) {
      console.error('Supabase user lookup error:', e)
      return null
    }
  }
  if (process.env.NODE_ENV === 'production') return null
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
  if (process.env.NODE_ENV === 'production') {
    console.error('User creation unavailable: Supabase is not configured')
    return 'error'
  }

  const store = getFallbackStore()
  if (store.some((u) => u.username === user.username)) return 'exists'
  store.push(user)
  return 'created'
}
