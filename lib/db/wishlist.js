import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getWishlist(userId) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('wishlists')
      .select('id, created_at, products(*, variants(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    console.error('getWishlist error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function toggleWishlist(userId, productId) {
  try {
    const supabase = getSupabaseServerClient()

    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
      if (error) throw error
      return { ok: true, data: { action: 'removed', productId } }
    } else {
      const { data, error } = await supabase
        .from('wishlists')
        .insert({ user_id: userId, product_id: productId })
        .select()
        .single()
      if (error) throw error
      return { ok: true, data: { action: 'added', productId, wishlist: data } }
    }
  } catch (err) {
    console.error('toggleWishlist error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}
