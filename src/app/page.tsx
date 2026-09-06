import { COOKIE_NAME, verifySession } from '@/lib/session'
import { cookies } from 'next/headers'

const features = [
  {
    title: 'Edge proxy',
    desc: 'Every request passes the bouncer before React renders. Guests never see a flash of protected content.',
    code: 'src/proxy.ts',
  },
  {
    title: 'Rate limiting',
    desc: 'Upstash Redis sliding window — 10 req / 10 s / IP. The infrastructure death spiral stops at the door.',
    code: 'src/lib/ratelimit.ts',
  },
  {
    title: 'RBAC sessions',
    desc: 'Signed, httpOnly HS256 JWTs verified at the edge. /admin is admin-only; /dashboard for members.',
    code: 'src/lib/session.ts',
  },
  {
    title: 'PBKDF2 auth',
    desc: 'Password hashing via Web Crypto — 210k iterations, per-user salt, zero native dependencies.',
    code: 'src/lib/password.ts',
  },
  {
    title: 'Pluggable users',
    desc: 'Supabase/Postgres when configured, env-seeded fallback when not. Same fail-open spirit as Redis.',
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
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16 sm:pt-32 sm:px-10">
        <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
          DevSecOps starter
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl">
          Secure by default.
          <br />
          Zero bloat.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
          A hyper-constrained Next.js boilerplate with rate limiting, edge RBAC
          and PBKDF2 auth baked in — so a viral spike can&apos;t bankrupt you and
          guests never see a byte they shouldn&apos;t.
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
            Everything the boring, expensive setup would take weeks of
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

      {/* Auth cta */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <div className="rounded-2xl border border-[#dfd9cc] p-8 sm:p-10">
          <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
            Try the auth flow
          </p>
          <h2 className="mt-2 max-w-lg text-2xl font-semibold tracking-tight">
            Watch /admin bounce a guest, then let them in like a bouncer.
          </h2>
          <p className="mt-4 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
            Demo credentials: <code className="font-mono">admin</code> /{' '}
            <code className="font-mono">admin123</code> — or create your own
            account in a click. It&apos;s the same code a buyer would get.
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
          Rate limited at the edge · Sessions verified per request · A template, not a toy
        </p>
      </section>
    </main>
  )
}