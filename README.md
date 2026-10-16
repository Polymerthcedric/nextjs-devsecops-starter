# DevSecOps Starter

A Next.js starter with rate limiting, role-based route checks, and
username/password authentication. It gives you a working base to adapt to
your app.

Small dependency footprint. Clear examples. Your app stays yours.

## What you get

- **Request proxy** (`src/proxy.ts`) that checks requests before protected
  pages render
- **Rate limiting** via Upstash Redis sliding window — 10 requests per 10
  seconds per IP. Over-limit requests receive HTTP 429.
- **RBAC sessions** — signed, httpOnly JWT cookies checked by the request proxy.
  `/admin` is gated to the `admin` role; everyone else gets bounced to `/login`.
- **PBKDF2 password hashing** — Web Crypto, 210,000 iterations, and a
  per-user salt.
- **DB-backed users** — Supabase/Postgres when configured, env-seeded fallback
  when not. The repository uses the Supabase JS client with direct table
  queries; it does not include Prisma or Drizzle, profile management, or an
  admin user-management interface. The in-memory fallback is for local demos.
- **Strict security headers** (CSP, HSTS, X-Frame-Options, Permissions-Policy)
  locked into `next.config.ts`.
- **Origin-based CSRF defense** (`src/lib/csrf.ts`) on every auth POST — strict
  in production, rejects foreign origins even behind SameSite cookies.
- **CI + tests** — `.github/workflows/ci.yml` gates lint → tests → build on
  every push; Vitest covers password hashing, JWT sessions, the user repo, and
  the CSRF check.

## Stack

Next.js 16 · React 19 · Tailwind CSS 4 · TypeScript · Upstash Redis ·
Supabase (optional) · Web Crypto (no auth deps)

## Auth

| Endpoint | Description |
| --- | --- |
| `POST /api/auth/register` | Create a user (PBKDF2-hashed), auto-login |
| `POST /api/auth/login` | Verify credentials, set `session` cookie |
| `POST /api/auth/logout` | Clear the `session` cookie |
| `/login` | Login page, honors `?next=` redirect |
| `/register` | Sign-up page |
| `/dashboard` | Members area (any authenticated role) |
| `/admin` | Admin dashboard (requires `admin` role) |

**Sessions** are HS256-signed JWTs; the password hash and user store are
Pluggable behind `src/lib/users.ts`. New signups always start with the
least-privileged `user` role.

**Route guards** in the request proxy (`src/proxy.ts`) and server helpers:
`requireRole('admin')` for `/admin`, `requireAuth()` for `/dashboard`.

This is username/password authentication only. OAuth, MFA, password reset,
email verification, and account settings are not implemented. The `/admin`
page is a protected status/demo page, not a user-management console. Replace
the demo account and review the auth model before using it with real users.

## Getting started

```bash
npm install
cp .env.example .env.local   # set SESSION_SECRET (and optionally Supabase)
# In the shipped deliverable the template lives at scripts/env.example.sample.
npm run dev
```

Open http://localhost:3000, try `/admin` logged out, then sign in as
`admin / admin123` — or create your own account via `/register`.

> Rate limiting only engages when `NODE_ENV === 'production'`, so local dev
> needs no live Upstash credentials. To exercise it locally:
> `npm run build && NODE_ENV=production npm run start`.

## Env vars

| Variable | Purpose |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiter backend |
| `SESSION_SECRET` | HMAC secret (JWT signing) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Postgres user store (optional) |
| `DEMO_USERS` | Optional demo users as JSON. Works with or without Supabase and takes precedence over database users with the same username. |
| `APP_HOST` / `ALLOWED_ORIGINS` | CSRF origin validation (production) |
| `NEXT_PUBLIC_APP_URL` | Public base URL for SEO (metadata, robots.txt, sitemap) |
| `PADDLE_ENV` / `PADDLE_API_KEY` / `PADDLE_PRICE_ID` | Paddle Billing (Merchant of Record) — checkout + license sales |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Public Paddle.js client token for the in-page checkout overlay |
| `PADDLE_WEBHOOK_SECRET` | Paddle `transaction.completed` webhook signing secret |

## Operations

`GET /api/health` returns a cheap, unauthenticated liveness/readiness probe for
uptime monitors:

