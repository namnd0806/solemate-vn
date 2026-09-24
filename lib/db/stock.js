import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function adjustStock({ sku, delta, note = '', actor = 'ADMIN' }) {
  try {
    const supabase = getSupabaseServerClient()

    if (!Number.isInteger(delta) || delta === 0) {
      return { ok: false, message: 'Số lượng điều chỉnh phải là số nguyên khác 0.' }
    }

    const { data, error } = await supabase.rpc('adjust_stock_atomic', {
      p_sku: sku,
      p_delta: delta,
      p_note: note,
      p_actor: actor,
    })
    if (error) throw error
    if (!data?.ok) return { ok: false, message: data?.message || 'Không thể điều chỉnh kho.' }
    return { ok: true, data }
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
