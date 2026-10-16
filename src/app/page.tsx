import { COOKIE_NAME, verifySession } from '@/lib/session'
import { cookies } from 'next/headers'
import PaddleRedirect from './PaddleRedirect'

const features = [
  {
    title: 'Request proxy',
    desc: 'Checks sessions and protected paths before the app renders a page.',
    code: 'src/proxy.ts',
  },
  {
    title: 'Rate limiting',
    desc: 'Upstash sliding window: 10 requests per 10 seconds per IP. Over-limit requests get a 429 response.',
    code: 'src/lib/ratelimit.ts',
  },
  {
    title: 'RBAC sessions',
    desc: 'Signed, httpOnly HS256 session cookies. The admin and member routes check the user role.',
    code: 'src/lib/session.ts',
  },
  {
    title: 'PBKDF2 auth',
    desc: 'Web Crypto PBKDF2 hashing with 210,000 iterations and a per-user salt.',
    code: 'src/lib/password.ts',
  },
  {
    title: 'Pluggable users',
    desc: 'Raw Supabase client queries when configured, with an in-memory demo fallback. No ORM or profile management yet.',
    code: 'src/lib/users.ts',
  },
  {
    title: 'Hardened headers',
    desc: 'CSP, HSTS, X-Frame-Options and Permissions-Policy locked into next.config.ts.',
    code: 'next.config.ts',
  },
]

