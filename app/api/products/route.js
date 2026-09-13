import { NextResponse } from 'next/server'
import { getProducts, createProduct } from '@/lib/db/products'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      search: searchParams.get('search') || undefined,
      gender: searchParams.get('gender') || undefined,
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 12,
      featured: searchParams.get('featured') || undefined,
      bestSeller: searchParams.get('bestSeller') || undefined,
      hasSalePrice: searchParams.get('hasSalePrice') || undefined,
      status: searchParams.get('status') || 'ACTIVE',
    }
    const result = await getProducts(params)
    if (!result.ok) return NextResponse.json(result, { status: 500 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/products error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })

    const body = await request.json()
    if (!body.product || !body.variants) {
      return NextResponse.json({ ok: false, message: 'Dữ liệu không hợp lệ.' }, { status: 400 })
    }

    const result = await createProduct(body)
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    console.error('POST /api/products error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
