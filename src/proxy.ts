import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ratelimit } from '@/lib/ratelimit'
import { COOKIE_NAME, verifySession } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '127.0.0.1'
  
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

  // Protected Admin Route: verify the signed, httpOnly session cookie.
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value
    let isAdmin = false

    if (token) {
      const session = await verifySession(token)
      isAdmin = session?.role === 'admin'
    }

    if (!isAdmin) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
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
