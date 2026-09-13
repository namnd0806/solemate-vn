import { NextResponse } from 'next/server'
import { getOrderById, updateOrderStatus } from '@/lib/db/orders'
import { getAdminFromRequest, getCustomerFromRequest } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const admin = await getAdminFromRequest(request)
    const customer = await getCustomerFromRequest(request)

    if (!admin && !customer) {
      return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const result = await getOrderById(id)
    if (!result.ok) return NextResponse.json(result, { status: 404 })

    // Customers can only see their own orders
    if (!admin && result.data.customer_id !== customer.sub) {
      return NextResponse.json({ ok: false, message: 'Không tìm thấy đơn hàng.' }, { status: 404 })
    }

    return NextResponse.json(result)
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
      paymentStatus: body.paymentStatus,
    })
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('PATCH /api/orders/[id] error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
