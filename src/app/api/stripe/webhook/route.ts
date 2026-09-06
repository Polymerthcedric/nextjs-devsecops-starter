import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createLicense } from '@/lib/licenses'

export const runtime = 'nodejs'

async function readRawBody(request: Request): Promise<string> {
  return await request.text()
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !secret) {
    return NextResponse.json(
      { error: 'Stripe webhook not configured' },
      { status: 503 },
    )
  }

  const raw = await readRawBody(request)
  const signature = request.headers.get('stripe-signature') ?? ''

  let event
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { id: string; customer_details?: { email?: string | null }; metadata?: Record<string, string> }
    if (session.metadata?.skipLicense !== 'true') {
      await createLicense({
        email: session.customer_details?.email ?? 'buyer@example.com',
        sessionId: session.id,
      })
    }
  }

  return NextResponse.json({ received: true })
}