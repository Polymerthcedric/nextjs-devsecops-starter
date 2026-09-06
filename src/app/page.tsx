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
            className="rounded-lg bg-[#17130d] px-4 py-2 font-semibold text-[#fbfaf7] transition hover:bg-accent dark:bg-[#f3c086] dark:text-[#17130d] dark:hover:bg-white"
          >
            Sign in
          </a>
          <a
            href="/admin"
            className="rounded-lg border border-[#dfd9cc] px-4 py-2 font-semibold text-[#17130d] transition hover:border-accent hover:text-accent dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-[#f3c086]"
          >
            Admin dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
