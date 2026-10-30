import { NextResponse } from 'next/server'
import { createLicense } from '@/lib/licenses'
import {
  getPaddleCustomerEmail,
  verifyPaddleWebhookSignature,
} from '@/lib/paddle'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  const priceId = process.env.PADDLE_PRICE_ID
  if (!secret || !priceId) {
    return NextResponse.json(
      { error: 'Paddle webhook not configured' },
      { status: 503 },
    )
  }

  const raw = await request.text()
  const signature = request.headers.get('Paddle-Signature') ?? ''

  if (!verifyPaddleWebhookSignature(raw, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: {
    event_type?: string
    data?: {
      id?: string
      items?: Array<{ price_id?: string }>
      customer_id?: string
      customer?: { email?: string | null }
    }
  }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (event.event_type === 'transaction.completed') {
    const txn = event.data
    // This endpoint can receive events for other Paddle products. Only issue
    // this starter's license for a completed transaction containing its price.
    if (txn?.items?.some((item) => item.price_id === priceId)) {
      if (!txn.id) {
        return NextResponse.json({ error: 'Missing transaction id' }, { status: 400 })
      }

      try {
        const email =
          txn.customer?.email?.trim() ||
          (txn.customer_id ? await getPaddleCustomerEmail(txn.customer_id) : null)
        if (!email?.trim()) throw new Error('Paddle transaction has no customer email')

        const license = await createLicense({ email: email.trim(), sessionId: txn.id })
        if (!license) throw new Error('License store unavailable or license could not be saved')
      } catch (error) {
        console.error('Paddle license fulfillment failed:', error)
        // Paddle retries non-2xx webhook deliveries, allowing fulfillment to
        // recover after a temporary Paddle API or database failure.
        return NextResponse.json({ error: 'License fulfillment failed' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
