import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign in | DevSecOps Starter',
  description: 'Sign in to the DevSecOps starter',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-sm">
        <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
          DevSecOps starter
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mt-2 mb-2">
          Sign in
        </h1>
        <p className="mb-8 text-neutral-600 dark:text-neutral-400">
          Sign in to the demo account or create a local demo user.
        </p>
        <LoginFormBoundary />
        <div className="mt-8 rounded-lg border border-dashed border-[#dfd9cc] p-4 text-sm text-neutral-500 dark:border-neutral-700">
          <p className="font-semibold text-[#17130d] dark:text-neutral-300">
            Demo credentials
          </p>
          <p className="mt-1">
            Admin: <code>admin</code> / <code>admin123</code>
          </p>
        </div>
        <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
          New here?{' '}
          <Link
            href="/register"
            className="font-semibold text-accent hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  )
}

function LoginFormBoundary() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Loading…
        </p>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
