'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Paddle?: {
      Environment: {
        set: (environment: string) => void
      }
      Initialize: (config: Record<string, unknown>) => void
      Checkout: {
        open: (config: Record<string, unknown>) => Promise<void>
      }
    }
  }
}

const PADDLE_CLIENT_TOKEN =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? '' : ''
const PADDLE_ENV =
  typeof process !== 'undefined'
    ? PADDLE_CLIENT_TOKEN.startsWith('test_')
      ? 'sandbox'
      : PADDLE_CLIENT_TOKEN.startsWith('live_')
        ? 'live'
        : (process.env.NEXT_PUBLIC_PADDLE_ENV ?? 'live')
    : 'live'

function loadPaddleJs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Paddle) return resolve()
    const s = document.createElement('script')
    s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Could not load Paddle.js'))
    document.head.appendChild(s)
  })
}

export default function PaddleRedirect() {
  const [error, setError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const transactionId = params.get('_ptxn')
    if (!transactionId || !PADDLE_CLIENT_TOKEN) return

    let cancelled = false
    loadPaddleJs()
      .then(() => {
        window.Paddle?.Environment.set(PADDLE_ENV)
        window.Paddle?.Initialize({ token: PADDLE_CLIENT_TOKEN })
        return window.Paddle?.Checkout.open({ transactionId })
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <p className="mt-4 text-center font-mono text-xs text-neutral-500">
        Could not reach the checkout. Please try again.
      </p>
    )
  }

  return null
}