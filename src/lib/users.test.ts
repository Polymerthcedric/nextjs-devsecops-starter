import { describe, it, expect, beforeAll } from 'vitest'

// The repository reads SUPABASE_URL / DEMO_USERS at module scope, so we pin
// the environment before importing it.
beforeAll(() => {
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.DEMO_USERS
})

describe('user repository (fallback store)', () => {
  it('finds the built-in demo admin', async () => {
    const { getUserByUsername } = await import('./users')
    const user = await getUserByUsername('admin')
    expect(user).not.toBeNull()
    expect(user?.role).toBe('admin')
    expect(user?.passwordHash).toMatch(/^pbkdf2\$/)
  })

  it('returns null for an unknown username', async () => {
    const { getUserByUsername } = await import('./users')
    expect(await getUserByUsername('ghost')).toBeNull()
  })

  it('creates then resolves a new user via the fallback store', async () => {
    const { createUser, getUserByUsername } = await import('./users')
    // Unique username to stay isolated across test runs.
    const username = `t-user-${Date.now()}`
    expect(
      await createUser({
        username,
        passwordHash: 'pbkdf2$210000$abc$xyz',
        role: 'user',
      }),
    ).toBe('created')
    const created = await getUserByUsername(username)
    expect(created?.role).toBe('user')
  })

  it('reports a duplicate username as exists', async () => {
    const { createUser } = await import('./users')
    const username = `t-dup-${Date.now()}`
    await createUser({
      username,
      passwordHash: 'pbkdf2$210000$abc$xyz',
      role: 'user',
    })
    expect(
      await createUser({
        username,
        passwordHash: 'pbkdf2$210000$abc$xyz',
        role: 'user',
      }),
    ).toBe('exists')
  })
})