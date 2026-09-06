import Stripe from 'stripe'

// Lazy singleton. Calling getStripe() without STRIPE_SECRET_KEY returns null
// so the build, the tests, and stray local runs never crash — only the
// checkout/webhook routes care that it's null.
let _stripe: Stripe | null | undefined

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (_stripe === undefined) {
    _stripe = new Stripe(key, {
      apiVersion: Stripe.API_VERSION,
    })
  }
  return _stripe
}

export function getCheckoutUrls() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return {
    successUrl: `${base}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${base}/buy`,
  }
}