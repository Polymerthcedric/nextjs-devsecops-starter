import { createHmac, timingSafeEqual } from 'node:crypto'

// ---------------------------------------------------------------------------
// Paddle Billing client.
//
// Flow: the server creates a transaction (POST /transactions, automatic
// collection), the buyer pays on a Paddle-hosted checkout (overlay or
// redirect), and a `transaction.completed` webhook mints the license. The
// success page mints idempotently too, so the buyer can retrieve the key from the success page.
//
// A default payment link must be set + approved under
// Paddle > Checkout > Checkout settings > Default payment link before any
// "pass a transaction to checkout" flow works (hosted or Paddle.js).
// ---------------------------------------------------------------------------

const PADDLE_API_BASE =
  process.env.PADDLE_ENV === 'sandbox'
    ? 'https://sandbox-api.paddle.com'
    : 'https://api.paddle.com'

export const getPaddleEnvironment = () =>
  process.env.PADDLE_ENV === 'sandbox' ? 'sandbox' : 'live'

export function isPaddleConfigured() {
  return Boolean(process.env.PADDLE_API_KEY && process.env.PADDLE_PRICE_ID)
}

async function paddleFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) {
    throw new Error('PADDLE_API_KEY is not set')
  }
  const res = await fetch(`${PADDLE_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`Paddle API ${res.status}: ${await res.text()}`)
  }
  return await res.json()
}

// Creates a checkout-ready transaction (draft, automatic collection). The
// buyer never pays until the hosted checkout runs, so this is free. The email
// is prefilled client-side at checkout (Paddle.js `customer.email`); the
// server never needs it, Paddle holds it against the transaction.
export async function createPaddleTransaction() {
  const priceId = process.env.PADDLE_PRICE_ID
  if (!priceId) {
    throw new Error('PADDLE_PRICE_ID is not set')
  }

  const json = await paddleFetch('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      collection_mode: 'automatic',
    }),
  })

  const transaction = json?.data
  if (!transaction?.id) {
    throw new Error('Paddle did not return a transaction')
  }

  return {
    transactionId: transaction.id as string,
    checkoutUrl: (transaction.checkout?.url as string | null) ?? null,
  }
}

// Price info for the /buy page. Falls back to null when Paddle is off so the
// page still renders with a $99 stub.
export async function getPaddlePrice() {
  const priceId = process.env.PADDLE_PRICE_ID
  if (!isPaddleConfigured() || !priceId) return null
  try {
    const json = await paddleFetch(`/prices/${priceId}`)
    const price = json?.data
    if (!price?.unit_price?.amount) return null
    return {
      name: (price.name as string | undefined) ?? 'Lifetime license',
      amount: Number(price.unit_price.amount) / 100,
      currency: (price.unit_price.currency_code as string | undefined) ?? 'USD',
    }
  } catch {
    return null
  }
}

// Looks up a transaction so the success page can confirm payment before
// minting. Returns the bare fields the license claim needs.
export async function getPaddleTransaction(transactionId: string) {
  const json = await paddleFetch(`/transactions/${transactionId}`)
  const txn = json?.data
  if (!txn) return null
  return {
    status: txn.status as string,
    customerId: (txn.customer_id as string | undefined) ?? null,
    email: (txn.customer?.email as string | undefined) ?? null,
  }
}

export async function getPaddleCustomerEmail(customerId: string) {
  const json = await paddleFetch(`/customers/${customerId}`)
  return (json?.data?.email as string | undefined) ?? null
}

// Paddle signs webhooks with a `Paddle-Signature: ts=<unix>;h1=<hex>` header.
// The payload is HMAC-SHA256 of `ts:<raw body>` with the webhook secret.
export function verifyPaddleWebhookSignature(
  rawBody: string,
  header: string,
  secret: string,
  nowMs = Date.now(),
): boolean {
  if (!header || !secret) return false

  const match = /ts=(\d+);h1=([0-9a-f]+)/.exec(header)
  if (!match) return false

  const ts = Number(match[1])
  const h1 = match[2]
  if (!Number.isFinite(ts)) return false

  // Reject replays older than 5 minutes.
  if (Math.abs(nowMs / 1000 - ts) > 300) return false

  const expected = createHmac('sha256', secret)
    .update(`${ts}:${rawBody}`)
    .digest('hex')

  const a = Buffer.from(h1, 'hex')
  const b = Buffer.from(expected, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}