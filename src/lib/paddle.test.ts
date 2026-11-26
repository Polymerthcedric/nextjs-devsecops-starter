import { createHmac } from 'node:crypto'
import { afterEach, describe, it, expect, vi } from 'vitest'
import {
  createPaddleTransaction,
  getPaddleEnvironment,
  verifyPaddleWebhookSignature,
} from './paddle'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

const SECRET = 'pdl_ntfset_testsecret_testsecret'

function sign(body: string, ts: number, secret = SECRET) {
  const h1 = createHmac('sha256', secret).update(`${ts}:${body}`).digest('hex')
  return `ts=${ts};h1=${h1}`
}

describe('verifyPaddleWebhookSignature', () => {
  const now = Date.now()
  const body = JSON.stringify({ event_type: 'transaction.completed' })

  it('accepts a freshly signed body', () => {
    const header = sign(body, Math.floor(now / 1000))
    expect(verifyPaddleWebhookSignature(body, header, SECRET, now)).toBe(true)
  })

  it('rejects a tampered body', () => {
    const header = sign(body, Math.floor(now / 1000))
    expect(
      verifyPaddleWebhookSignature('{"event_type":"transaction.canceled"}', header, SECRET, now),
    ).toBe(false)
  })

  it('rejects a signature made with the wrong secret', () => {
    const header = sign(body, Math.floor(now / 1000), 'wrong-secret')
    expect(verifyPaddleWebhookSignature(body, header, SECRET, now)).toBe(false)
  })

  it('rejects a stale timestamp (replay)', () => {
    const old = Math.floor((now - 600_000) / 1000)
    const header = sign(body, old)
    expect(verifyPaddleWebhookSignature(body, header, SECRET, now)).toBe(false)
  })

  it('rejects a malformed header', () => {
    expect(verifyPaddleWebhookSignature(body, 'garbage', SECRET, now)).toBe(false)
    expect(verifyPaddleWebhookSignature(body, '', SECRET, now)).toBe(false)
  })

  it('rejects when no secret configured', () => {
    const header = sign(body, Math.floor(now / 1000))
    expect(verifyPaddleWebhookSignature(body, header, '', now)).toBe(false)
  })
})

describe('Paddle environment selection', () => {
  function mockTransactionRequest() {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 'txn_test' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('PADDLE_API_KEY', 'test_api_key')
    vi.stubEnv('PADDLE_PRICE_ID', 'pri_test')
    return fetchMock
  }

  it('uses sandbox when live is not explicitly configured', async () => {
    vi.stubEnv('PADDLE_ENV', '')
    const fetchMock = mockTransactionRequest()

    await createPaddleTransaction()

    expect(getPaddleEnvironment()).toBe('sandbox')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://sandbox-api.paddle.com/transactions',
      expect.any(Object),
    )
  })

  it('uses live only when explicitly configured', async () => {
    vi.stubEnv('PADDLE_ENV', 'live')
    const fetchMock = mockTransactionRequest()

    await createPaddleTransaction()

    expect(getPaddleEnvironment()).toBe('live')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.paddle.com/transactions',
      expect.any(Object),
    )
  })
})