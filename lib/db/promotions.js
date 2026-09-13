import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getPromotions() {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('promotions').select('*').order('updated_at', { ascending: false })
    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    console.error('getPromotions error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function validatePromo(code, subtotal) {
  try {
    const supabase = getSupabaseServerClient()
    const { data: promo, error } = await supabase
      .from('promotions').select('*').ilike('code', code).maybeSingle()

    if (error || !promo) return { ok: false, message: 'Mã giảm giá không tồn tại.' }
    if (!promo.enabled) return { ok: false, message: 'Mã giảm giá đang tạm ngưng.' }

    const now = new Date()
    if (new Date(promo.start_at) > now) return { ok: false, message: 'Mã giảm giá chưa đến thời gian sử dụng.' }
    if (new Date(promo.end_at) < now) return { ok: false, message: 'Mã giảm giá đã hết hạn.' }
    if (promo.usage_count >= promo.usage_limit) return { ok: false, message: 'Mã giảm giá đã hết lượt sử dụng.' }
    if (subtotal < promo.min_spend) {
      return { ok: false, message: `Đơn hàng tối thiểu ${promo.min_spend} để dùng mã này.` }
    }

    let discount = 0
    if (promo.type === 'PERCENT') {
      discount = Math.floor(subtotal * promo.value / 100)
      if (promo.max_discount) discount = Math.min(discount, promo.max_discount)
      discount = Math.min(discount, subtotal)
    } else {
      discount = Math.min(promo.value, subtotal)
    }

    return { ok: true, data: { promo, discount } }
  } catch (err) {
    console.error('validatePromo error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function createPromotion(promoData) {
  try {
    const supabase = getSupabaseServerClient()

    const { data: existing } = await supabase
      .from('promotions').select('id').ilike('code', promoData.code).maybeSingle()
    if (existing) return { ok: false, message: 'Mã khuyến mãi đã tồn tại.' }

    if (new Date(promoData.end_at) <= new Date(promoData.start_at)) {
      return { ok: false, message: 'Thời gian kết thúc phải sau thời gian bắt đầu.' }
    }

    const id = promoData.id || `PR${Date.now()}`
    const { data, error } = await supabase
      .from('promotions')
      .insert({ ...promoData, id, code: promoData.code.toUpperCase(), usage_count: 0 })
      .select().single()
    if (error) {
      if (error.code === '23505') return { ok: false, message: 'Mã khuyến mãi đã tồn tại.' }
      throw error
    }
    return { ok: true, data }
  } catch (err) {
    console.error('createPromotion error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function updatePromotion(id, promoData) {
  try {
    const supabase = getSupabaseServerClient()

    if (promoData.end_at && promoData.start_at && new Date(promoData.end_at) <= new Date(promoData.start_at)) {
      return { ok: false, message: 'Thời gian kết thúc phải sau thời gian bắt đầu.' }
    }

    if (promoData.usage_limit !== undefined) {
      const { data: current } = await supabase.from('promotions').select('usage_count').eq('id', id).single()
      if (current && promoData.usage_limit < current.usage_count) {
        return { ok: false, message: 'Giới hạn lượt dùng không thể nhỏ hơn số lượt đã dùng.' }
      }
    }

    const { data, error } = await supabase
      .from('promotions')
      .update({ ...promoData, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    console.error('updatePromotion error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function togglePromotion(id, enabled) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('promotions')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    console.error('togglePromotion error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function deletePromotion(id) {
  try {
    const supabase = getSupabaseServerClient()
    const { data: promo } = await supabase
      .from('promotions').select('usage_count').eq('id', id).single()
    if (!promo) return { ok: false, message: 'Không tìm thấy mã khuyến mãi.' }

    if (promo.usage_count > 0) {
      // Preserve history — disable instead of delete
      const { data, error } = await supabase
        .from('promotions')
        .update({ enabled: false, updated_at: new Date().toISOString() })
        .eq('id', id).select().single()
      if (error) throw error
      return { ok: true, data, disabled: true }
    }

    const { error } = await supabase.from('promotions').delete().eq('id', id)
    if (error) throw error
    return { ok: true, data: { id } }
  } catch (err) {
    console.error('deletePromotion error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}
