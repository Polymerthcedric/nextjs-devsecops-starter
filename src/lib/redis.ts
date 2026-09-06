import { Redis } from '@upstash/redis'

// We wrap the instantiation to prevent build-time crashes if env vars are missing.
// It will only fail at runtime if the limits are actually hit without config.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://mock-url.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'mock-token',
})
