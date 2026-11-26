import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('NODE_ENV', 'test')
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.DEMO_USERS
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('user repository (development fallback store)', () => {
  it('finds the built-in demo admin', async () => {
    const { getUserByUsername } = await import('./users')
    const user = await getUserByUsername('admin')
    expect(user).not.toBeNull()
    expect(user?.role).toBe('admin')
    expect(user?.passwordHash).toMatch(/^pbkdf2\$/)
    const { verifyPassword } = await import('./password')
    expect(await verifyPassword('admin123', user!.passwordHash)).toBe(true)
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

  it('does not enable the built-in admin or in-memory registration in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { createUser, getUserByUsername } = await import('./users')

    await expect(getUserByUsername('admin')).resolves.toBeNull()
    await expect(
      createUser({
        username: 'new-user',
        passwordHash: 'pbkdf2$210000$abc$xyz',
        role: 'user',
      }),
    ).resolves.toBe('error')
  })

  it('does not use configured demo users in production without Supabase', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    process.env.DEMO_USERS = JSON.stringify([
      { username: 'configured', passwordHash: 'test-hash', role: 'user' },
    ])
    const { createUser, getUserByUsername } = await import('./users')

    await expect(getUserByUsername('configured')).resolves.toBeNull()
    await expect(getUserByUsername('admin')).resolves.toBeNull()
    await expect(
      createUser({
        username: 'new-user',
        passwordHash: 'pbkdf2$210000$abc$xyz',
        role: 'user',
      }),
    ).resolves.toBe('error')
  })

  it('does not enable the built-in admin for invalid production demo configuration', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    process.env.DEMO_USERS = '{invalid'
    const { getUserByUsername } = await import('./users')

    await expect(getUserByUsername('admin')).resolves.toBeNull()
  })
})
