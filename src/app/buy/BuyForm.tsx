'use client'

import { useState } from 'react'

export default function BuyForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'busy' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'busy') return
    setStatus('busy')
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setStatus('error')
        setError(data?.error ?? 'Something went wrong.')
        return
      }
      if (data?.url) window.location.assign(data.url)
    } catch {
      setStatus('error')
      setError('Could not reach checkout.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8">
      <label
        htmlFor="email"
        className="block font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent"
      >
        Where do we deliver it?
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="mt-2 w-full rounded-xl border border-[#dfd9cc] bg-[#fbfaf7] px-4 py-3 text-[#17130d] outline-none transition placeholder:text-neutral-400 focus:border-accent dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
      />
      <button
        type="submit"
        disabled={status === 'busy'}
        className="mt-4 w-full rounded-xl bg-[#17130d] px-5 py-3 font-semibold text-[#fbfaf7] transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#f3c086] dark:text-[#17130d] dark:hover:bg-white"
      >
        {status === 'busy' ? 'Opening Stripe…' : 'Buy the starter → Stripe checkout'}
      </button>
      {status === 'error' && (
        <p className="mt-3 text-center font-mono text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {!configured && status === 'idle' && (
        <p className="mt-3 text-center font-mono text-xs text-neutral-500">
          Stripe isn&apos;t wired to this deployment yet — this button will
          explain once you touch it.
        </p>
      )}
    </form>
  )
}