import { NextResponse } from 'next/server'
import { adjustStock } from '@/lib/db/stock'
import { getAdminFromRequest } from '@/lib/auth'

export async function POST(request) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })

    const body = await request.json()
    const { sku, delta, note } = body

    if (!sku?.trim()) {
      return NextResponse.json({ ok: false, message: 'SKU không được để trống.' }, { status: 400 })
    }
    if (!Number.isInteger(Number(delta)) || Number(delta) === 0) {
      return NextResponse.json({ ok: false, message: 'Số lượng điều chỉnh phải là số nguyên khác 0.' }, { status: 400 })
    }

    const result = await adjustStock({ sku: sku.trim(), delta: Number(delta), note: note || '', actor: admin.email || 'ADMIN' })
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('POST /api/stock/adjust error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
