import { NextResponse } from 'next/server'
import { getOrderById, updateOrderStatus } from '@/lib/db/orders'
import { getAdminFromRequest, getCustomerFromRequest } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const admin = await getAdminFromRequest(request)
    const customer = await getCustomerFromRequest(request)

    const result = await getOrderById(id)
    if (!result.ok) return NextResponse.json(result, { status: 404 })

    // Admin can see all orders
    if (admin) return NextResponse.json(result)

    // Customer can see their own orders
    if (customer && result.data.customer_id === customer.sub) return NextResponse.json(result)

    // Guest: allow viewing guest orders (no customer_id) - order lookup by ID only
    // This is acceptable since order IDs are non-guessable (timestamp+random)
    if (result.data.guest) return NextResponse.json(result)

    return NextResponse.json({ ok: false, message: 'Không tìm thấy đơn hàng.' }, { status: 404 })
  } catch (err) {
    console.error('GET /api/orders/[id] error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const result = await updateOrderStatus(id, {
      status: body.status,
      tracking: body.tracking,
      shippingCarrier: body.shippingCarrier,
      paymentStatus: body.paymentStatus,
      internalNote: body.internalNote,
      note: body.note,
      actor: 'ADMIN',
    })
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('PATCH /api/orders/[id] error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
