# DevSecOps Starter

A hyper-constrained, secure-by-default [Next.js](https://nextjs.org) starter kit.
Built to be sold as a zero-marginal-cost digital asset: write it once, license it
many times.

## What's inside

- **Edge middleware** (`src/middleware.ts`) that runs before any component renders
- **Rate limiting** (`src/lib/ratelimit.ts`) via Upstash Redis sliding window —
  10 requests / 10s / IP. The bouncer that stops the infrastructure death spiral
  before a single DB query.
- **Role-based access control (RBAC)** — signed, httpOnly JWT sessions verified
  at the edge. `/admin` is gated to the `admin` role.
- **Strict security headers** (`next.config.ts`): CSP, HSTS, X-Frame-Options,
  Permissions-Policy, and more.
- **Pure Tailwind, zero bloat.** No UI framework. No Vercel analytics.

## Authentication

Sessions are signed with **HS256 via the Web Crypto API** — zero heavy
dependencies, runs on the Edge runtime in the middleware.

| Endpoint | Description |
| --- | --- |
| `POST /api/auth/login` | Validates credentials, sets `session` cookie |
| `POST /api/auth/logout` | Clears the `session` cookie |
| `/login` | Login page (redirects to `?next=` after success) |
| `/admin` | Protected dashboard (requires `admin` role) |

> **Demo credentials** (hard-coded in `src/lib/auth.ts`, replace before shipping):
> `admin / admin123` (role `admin`) and `user / user123` (role `user`).

## Getting started

```bash
npm install
cp .env.example .env.local   # set UPSTASH_REDIS_* and SESSION_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Try `/admin` while logged
out — you'll be bounced to `/login`. Sign in as `admin/admin123` to get through.

> **Note:** Rate limiting only engages when `NODE_ENV === 'production'`, so local
> dev doesn't need live Upstash credentials. For a local run that exercises the
> limiter, set `NODE_ENV=production` (e.g. `npm run build && NODE_ENV=production npm run start`).

## Env vars

| Variable | Purpose |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for the rate limiter |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `SESSION_SECRET` | HMAC secret for signing session JWTs |

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm run start` — production server
- `npm run lint` — ESLint
