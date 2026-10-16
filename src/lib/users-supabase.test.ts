import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'user not found' } }),
        }),
      }),
    }),
  }),
}))

beforeEach(() => {
  vi.resetModules()
  process.env.SUPABASE_URL = 'https://db.example.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-key'
  delete process.env.DEMO_USERS
})

describe('demo accounts with Supabase configured', () => {
  it('uses explicitly configured demo users when the database has no matching row', async () => {
    process.env.DEMO_USERS = JSON.stringify([
      { username: 'admin', passwordHash: 'test-hash', role: 'admin' },
    ])

    const { getUserByUsername } = await import('./users')
    await expect(getUserByUsername('admin')).resolves.toEqual({
      username: 'admin',
      passwordHash: 'test-hash',
      role: 'admin',
    })
  })

  it('does not enable the built-in local demo account in database mode', async () => {
    const { getUserByUsername } = await import('./users')
    await expect(getUserByUsername('admin')).resolves.toBeNull()
  })
})
