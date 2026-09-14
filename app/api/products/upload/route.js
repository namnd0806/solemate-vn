import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    // Use next/headers cookies() directly — more reliable for multipart requests
    const cookieStore = await cookies()
    const token = cookieStore.get('smvn_admin_token')?.value

    if (!token) {
      return NextResponse.json({ ok: false, message: 'Chưa đăng nhập.' }, { status: 401 })
    }

    const payload = await verifyJwt(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, message: 'Không có quyền.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) return NextResponse.json({ ok: false, message: 'Không có file.' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop().toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ ok: false, message: 'Lỗi upload: ' + error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ ok: true, data: { url: publicUrl } })
  } catch (err) {
    console.error('POST /api/products/upload error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi hệ thống: ' + err.message }, { status: 500 })
  }
}
