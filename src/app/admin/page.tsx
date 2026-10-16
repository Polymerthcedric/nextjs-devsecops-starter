import { requireRole } from '@/lib/auth'
import LogoutButton from './LogoutButton'

export default async function AdminPage() {
  const session = await requireRole('admin')

  const shield = [
    {
      label: 'Rate limit',
      value: '10 / 10s',
      note: 'sliding window per IP',
      status: 'up',
    },
    {
      label: 'Session',
      value: '24 h',
      note: 'signed HS256 JWT',
      status: 'up',
    },
    {
      label: 'Password hash',
      value: 'PBKDF2 210k',
      note: 'hashed with PBKDF2',
      status: 'up',
    },
    {
      label: 'Access',
      value: 'ADMIN',
      note: 'checked in the request proxy',
      status: 'up',
    },
  ]

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dfd9cc] pb-6 dark:border-neutral-800">
          <div>
            <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
              DevSecOps starter
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Admin dashboard
            </h1>
            <p className="mt-1 text-[15px] text-neutral-600 dark:text-neutral-400">
              Signed in as <span className="font-semibold">{session.username}</span>. The
              request proxy checked your session before this page loaded.
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shield.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-[#dfd9cc] bg-[#fbfaf7] p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
                  {card.label}
                </p>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-2 font-mono text-xl font-semibold text-[#17130d] dark:text-neutral-100">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {card.note}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-[#dfd9cc] p-6 lg:col-span-2">
            <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
              The shield
            </p>
            <h2 className="mt-2 text-lg font-semibold">Protected before React renders</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <code className="font-mono text-accent">rate limit</code> — Upstash Redis
                checks request counts before the route runs.
              </li>
              <li>
                <code className="font-mono text-accent">roles</code> — the proxy checks the
                signed session cookie before allowing this page to load.
              </li>
              <li>
                <code className="font-mono text-accent">headers</code> — CSP, HSTS and
                Permissions-Policy locked down in <code>next.config.ts</code>.
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-[#dfd9cc] p-6 bg-[#17130d] text-[#fbfaf7] dark:bg-neutral-950">
            <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-[#f3c086]">
              Session
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-300">User</dt>
                <dd className="font-mono font-semibold">{session.username}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-300">Role</dt>
                <dd className="font-mono font-semibold text-[#f3c086]">{session.role}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-300">Subject</dt>
                <dd className="font-mono">{session.sub}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-300">Expires</dt>
                <dd className="font-mono">
                  {new Date(session.exp * 1000).toLocaleString()}
                </dd>
              </div>
            </dl>
          </article>
        </section>

        <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
          This page requires a valid session with the{" "}
          <code className="font-mono text-accent">admin</code> role, the proxy bounces
          you to <code className="font-mono text-accent">/login</code> before a single
          component renders.
        </p>
      </div>
    </main>
  )
}
