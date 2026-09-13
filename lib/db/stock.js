import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function adjustStock({ sku, delta, note = '' }) {
  try {
    const supabase = getSupabaseServerClient()

    if (!Number.isInteger(delta) || delta === 0) {
      return { ok: false, message: 'Số lượng điều chỉnh phải là số nguyên khác 0.' }
    }

    const { data: variant, error: fetchErr } = await supabase
      .from('variants')
      .select('id, sku, stock, product_id, products(name)')
      .eq('sku', sku)
      .single()

    if (fetchErr || !variant) return { ok: false, message: 'SKU không tồn tại.' }

    const before = variant.stock
    const after = before + delta

    if (after < 0) return { ok: false, message: 'Tồn kho không thể âm.' }

    const { error: updateErr } = await supabase
      .from('variants')
      .update({ stock: after, updated_at: new Date().toISOString() })
      .eq('sku', sku)
    if (updateErr) throw updateErr

    const { data: movement, error: movErr } = await supabase
      .from('stock_movements')
      .insert({
        sku,
        product_id: variant.product_id,
        product_name: variant.products?.name || '',
        type: 'ADJUST',
        delta,
        before,
        after,
        ref: null,
        note,
      })
      .select()
      .single()
    if (movErr) throw movErr

    return { ok: true, data: { sku, before, after, delta, movement } }
  } catch (err) {
    console.error('adjustStock error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function getMovements({ page = 1, limit = 50, sku } = {}) {
  try {
    const supabase = getSupabaseServerClient()
    let query = supabase
      .from('stock_movements')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (sku) query = query.eq('sku', sku)

    const from = (Number(page) - 1) * Number(limit)
    query = query.range(from, from + Number(limit) - 1)

    const { data, error, count } = await query
    if (error) throw error
    return {
      ok: true,
      data: { movements: data, total: count, page: Number(page) },
    }
  } catch (err) {
    console.error('getMovements error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}
