import { describe, it, expect, beforeEach, vi } from 'vitest'
import { signSession, verifySession, type Session } from './session'

function makeSession(overrides: Partial<Session> = {}): Session {
  const now = Math.floor(Date.now() / 1000)
  return {
    sub: 'admin',
    username: 'admin',
    role: 'admin',
    iat: now,
    exp: now + 3600,
    ...overrides,
  }
}

beforeEach(() => {
  process.env.SESSION_SECRET = 'test-secret'
})

describe('signSession / verifySession', () => {
  it('requires a strong secret in production', async () => {
    try {
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubEnv('SESSION_SECRET', '')
      await expect(signSession(makeSession())).rejects.toThrow(
        'SESSION_SECRET must be at least 32 bytes in production',
      )

      vi.stubEnv('SESSION_SECRET', 'short')
      await expect(signSession(makeSession())).rejects.toThrow(
        'SESSION_SECRET must be at least 32 bytes in production',
      )

      vi.stubEnv('SESSION_SECRET', 's'.repeat(32))
      await expect(signSession(makeSession())).resolves.toMatch(
        /^[^.]+\.[^.]+\.[^.]+$/,
      )
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('round-trips a valid session', async () => {
    const session = makeSession()
    const token = await signSession(session)
    const decoded = await verifySession(token)
    expect(decoded).not.toBeNull()
    expect(decoded?.username).toBe('admin')
    expect(decoded?.role).toBe('admin')
  })

  it('rejects a tampered payload', async () => {
    const token = await signSession(makeSession())
    const [header, , signature] = token.split('.')
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...makeSession(), username: 'hacker' }),
    ).toString('base64url')
    const tampered = `${header}.${tamperedPayload}.${signature}`
    expect(await verifySession(tampered)).toBeNull()
  })

  it('rejects a token with a wrong secret', async () => {
    const token = await signSession(makeSession())
    process.env.SESSION_SECRET = 'different-secret'
    expect(await verifySession(token)).toBeNull()
  })

  it('rejects an expired session', async () => {
    const token = await signSession(makeSession({ exp: Math.floor(Date.now() / 1000) - 1 }))
    expect(await verifySession(token)).toBeNull()
  })

  it('rejects a malformed token', async () => {
    expect(await verifySession('not-a-jwt')).toBeNull()
  })
})
