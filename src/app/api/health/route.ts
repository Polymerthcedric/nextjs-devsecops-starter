import { NextResponse } from 'next/server'

// Public liveness/readiness probe for uptime monitors (UptimeRobot, Pingdom…)
// and container orchestrators. Never auth-gated. Cheap to run, no DB needed.
export const runtime = 'nodejs'

export async function GET() {
  // Readiness: are the optional services configured? Never expose secrets —
  // just booleans so ops can tell "misconfigured" from "down".
  const services = {
    redis: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    database: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    sessionSecret: Boolean(process.env.SESSION_SECRET),
    appHost: Boolean(process.env.APP_HOST),
    paddle: Boolean(process.env.PADDLE_API_KEY && process.env.PADDLE_PRICE_ID),
  }

  return NextResponse.json(
    {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services,
    },
    { status: 200 },
  )
}