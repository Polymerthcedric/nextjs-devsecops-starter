import { NextResponse } from 'next/server'
import { isSameOrigin } from '@/lib/csrf'
import { getCheckoutUrls, getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const email = body?.email?.trim() as string | undefined
  const priceId = process.env.STRIPE_PRICE_ID
  const stripe = getStripe()

  if (!stripe || !priceId) {
    return NextResponse.json(
      { error: 'Stripe is not configured yet' },
      { status: 503 },
    )
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const { successUrl, cancelUrl } = getCheckoutUrls()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email || undefined,
    // Never send their plaintext email/stripe ids to license generation until
    // we confirm the sale via the session — the success page does that.
    metadata: { source: 'devsecops-starter' },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return NextResponse.json({ url: session.url })
}