import { NextResponse } from 'next/server'
import { COOKIE_NAME, signSession, verifyCredentials } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const username = body?.username?.trim() ?? ''
  const password = body?.password ?? ''

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 },
    )
  }

  const session = await verifyCredentials(username, password)
  if (!session) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 },
    )
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
