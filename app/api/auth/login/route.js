import { NextResponse } from 'next/server'
import { loginUser } from '@/lib/db/users'
import { signJwt } from '@/lib/auth'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: 'Email hoặc mật khẩu không đúng.' }, { status: 401 })
    }

    const result = await loginUser(email, password)

    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 401 })
    }

    const token = await signJwt(
      { sub: result.data.id, role: result.data.role, email: result.data.email },
      '7d'
    )

    const response = NextResponse.json({ ok: true, data: result.data })
    response.cookies.set('smvn_customer_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return response
  } catch (err) {
    console.error('POST /api/auth/login error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
