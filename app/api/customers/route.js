import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getCustomers } from '@/lib/db/customers'

export async function GET(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
  const result = await getCustomers()
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
