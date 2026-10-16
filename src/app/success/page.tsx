import Link from 'next/link'
import { createLicense, findLicenseBySession } from '@/lib/licenses'
import { getPaddleCustomerEmail, getPaddleTransaction, isPaddleConfigured } from '@/lib/paddle'

export const dynamic = 'force-dynamic'

type LicenseResult =
  | { done: true; license: { licenseKey: string; email: string; plan: string } }
  | { done: false; reason: 'paddle-not-configured' | 'invalid-session' | 'unpaid' | 'store-unavailable' }

async function getLicense(transactionId: string): Promise<LicenseResult> {
  if (!isPaddleConfigured()) {
    return { done: false as const, reason: 'paddle-not-configured' }
  }

  let txn
  try {
    txn = await getPaddleTransaction(transactionId)
  } catch {
    return { done: false as const, reason: 'invalid-session' }
  }

  if (!txn) {
    return { done: false as const, reason: 'invalid-session' }
  }

  if (txn.status !== 'completed') {
    return { done: false as const, reason: 'unpaid' }
  }

  const existing = await findLicenseBySession(transactionId)
  if (existing) {
    return { done: true as const, license: existing }
  }

  const email =
    txn.email ??
    (txn.customerId ? await getPaddleCustomerEmail(txn.customerId).catch(() => null) : null) ??
    'buyer@paddle.com'

  // Idempotent: session_id has a unique index, so a concurrent claim either
  // inserts once or finds the winner.
  const license = await createLicense({
    email,
    sessionId: transactionId,
  })

  if (!license) {
    return { done: false as const, reason: 'store-unavailable' }
  }
  return { done: true as const, license }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const transactionId = sp.transaction_id as string | undefined

  let state: LicenseResult | { done: false; reason: 'missing' }

  if (!transactionId) {
    state = { done: false, reason: 'missing' }
  } else {
    state = await getLicense(transactionId)
  }

  if (!state.done) {
    const copy = {
      missing: ['No transaction id supplied.', 'This page should open straight from checkout.'],
      'paddle-not-configured': ['Paddle is not configured.', "The owner hasn't wired up payments yet."],
      'invalid-session': ['That transaction is unknown.', 'Double-check the link.'],
      unpaid: ['Payment not completed.', 'You can keep this tab open while you finish paying.'],
      'store-unavailable': ['Could not reach the license vault.', 'Check back in a minute — it regenerates automatically.'],
    }[state.reason]!

    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
          License claim
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{copy[0]}</h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">{copy[1]}</p>
        <Link
          href="/buy"
          className="mt-8 rounded-xl bg-[#17130d] px-5 py-2.5 font-semibold text-[#fbfaf7] transition hover:bg-accent dark:bg-[#f3c086] dark:text-[#17130d]"
        >
          Back to the offer
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
        Payment received
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Here&apos;s your license key
      </h1>
      <p className="mt-3 max-w-md text-neutral-600 dark:text-neutral-400">
        Keep this somewhere safe — you&apos;ll need it to download your copy
        and future updates.
      </p>

      <code className="mt-8 rounded-2xl border border-[#dfd9cc] bg-white px-6 py-4 font-mono text-xl tracking-wider text-[#17130d] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
        {state.license.licenseKey}
      </code>

      <p className="mt-4 font-mono text-xs text-neutral-500">
        {state.license.email} · {state.license.plan} license
      </p>

      <p className="mt-10 max-w-md text-sm text-neutral-500 dark:text-neutral-500">
        Your key gates the private repo download. The tarball includes the full
        source, the database schema, and the deploy pipeline you just bought.
      </p>

      <a
        href={`/api/download?key=${encodeURIComponent(state.license.licenseKey)}`}
        className="mt-8 rounded-xl bg-[#17130d] px-5 py-2.5 font-semibold text-[#fbfaf7] transition hover:bg-accent dark:bg-[#f3c086] dark:text-[#17130d] dark:hover:bg-white"
      >
        Download the starter
      </a>

      <Link
        href="/"
        className="mt-4 rounded-xl border border-[#dfd9cc] px-5 py-2.5 font-semibold text-[#17130d] transition hover:border-accent hover:text-accent dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-[#f3c086]"
      >
        Back home
      </Link>
    </main>
  )
}
