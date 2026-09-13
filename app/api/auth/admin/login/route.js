import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { signJwt } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: 'Email hoặc mật khẩu không đúng.' }, { status: 401 })
    }

    const supabase = getSupabaseServerClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role, first_name, last_name, email, phone, password_hash, active')
      .eq('email', email.toLowerCase().trim())
      .eq('role', 'ADMIN')
      .single()

    if (error || !user || !user.active) {
      return NextResponse.json({ ok: false, message: 'Email hoặc mật khẩu không đúng.' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ ok: false, message: 'Email hoặc mật khẩu không đúng.' }, { status: 401 })
    }

    const token = await signJwt(
      { sub: user.id, role: user.role, email: user.email },
      '24h'
    )

    const { password_hash: _, ...safeUser } = user
    const response = NextResponse.json({ ok: true, data: safeUser })
    response.cookies.set('smvn_admin_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/admin',
      maxAge: 60 * 60 * 24, // 24 hours
    })
    return response
  } catch (err) {
    console.error('POST /api/auth/admin/login error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
