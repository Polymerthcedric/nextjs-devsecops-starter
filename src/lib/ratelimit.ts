import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

// Create a sliding window rate limiter: 10 requests per 10 seconds per IP.
// This is the shield against the infrastructure death spiral.
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: false,
})
