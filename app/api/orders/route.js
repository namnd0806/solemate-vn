import { NextResponse } from 'next/server'
import { getOrders, createOrder } from '@/lib/db/orders'
import { getAdminFromRequest, getCustomerFromRequest } from '@/lib/auth'
import { validatePhone, generateOrderId } from '@/lib/utils'

const PAYMENT_METHODS = new Set(['COD', 'BANK', 'VISA'])
const SHIPPING_METHODS = new Set(['STANDARD', 'EXPRESS'])

export async function GET(request) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const result = await getOrders({
      status: searchParams.get('status') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      page: searchParams.get('page') || 1,
    })
    if (!result.ok) return NextResponse.json(result, { status: 500 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/orders error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { contact, items, shippingMethod, paymentMethod, paymentConfirmed, promoCode, note } = body

    // Validate contact fields
    if (!contact?.fullName?.trim()) {
      return NextResponse.json({ ok: false, message: 'Vui lòng nhập họ tên.' }, { status: 400 })
    }
    if (!contact?.phone || !validatePhone(contact.phone)) {
      return NextResponse.json({ ok: false, message: 'Số điện thoại không hợp lệ.' }, { status: 400 })
    }
    if (!contact?.province?.trim() || !contact?.district?.trim() || !contact?.ward?.trim() || !contact?.address?.trim()) {
      return NextResponse.json({ ok: false, message: 'Vui lòng nhập đầy đủ địa chỉ.' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ ok: false, message: 'Giỏ hàng trống.' }, { status: 400 })
    }
    if (shippingMethod && !SHIPPING_METHODS.has(shippingMethod)) {
      return NextResponse.json({ ok: false, message: 'Phương thức vận chuyển không hợp lệ.' }, { status: 400 })
    }
    if (paymentMethod && !PAYMENT_METHODS.has(paymentMethod)) {
      return NextResponse.json({ ok: false, message: 'Phương thức thanh toán không hợp lệ.' }, { status: 400 })
    }

    // Get customer if logged in
    const customer = await getCustomerFromRequest(request)

    const orderId = generateOrderId()
    const payload = {
      order_id: orderId,
      customer_id: customer?.sub || '',
      guest: !customer,
      contact,
      items,
      shipping_method: shippingMethod || 'STANDARD',
      payment_method: paymentMethod || 'COD',
      payment_confirmed: Boolean(paymentConfirmed),
      promo_code: promoCode || '',
      note: note || '',
    }

    const result = await createOrder(payload)
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    console.error('POST /api/orders error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
