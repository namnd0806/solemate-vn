import { NextResponse } from 'next/server'
import { validatePromo } from '@/lib/db/promotions'

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json()
    if (!code?.trim()) {
      return NextResponse.json({ ok: false, message: 'Vui lòng nhập mã giảm giá.' }, { status: 400 })
    }
    const result = await validatePromo(code.trim(), Number(subtotal) || 0)
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('POST /api/promotions/validate error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
