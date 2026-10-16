import { getPaddlePrice } from '@/lib/paddle'
import BuyForm from './BuyForm'

export const dynamic = 'force-dynamic'

async function getPrice() {
  const price = await getPaddlePrice()
  if (!price) return null
  return price
}

const includes = [
  'Complete starter source — the code behind the live demo',
  'Edge rate limiting + RBAC sessions (Upstash Redis)',
  'PBKDF2 auth + Supabase/Postgres user store',
  'CI pipeline, Vercel deploy workflow, Docker deployment, and unit tests',
  'Security headers, CSRF defense, /health probe, SEO files',
  'One-time purchase with lifetime updates',
]

export default async function BuyPage() {
  const price = await getPrice()
  const configured = Boolean(price)
  const priceLabel = price
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.currency,
      }).format(price.amount)
    : null

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
        Get the code
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl">
        The last auth stack
        <br />
        you&apos;ll hand-roll.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
        One payment. Everything in this repo — the edge proxy, the rate
        limiter, PBKDF2 auth, the CI/deploy pipeline, the license to use it on
        a real project. Lifetime updates are included.
      </p>

      <section className="mt-10 rounded-2xl border border-[#dfd9cc] bg-white p-8 sm:p-10 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Lifetime license</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              One project · updates included
            </p>
          </div>
          <p className="font-mono text-3xl font-semibold text-accent">
            {priceLabel ?? '$99'}
          </p>
        </div>

        <ul className="mt-6 space-y-2.5">
          {includes.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 font-mono text-accent">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <BuyForm configured={configured} />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-[#dfd9cc] p-6 dark:border-neutral-800">
          <h2 className="font-semibold">A useful starting point</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            Clone the included source, configure your service credentials, and
            adapt the auth and route examples to your product. You get the code
            and deployment recipes; hosting and service accounts are yours.
          </p>
        </article>
        <article className="rounded-2xl border border-[#dfd9cc] p-6 dark:border-neutral-800">
          <h2 className="font-semibold">Know what you are buying</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            This is a username/password auth baseline with one-time Paddle
            license checkout. OAuth, MFA, password reset, profile management,
            admin user management, and recurring subscriptions are not
            included.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-[#dfd9cc] p-6 dark:border-neutral-800">
        <h3 className="font-semibold">Wondering if it&apos;s worth it?</h3>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Try the live demo first. Sign in as{' '}
          <code className="font-mono">admin / admin123</code> and watch
          /admin admit and bounce people at the request proxy. The demo
          account is for evaluation only; set up your own credentials for a
          deployment.
        </p>
        <a
          href="/admin"
          className="mt-4 inline-block rounded-xl border border-[#dfd9cc] px-5 py-2.5 font-semibold text-[#17130d] transition hover:border-accent hover:text-accent dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-[#f3c086]"
        >
          Try the demo
        </a>
      </section>

      <p className="mt-8 text-center font-mono text-xs text-neutral-500 dark:text-neutral-500">
        Payment handled by Paddle · license key delivered instantly · the code
        is the product
      </p>
    </main>
  )
}
