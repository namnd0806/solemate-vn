import { NextResponse } from 'next/server'
import { registerUser } from '@/lib/db/users'
import { signJwt } from '@/lib/auth'
import { validateEmail } from '@/lib/utils'

export async function POST(request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, password } = body

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ ok: false, message: 'Họ tên không được để trống.' }, { status: 400 })
    }
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ ok: false, message: 'Email không hợp lệ.' }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ ok: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' }, { status: 400 })
    }

    const result = await registerUser({ firstName, lastName, email, phone, password })

    if (!result.ok) {
      const status = result.message === 'Email đã được đăng ký.' ? 409 : 400
      return NextResponse.json({ ok: false, message: result.message }, { status })
    }

    // Issue JWT cookie
    const token = await signJwt(
      { sub: result.data.id, role: result.data.role, email: result.data.email },
      '7d'
    )

    const response = NextResponse.json({ ok: true, data: result.data }, { status: 201 })
    response.cookies.set('smvn_customer_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return response
  } catch (err) {
    console.error('POST /api/auth/register error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
