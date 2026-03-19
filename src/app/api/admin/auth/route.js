import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request) {
  const { password } = await request.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const cookieStore = await cookies()

  // Set a simple session cookie
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   60 * 60 * 8, // 8 hours
    path:     '/',
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request) {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  return NextResponse.json({ success: true })
}