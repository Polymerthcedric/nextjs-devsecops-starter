'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium transition hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-400"
    >
      Sign out
    </button>
  )
}
