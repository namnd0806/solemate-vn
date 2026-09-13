import { NextResponse } from 'next/server'
import { getMovements } from '@/lib/db/stock'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const result = await getMovements({
      page: searchParams.get('page') || 1,
      sku: searchParams.get('sku') || undefined,
    })
    if (!result.ok) return NextResponse.json(result, { status: 500 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/stock/movements error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
