import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

// Create a sliding window rate limiter: 10 requests per 10 seconds per IP.
// Apply a request limit before continuing to the protected route.
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: false,
})
