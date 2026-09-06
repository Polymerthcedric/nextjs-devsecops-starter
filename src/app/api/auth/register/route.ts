import { NextResponse } from 'next/server'
import { COOKIE_NAME, signSession } from '@/lib/auth'
import { hashPassword } from '@/lib/password'
import { createUser } from '@/lib/users'
import { isSameOrigin } from '@/lib/csrf'

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const username = body?.username?.trim() ?? ''
  const password = body?.password ?? ''

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 },
    )
  }

  if (username.length < 3) {
    return NextResponse.json(
      { error: 'Username must be at least 3 characters' },
      { status: 400 },
    )
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 },
    )
  }

  const passwordHash = await hashPassword(password)
  // New signups always start with the least-privileged role.
  const result = await createUser({ username, passwordHash, role: 'user' })

  if (result === 'exists') {
    return NextResponse.json(
      { error: 'Username is already taken' },
      { status: 409 },
    )
  }
  if (result === 'error') {
    return NextResponse.json(
      { error: 'Could not create user. Try again later.' },
      { status: 500 },
    )
  }

  const session = {
    sub: username,
    username,
    role: 'user' as const,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  }
  const token = await signSession(session)

  const response = NextResponse.json({ ok: true, role: session.role })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return response
}
