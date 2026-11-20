import { getPaddlePrice } from '@/lib/paddle'
import BuyForm from './BuyForm'

export const dynamic = 'force-dynamic'

async function getPrice() {
  const price = await getPaddlePrice()
  if (!price) return null
  return price
}

const REPO_URL = 'https://github.com/Polymerthcedric/nextjs-devsecops-starter'

const includes = [
  'Sandbox client token with the sandbox environment set before checkout',
  'Server-created transaction and in-page Paddle overlay',
  'Signed transaction.completed webhook with replay protection',
  'Idempotent demo license and license-checked download route',
  'Upstash rate limiting, proxy role checks, and PBKDF2 auth',
  'CI pipeline, Vercel deploy workflow, Docker deployment, and unit tests',
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
        Paddle Sandbox demo
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl">
        Test the checkout,
        <br />
        end to end.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
        This is a free sandbox demo: no real card, no charge, no tax or payout
        setup. Use the test card to run the flow and watch the webhook mint a
        demo license key. Every line of code is on GitHub.
      </p>

      <section className="mt-10 rounded-2xl border border-[#dfd9cc] bg-white p-8 sm:p-10 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Sandbox license</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Demo checkout · nothing is charged
            </p>
          </div>
          <p className="font-mono text-3xl font-semibold text-accent">
            {priceLabel ?? 'Test mode'}
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
          <h2 className="font-semibold">What this demo shows</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            Clone the public source, add your own sandbox credentials, and
            trace a checkout from the client token to the transaction, webhook,
            and demo download. Hosting and service accounts are yours.
          </p>
        </article>
        <article className="rounded-2xl border border-[#dfd9cc] p-6 dark:border-neutral-800">
          <h2 className="font-semibold">What it doesn&apos;t include</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            No live payments, subscriptions, or real license enforcement. This
            is a username/password auth baseline with a one-time sandbox
            checkout. OAuth, MFA, password reset, and admin user management are
            out of scope.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-[#dfd9cc] p-6 dark:border-neutral-800">
        <h3 className="font-semibold">Want to see the checks first?</h3>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Try the live demo. Sign in as{' '}
          <code className="font-mono">admin / admin123</code> and watch
          /admin admit and bounce people at the request proxy. The demo
          account is for evaluation only; set up your own credentials for a
          deployment.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <a
            href="/admin"
            className="rounded-xl border border-[#dfd9cc] px-5 py-2.5 font-semibold text-[#17130d] transition hover:border-accent hover:text-accent dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-[#f3c086]"
          >
            Try the demo
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[#dfd9cc] px-5 py-2.5 font-semibold text-[#17130d] transition hover:border-accent hover:text-accent dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-[#f3c086]"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <p className="mt-8 text-center font-mono text-xs text-neutral-500 dark:text-neutral-500">
        Paddle Sandbox handles checkout · the test webhook mints a demo license
      </p>
    </main>
  )
}