```json
{"status":"ok","uptime":12.3,"timestamp":"...","services":{"redis":true,"database":false,"sessionSecret":true,"appHost":true}}
```

Each `services` field is a boolean "is configured" flag — no secrets, no
upstream calls, so the probe never crashes on a misconfigured local env.

## Selling the starter (Paddle)

`/buy` sells this boilerplate itself. Paddle acts as Merchant of Record —
it bills buyers, handles global sales tax, and pays you out. To switch it on:

1. Set the env vars above (sandbox first: `PADDLE_ENV=sandbox`, sandbox API key).
2. Under **Checkout > Checkout settings > Default payment link**, add and get
   an **approved** payment link — required before hosted checkout works.
3. Under **Developer Tools > Event delivery**, create a webhook destination
   for `https://your-domain/api/paddle/webhook`, subscribe to
   `transaction.completed`, and copy the secret into `PADDLE_WEBHOOK_SECRET`.
4. Create a one-time price in the catalog; put its id in `PADDLE_PRICE_ID`.

Buyers pay on an in-page Paddle.js checkout (or the hosted URL), the success
page shows their `DS-XXXXX-XXXXX-XXXXX` license key, and `/api/health` reports
`"paddle": <configured>` for monitoring.

This is a one-time license sale for this starter. The webhook handles
`transaction.completed` and idempotently issues a license; it does not manage
recurring subscriptions or buyer billing portals.

## Deploying

**Vercel** (recommended):

1. Import the repo into Vercel (framework: Next.js). Copy `.env` values into
   the project's Environment Variables — `SESSION_SECRET` and `APP_HOST` are
   required in production; `UPSTASH_REDIS_REST_*` and `SUPABASE_*` are on by
   default. Set `NEXT_PUBLIC_APP_URL` to your canonical domain for SEO.
2. Optional: add `"git": { "deploymentEnabled": false }` to `vercel.json` if
   you deploy via GitHub Actions instead of Vercel's native integration.

**GitHub Actions** — `.github/workflows/deploy.yml` builds once on the runner
and uploads the prebuilt output (`vercel build` + `--prebuilt`), so nothing
builds twice. It deploys previews on PRs and production on `main`. Configure
`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` as repo secrets; until
`VERCEL_PROJECT_ID` is set the job is skipped so forks still pass CI.

**Docker self-host** — build with `docker build -t devsecops-starter .` and run
with your production environment variables, for example:

```sh
docker run --rm -p 3000:3000 \
  -e SESSION_SECRET='replace-with-a-random-secret' \
  -e APP_HOST='your-domain.example' \
  -e UPSTASH_REDIS_REST_URL='https://...' \
  -e UPSTASH_REDIS_REST_TOKEN='...' \
  devsecops-starter
```

Use a TLS-terminating reverse proxy in front. Add Supabase and Paddle variables
when those features are enabled. Never bake secrets into the image.

**Node self-host** — `npm run build && npm run start`, with the same production
environment variables and TLS termination.

Rate limiting is not a hard spend cap or DDoS protection. Every matched
request still reaches the app proxy and Redis; Redis errors fail open. Hosting,
bandwidth, and Redis pricing depend on provider plans and traffic. Set provider
budgets/alerts and upstream traffic controls, and load-test your own workload.

## Seeding users

Generate a password hash and add users to Supabase or `DEMO_USERS`:

```bash
npm run hash-password -- 'a-strong-password'
```

`supabase/schema.sql` has the `users` table DDL and an admin seed row.

For a hosted demo that uses Supabase, set `DEMO_USERS` in the hosting
provider's production environment to a JSON array containing the demo account
and its generated `passwordHash`. Redeploy after changing environment
variables. The built-in `admin / admin123` account is available only for local
development when Supabase and `DEMO_USERS` are both unset.

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm run start` — production
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests (password hashing, JWT sessions, user repo)
- `npm run hash-password` — generate a PBKDF2 hash

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`:
lint → tests → production build, with `npm ci` for reproducible installs.
The workflow injects a throwaway, non-secret `SESSION_SECRET` so the build's
fail-open paths resolve without real credentials in CI.

---

This is the commercial boilerplate. The free, public face is the
[JSON to Zustand generator](https://github.com/Polymerthcedric/json-zustand-generator).
Contact to license this starter for your team.
