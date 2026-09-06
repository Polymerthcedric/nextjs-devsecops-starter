import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

function makeRequest(headers: Record<string, string>): Request {
  return new Request('https://example.com/api/auth/login', { method: 'POST', headers })
}

describe('isSameOrigin (strict mode)', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('APP_HOST', 'example.com')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts a matching Origin', async () => {
    const { isSameOrigin } = await import('./csrf')
    expect(isSameOrigin(makeRequest({ Origin: 'https://example.com' }))).toBe(true)
  })

  it('rejects a foreign Origin', async () => {
    const { isSameOrigin } = await import('./csrf')
    expect(isSameOrigin(makeRequest({ Origin: 'https://evil.example.net' }))).toBe(false)
  })

  it('rejects a missing Origin and Referer', async () => {
    const { isSameOrigin } = await import('./csrf')
    expect(isSameOrigin(makeRequest({}))).toBe(false)
  })

  it('rejects a "null" (opaque) Origin', async () => {
    const { isSameOrigin } = await import('./csrf')
    expect(isSameOrigin(makeRequest({ Origin: 'null' }))).toBe(false)
  })

  it('falls back to Referer when Origin is absent', async () => {
    const { isSameOrigin } = await import('./csrf')
    expect(isSameOrigin(makeRequest({ Referer: 'https://example.com/login' }))).toBe(true)
  })
})