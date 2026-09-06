import type { Metadata } from 'next'
import Link from 'next/link'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = {
  title: 'Create account | DevSecOps Starter',
  description: 'Create an account on the DevSecOps starter',
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-sm">
        <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
          DevSecOps starter
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mt-2 mb-2">
          Create account
        </h1>
        <p className="mb-8 text-neutral-600 dark:text-neutral-400">
          Password hashed with PBKDF2 before it touches the store.
        </p>
        <RegisterForm />
        <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-accent hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
