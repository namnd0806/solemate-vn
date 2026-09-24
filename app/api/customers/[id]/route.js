import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { setCustomerActive } from '@/lib/db/customers'

export async function PATCH(request, { params }) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
  const { id } = await params
  const { active } = await request.json()
  if (typeof active !== 'boolean') return NextResponse.json({ ok: false, message: 'Trạng thái không hợp lệ.' }, { status: 400 })
  const result = await setCustomerActive(id, active)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