export default async function Home() {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  const session = token ? await verifySession(token) : null

  const primaryHref = session ? '/dashboard' : '/login'
  const primaryLabel = session ? `Continue as ${session.username}` : 'Sign in'
  const secondaryHref = '/register'
  const secondaryLabel = 'Create account'

  return (
    <main className="min-h-screen">
      <PaddleRedirect />
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16 sm:pt-32 sm:px-10">
        <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
          DevSecOps starter
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl">
          A practical start
          <br />
          for your next app.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
          A Next.js starter with rate limiting, role-based route checks, and
          password authentication already connected. Use it as a starting
          point, then adapt it to your app.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href={primaryHref}
            className="rounded-xl bg-[#17130d] px-5 py-2.5 font-semibold text-[#fbfaf7] transition hover:bg-accent dark:bg-[#f3c086] dark:text-[#17130d] dark:hover:bg-white"
          >
            {primaryLabel}
          </a>
          <a
            href={secondaryHref}
            className="rounded-xl border border-[#dfd9cc] px-5 py-2.5 font-semibold text-[#17130d] transition hover:border-accent hover:text-accent dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-[#f3c086]"
          >
            {secondaryLabel}
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#dfd9cc] bg-[#fbfaf7] dark:border-neutral-800 dark:bg-neutral-950/40">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
          <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
            Ships with
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Common setup, already wired together
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[#dfd9cc] bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                  {f.desc}
                </p>
                <code className="mt-3 inline-block font-mono text-xs text-accent">
                  {f.code}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost defense */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
          Cost defense
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Reject excess requests before app routes do their work
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          The proxy checks a per-IP Upstash sliding window before auth checks,
          page rendering, or database queries. This can reduce downstream work;
          it does not cap hosting, Redis, or network charges, and the Redis
          check itself runs on each matched request.
        </p>
        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <div className="rounded-xl border border-[#dfd9cc] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <strong>Incoming request</strong><br />
            <span className="text-neutral-500">Browser, bot, or API client</span>
          </div>
          <span className="text-center font-mono text-accent" aria-hidden="true">→</span>
          <div className="rounded-xl border border-[#dfd9cc] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <strong>Next.js proxy + Upstash</strong><br />
            <span className="text-neutral-500">10 requests / 10 seconds / IP</span>
          </div>
          <span className="text-center font-mono text-accent" aria-hidden="true">→</span>
          <div className="rounded-xl border border-[#dfd9cc] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <strong>Allowed request</strong><br />
            <span className="text-neutral-500">Route, then database if needed</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
          Over-limit requests receive HTTP 429. If Redis errors, this starter
          fails open; configure provider-level traffic and spend limits too.
        </p>
      </section>

      {/* Value comparison */}
      <section className="border-y border-[#dfd9cc] bg-[#fbfaf7] dark:border-neutral-800 dark:bg-neutral-950/40">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
          <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
            Skip the repeated setup
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            A working baseline you can adapt
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-[#dfd9cc] bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-[#dfd9cc] dark:border-neutral-800">
                <tr><th className="p-4">Milestone</th><th className="p-4">Build yourself</th><th className="p-4">Starter includes</th></tr>
              </thead>
              <tbody className="divide-y divide-[#dfd9cc] dark:divide-neutral-800">
                <tr><th className="p-4 font-medium">Request checks</th><td className="p-4 text-neutral-600 dark:text-neutral-400">Choose and wire up a proxy</td><td className="p-4">Working <code>src/proxy.ts</code></td></tr>
                <tr><th className="p-4 font-medium">Rate limiting</th><td className="p-4 text-neutral-600 dark:text-neutral-400">Pick a store, set policy, handle errors</td><td className="p-4">Upstash sliding window + fail-open behavior</td></tr>
                <tr><th className="p-4 font-medium">Auth foundation</th><td className="p-4 text-neutral-600 dark:text-neutral-400">Implement sessions, password hashing, route checks</td><td className="p-4">PBKDF2, HS256 sessions, login and registration</td></tr>
                <tr><th className="p-4 font-medium">Headers and CI</th><td className="p-4 text-neutral-600 dark:text-neutral-400">Configure, review, and maintain</td><td className="p-4">Security headers and GitHub Actions workflows</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
            Time varies by product and experience. This starter does not include social login, MFA, ORM models, user administration, or subscription management.
          </p>
        </div>
      </section>

      {/* Auth cta */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <div className="rounded-2xl border border-[#dfd9cc] p-8 sm:p-10">
          <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
            Try the auth flow
          </p>
          <h2 className="mt-2 max-w-lg text-2xl font-semibold tracking-tight">
            Try the protected routes
          </h2>
          <p className="mt-4 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
            Sign in with the demo account or create a local demo user. The
            admin page is a status example; it does not manage users.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="/admin"
              className="rounded-xl bg-[#17130d] px-5 py-2.5 font-semibold text-[#fbfaf7] transition hover:bg-accent dark:bg-[#f3c086] dark:text-[#17130d] dark:hover:bg-white"
            >
              Try /admin
            </a>
            <a
              href="/register"
              className="rounded-xl border border-[#dfd9cc] px-5 py-2.5 font-semibold text-[#17130d] transition hover:border-accent hover:text-accent dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-[#f3c086]"
            >
              Create account
            </a>
          </div>
        </div>
        <p className="mt-8 text-center font-mono text-xs text-neutral-500 dark:text-neutral-500">
          Requests checked before protected routes · Sessions verified per request
        </p>
      </section>

      {/* Selling cta */}
      <section className="border-t border-[#dfd9cc] dark:border-neutral-800">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:px-10">
          <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
            Get the code
          </p>
          <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Start with the foundation. Build your app on top.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600 dark:text-neutral-400">
            Get the starter source, its tests, and deployment examples with a
            one-time purchase. Lifetime updates are included.
          </p>
          <div className="mt-8">
            <a
              href="/buy"
              className="inline-block rounded-xl bg-[#17130d] px-6 py-3 font-semibold text-[#fbfaf7] transition hover:bg-accent dark:bg-[#f3c086] dark:text-[#17130d] dark:hover:bg-white"
            >
              Buy the starter
            </a>
            <a
              href="/admin"
              className="ml-4 inline-block rounded-xl border border-[#dfd9cc] px-6 py-3 font-semibold text-[#17130d] transition hover:border-accent hover:text-accent dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-[#f3c086]"
            >
              Try it first
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
