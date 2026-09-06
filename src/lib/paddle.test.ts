import { createHmac } from 'node:crypto'
import { describe, it, expect } from 'vitest'
import { verifyPaddleWebhookSignature } from './paddle'

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