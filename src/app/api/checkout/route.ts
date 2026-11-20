import { NextResponse } from 'next/server'
import { isSameOrigin } from '@/lib/csrf'
import { createPaddleTransaction, isPaddleConfigured } from '@/lib/paddle'

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
  }

  if (!isPaddleConfigured()) {
    return NextResponse.json(
      { error: 'Paddle Sandbox is not configured yet' },
      { status: 503 },
    )
  }

  try {
    const { transactionId, checkoutUrl } = await createPaddleTransaction()
    return NextResponse.json({ transactionId, checkoutUrl })
  } catch (error) {
    console.error('Checkout create failed:', error)
    return NextResponse.json(
      { error: 'Could not start sandbox checkout. Is a default payment link approved?' },
      { status: 502 },
    )
  }
}