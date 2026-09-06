import { NextResponse } from 'next/server'
import { createLicense } from '@/lib/licenses'
import {
  getPaddleCustomerEmail,
  verifyPaddleWebhookSignature,
} from '@/lib/paddle'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) {
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

  let event: { event_type?: string; data?: Record<string, unknown> }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (event.event_type === 'transaction.completed') {
    const txn = event.data as
      | { id?: string; customer_id?: string; customer?: { email?: string | null } }
      | undefined

    if (txn?.id) {
      const email =
        txn.customer?.email ??
        (txn.customer_id ? await getPaddleCustomerEmail(txn.customer_id) : null)
      await createLicense({
        email: email ?? 'buyer@paddle.com',
        sessionId: txn.id,
      })
    }
  }

  // Always ack. Paddle retries non-2xx, and license minting is idempotent.
  return NextResponse.json({ received: true })
}