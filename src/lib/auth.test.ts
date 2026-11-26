import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUserByUsername: vi.fn(),
  verifyPassword: vi.fn(),
}))

vi.mock('./users', () => ({
  getUserByUsername: mocks.getUserByUsername,
}))

vi.mock('./password', () => ({
  verifyPassword: mocks.verifyPassword,
}))

import { verifyCredentials } from './auth'

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production')
  mocks.getUserByUsername.mockResolvedValue({
    username: 'admin',
    passwordHash: 'test-hash',
    role: 'admin',
  })
  mocks.verifyPassword.mockResolvedValue(true)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('production credential verification', () => {
  it('rejects the public local demo credentials even when an admin exists', async () => {
    await expect(verifyCredentials('admin', 'admin123')).resolves.toBeNull()
    expect(mocks.getUserByUsername).not.toHaveBeenCalled()
  })

  it('allows a configured admin to authenticate with a non-demo password', async () => {
    const session = await verifyCredentials('admin', 'a-strong-password')

    expect(session?.role).toBe('admin')
    expect(mocks.verifyPassword).toHaveBeenCalledWith(
      'a-strong-password',
      'test-hash',
    )
  })
})
