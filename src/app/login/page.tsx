import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign in | DevSecOps Starter',
  description: 'Sign in to the DevSecOps starter',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Sign in</h1>
        <p className="mb-8 text-neutral-600 dark:text-neutral-400">
          Secure by default. Role-gated behind the edge.
        </p>
        <LoginFormBoundary />
        <div className="mt-8 rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Demo credentials
          </p>
          <p className="mt-1">
            Admin: <code>admin</code> / <code>admin123</code>
          </p>
          <p>
            User: <code>user</code> / <code>user123</code>
          </p>
        </div>
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
