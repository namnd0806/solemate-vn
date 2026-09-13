import { NextResponse } from 'next/server'
import { getProductById, updateProduct, setProductStatus } from '@/lib/db/products'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const result = await getProductById(id)
    if (!result.ok) return NextResponse.json(result, { status: 404 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/products/[id] error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const result = await updateProduct(id, body)
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('PUT /api/products/[id] error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const result = await setProductStatus(id, body.status)
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('PATCH /api/products/[id] error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
