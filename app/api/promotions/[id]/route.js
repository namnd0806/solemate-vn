import { NextResponse } from 'next/server'
import { updatePromotion, togglePromotion, deletePromotion } from '@/lib/db/promotions'
import { getAdminFromRequest } from '@/lib/auth'

export async function PUT(request, { params }) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    const result = await updatePromotion(id, body)
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('PUT /api/promotions/[id] error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    const { id } = await params
    const { enabled } = await request.json()
    const result = await togglePromotion(id, enabled)
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('PATCH /api/promotions/[id] error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    const { id } = await params
    const result = await deletePromotion(id)
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('DELETE /api/promotions/[id] error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
