import { NextResponse } from 'next/server'
import { getPromotions, createPromotion } from '@/lib/db/promotions'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })

    const result = await getPromotions()
    if (!result.ok) return NextResponse.json(result, { status: 500 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/promotions error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })

    const body = await request.json()
    const result = await createPromotion(body)
    if (!result.ok) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    console.error('POST /api/promotions error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
