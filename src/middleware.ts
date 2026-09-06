import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ratelimit } from '@/lib/ratelimit'

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  
  // -------------------------------------------------------
  // 1. THE BOUNCER (Stop the Infrastructure Death Spiral)
  // -------------------------------------------------------
  // We check Redis rate limits BEFORE any expensive DB queries, 
  // rendering cycles, or auth verifications. Compute stops here.
  if (process.env.NODE_ENV === 'production') {
    try {
      const { success } = await ratelimit.limit(ip)
      if (!success) {
        return new NextResponse('Too Many Requests: Rate limit exceeded', { status: 429 })
      }
    } catch (e) {
      // Fail open if Redis is completely down, but log aggressively
      console.error('Redis Rate Limiting Error:', e)
    }
  }

  // -------------------------------------------------------
  // 2. ROLE-BASED ACCESS CONTROL (RBAC)
  // -------------------------------------------------------
  const { pathname } = request.nextUrl
  
  // Example: Protected Admin Routes
  if (pathname.startsWith('/admin')) {
    // In a production app, this parses an encrypted JWT from a cookie.
    // For this boilerplate, we look for a mocked session token.
    const sessionToken = request.cookies.get('session_token')?.value
    const userRole = sessionToken === 'valid-admin-token' ? 'ADMIN' : 'GUEST'
    
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // If both checks pass, forward the request to the Next.js router.
  return NextResponse.next()
}

// Only run middleware on paths that matter (exclude static assets).
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
