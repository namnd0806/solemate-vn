import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })

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

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ ok: true, data: { url: publicUrl } })
  } catch (err) {
    console.error('POST /api/products/upload error:', err)
    return NextResponse.json({ ok: false, message: 'Lỗi upload ảnh.' }, { status: 500 })
  }
}
