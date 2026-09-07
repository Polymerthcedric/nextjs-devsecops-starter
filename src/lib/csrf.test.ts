import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

function makeRequest(headers: Record<string, string>): Request {
  return new Request('https://example.com/api/auth/login', {
    method: 'POST',
    headers: { Host: 'example.com', ...headers },
  })
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

  it('accepts a custom-domain Origin that matches the request Host', async () => {
    const { isSameOrigin } = await import('./csrf')
    expect(
      isSameOrigin(
        makeRequest({ Host: 'starter.example.dev', Origin: 'https://starter.example.dev' }),
      ),
    ).toBe(true)
  })

  it('rejects an Origin matching neither Host nor APP_HOST', async () => {
    const { isSameOrigin } = await import('./csrf')
    expect(
      isSameOrigin(
        makeRequest({ Host: 'starter.example.dev', Origin: 'https://attacker.example.net' }),
      ),
    ).toBe(false)
  })
})