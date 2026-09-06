'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        setLoading(false)
        return
      }
      router.push(next && next.startsWith('/') ? next : '/admin')
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-foreground outline-none focus:border-neutral-500 dark:border-neutral-700"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-foreground outline-none focus:border-neutral-500 dark:border-neutral-700"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-neutral-900 px-4 py-2 font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
