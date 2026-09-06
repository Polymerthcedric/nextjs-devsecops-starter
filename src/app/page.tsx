export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          DevSecOps Starter
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Hyper-constrained. Secure by default. No bloat.
        </p>
        <div className="mt-8 flex gap-4">
          <a
            href="/login"
            className="rounded-md bg-neutral-900 px-4 py-2 text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            Sign in
          </a>
          <a
            href="/admin"
            className="rounded-md border border-neutral-300 px-4 py-2 transition hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-400"
          >
            Admin dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
