import { NextResponse } from 'next/server'
import { cancelOrder, getOrderById } from '@/lib/db/orders'
import { getAdminFromRequest, getCustomerFromRequest } from '@/lib/auth'

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const admin = await getAdminFromRequest(request)
    const customer = await getCustomerFromRequest(request)
    const body = await request.json().catch(() => ({}))

    if (!admin && !customer) {
      return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const order = await getOrderById(id)
    if (!order.ok) return NextResponse.json(order, { status: 404 })

    if (!admin) {
      if (order.data.customer_id !== customer.sub) {
        return NextResponse.json({ ok: false, message: 'Không tìm thấy đơn hàng.' }, { status: 404 })
      }
      if (!['PENDING', 'CONFIRMED'].includes(order.data.status)) {
        return NextResponse.json({ ok: false, message: 'Đơn này đang được xử lý. Vui lòng liên hệ shop để được hỗ trợ hủy.' }, { status: 400 })
      }
    }

    if (admin && !['PENDING', 'CONFIRMED', 'PACKING'].includes(order.data.status)) {
      return NextResponse.json({ ok: false, message: 'Đơn hàng không còn đủ điều kiện hủy.' }, { status: 400 })
    }

    const result = await cancelOrder(id, {
      reason: body.reason || '',
      actor: admin ? 'ADMIN' : 'CUSTOMER',
    })
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('POST /api/orders/[id]/cancel error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
