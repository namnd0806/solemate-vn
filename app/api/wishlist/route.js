import { NextResponse } from 'next/server'
import { getWishlist, toggleWishlist } from '@/lib/db/wishlist'
import { getCustomerFromRequest } from '@/lib/auth'

export async function GET(request) {
  try {
    const customer = await getCustomerFromRequest(request)
    if (!customer) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    const result = await getWishlist(customer.sub)
    if (!result.ok) return NextResponse.json(result, { status: 500 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/wishlist error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const customer = await getCustomerFromRequest(request)
    if (!customer) return NextResponse.json({ ok: false, message: 'Vui lòng đăng nhập để thêm vào yêu thích.' }, { status: 401 })
    const { productId } = await request.json()
    if (!productId) return NextResponse.json({ ok: false, message: 'Thiếu productId.' }, { status: 400 })
    const result = await toggleWishlist(customer.sub, productId)
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('POST /api/wishlist error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
