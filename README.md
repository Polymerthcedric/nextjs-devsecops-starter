# DevSecOps Starter

A hyper-constrained Next.js starter with security baked in — rate limiting,
role-based access control, and a hard-edged edge middleware — so your app
survives a viral spike without burning a hole in your wallet.

Write it once, ship it everywhere. Secure by default. Zero bloat.

## What you get

- **Edge proxy** (`src/proxy.ts`) that runs before a single component renders
- **Rate limiting** via Upstash Redis sliding window — 10 req / 10 s / IP. The
  bouncer that stops the infrastructure death spiral before it reaches your DB.
- **RBAC sessions** — signed, httpOnly JWT cookies verified at the edge.
  `/admin` is gated to the `admin` role; everyone else gets bounced to `/login`.
- **PBKDF2 password hashing** — dependency-free Web Crypto, 210k iterations,
  per-user salt. No plaintext, no native bcrypt modules to fight.
- **DB-backed users** — Supabase/Postgres when configured, env-seeded fallback
  when not. Same fail-open philosophy as the Redis limiter: runs anywhere on a
  free tier with zero config.
- **Strict security headers** (CSP, HSTS, X-Frame-Options, Permissions-Policy)
  locked into `next.config.ts`.

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
| `/admin` | Admin dashboard (requires `admin` role) |

**Sessions** are HS256-signed JWTs; the password hash and user store are
Pluggable behind `src/lib/users.ts`. New signups always start with the
least-privileged `user` role.

## Getting started

```bash
npm install
cp .env.example .env.local   # set SESSION_SECRET (and optionally Supabase)
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
| `DEMO_USERS` | Env-seeded fallback users (JSON) |

## Seeding users

Generate a password hash and add users to Supabase or `DEMO_USERS`:

```bash
npm run hash-password -- 'a-strong-password'
```

`supabase/schema.sql` has the `users` table DDL and an admin seed row.

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm run start` — production
- `npm run lint` — ESLint
- `npm run hash-password` — generate a PBKDF2 hash

---

This is the commercial boilerplate. The free, public face is the
[JSON to Zustand generator](https://github.com/Polymerthcedric/json-zustand-generator).
Contact to license this starter for your team.
