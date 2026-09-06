import { requireAuth } from '@/lib/auth'
import LogoutButton from '../admin/LogoutButton'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await requireAuth()
  const isAdmin = session.role === 'admin'

  const perks = [
    'Members-only content served entirely on the free tier',
    'Edge-enforced session: no flash of protected data to guests',
    'Upstash rate limiter standing at the door of every request',
  ]

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dfd9cc] pb-6 dark:border-neutral-800">
          <div>
            <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
              DevSecOps starter
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome, {session.username}
            </h1>
            <p className="mt-1 text-[15px] text-neutral-600 dark:text-neutral-400">
              Your session was verified at the edge. Membership territory.
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-8 rounded-2xl border border-[#dfd9cc] bg-[#fbfaf7] p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
            Member perks
          </p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            {perks.map((perk) => (
              <li key={perk} className="flex gap-2">
                <span className="text-accent">•</span>
                {perk}
              </li>
            ))}
          </ul>
        </section>

        {isAdmin && (
          <p className="mt-6 text-sm">
            You have the <code className="font-mono text-accent">admin</code> role —{' '}
            <Link
              href="/admin"
              className="font-semibold text-accent hover:underline"
            >
              head to the admin dashboard
            </Link>
            .
          </p>
        )}
      </div>
    </main>
  )
}
