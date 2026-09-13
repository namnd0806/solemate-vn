import { NextResponse } from 'next/server'
import { cancelOrder } from '@/lib/db/orders'
import { getAdminFromRequest, getCustomerFromRequest } from '@/lib/auth'

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const admin = await getAdminFromRequest(request)
    const customer = await getCustomerFromRequest(request)

    if (!admin && !customer) {
      return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const result = await cancelOrder(id)
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('POST /api/orders/[id]/cancel error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
