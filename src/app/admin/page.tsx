import { requireRole } from '@/lib/auth'
import LogoutButton from './LogoutButton'

export default async function AdminPage() {
  const session = await requireRole('admin')

  const stats = [
    { label: 'Requests (10s)', value: '10 IP', note: 'Upstash sliding window' },
    { label: 'Session TTL', value: '24h', note: 'Signed HS256 JWT' },
    { label: 'Access', value: session.role, note: 'RBAC enforced at edge' },
  ]

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Logged in as <span className="font-medium">{session.username}</span> · role:{' '}
              <span className="font-mono text-amber-600 dark:text-amber-400">ADMIN</span>
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
            >
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {s.label}
              </p>
              <p className="mt-1 text-xl font-semibold">{s.value}</p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {s.note}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
          This page is protected at the edge. If your session expired or you lack
          the <code className="font-mono">admin</code> role, the middleware
          redirects you to <code className="font-mono">/login</code> before any
          component renders.
        </p>
      </div>
    </main>
  )
}
