import { NextResponse } from 'next/server'
import { lookupGuestOrder } from '@/lib/db/orders'

export async function POST(request) {
  try {
    const body = await request.json()
    const { orderId, phone } = body

    if (!orderId?.trim() || !phone?.trim()) {
      return NextResponse.json({ ok: false, message: 'Vui lòng nhập mã đơn hàng và số điện thoại.' }, { status: 400 })
    }

    const result = await lookupGuestOrder(orderId.trim(), phone.trim())
    if (!result.ok) return NextResponse.json(result, { status: 404 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('POST /api/orders/lookup error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
