import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getProducts({
  search, gender, category, brand, sort,
  page = 1, limit = 12,
  featured, bestSeller, status = 'ACTIVE', hasSalePrice,
} = {}) {
  try {
    const supabase = getSupabaseServerClient()
    let query = supabase
      .from('products')
      .select('*, variants(*)', { count: 'exact' })

    if (status !== 'ALL') query = query.eq('status', status)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,brand.ilike.%${search}%,category.ilike.%${search}%`
      )
    }
    if (gender) query = query.eq('gender', gender)
    if (category) query = query.eq('category', category)
    if (brand) query = query.eq('brand', brand)
    if (featured === true || featured === 'true') query = query.eq('featured', true)
    if (bestSeller === true || bestSeller === 'true') query = query.eq('best_seller', true)
    if (hasSalePrice === true || hasSalePrice === 'true') query = query.not('sale_price', 'is', null)

    switch (sort) {
      case 'price_asc':   query = query.order('price', { ascending: true });  break
      case 'price_desc':  query = query.order('price', { ascending: false }); break
      case 'newest':      query = query.order('created_at', { ascending: false }); break
      case 'best_seller': query = query.order('best_seller', { ascending: false }); break
      default:            query = query.order('created_at', { ascending: false })
    }

    const from = (Number(page) - 1) * Number(limit)
    query = query.range(from, from + Number(limit) - 1)

    const { data, error, count } = await query
    if (error) throw error
    return {
      ok: true,
      data: {
        products: data,
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    }
  } catch (err) {
    console.error('getProducts error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function getProductBySlug(slug) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, variants(*)')
      .eq('slug', slug)
      .single()
    if (error || !data) return { ok: false, message: 'Không tìm thấy sản phẩm.' }
    return { ok: true, data }
  } catch (err) {
    console.error('getProductBySlug error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function getProductById(id) {
  try {
    const supabase = getSupabaseServerClient()
    // Try by id first, then slug
    let { data, error } = await supabase
      .from('products')
      .select('*, variants(*)')
      .eq('id', id)
      .single()
    if (error || !data) {
      ;({ data, error } = await supabase
        .from('products')
        .select('*, variants(*)')
        .eq('slug', id)
        .single())
    }
    if (error || !data) return { ok: false, message: 'Không tìm thấy sản phẩm.' }
    return { ok: true, data }
  } catch (err) {
    console.error('getProductById error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function createProduct({ product, variants }) {
  try {
    const supabase = getSupabaseServerClient()

    if (product.sale_price != null && product.sale_price >= product.price) {
      return { ok: false, message: 'Giá khuyến mãi phải nhỏ hơn giá gốc.' }
    }

    const { data: slugCheck } = await supabase
      .from('products').select('id').eq('slug', product.slug).maybeSingle()
    if (slugCheck) return { ok: false, message: 'Slug đã tồn tại.' }

    for (const v of variants) {
      if (!v.sku || v.stock < 0) return { ok: false, message: `Variant ${v.sku} có dữ liệu không hợp lệ.` }
      if (v.sale_price != null && v.sale_price >= v.price) {
        return { ok: false, message: `SKU ${v.sku}: giá khuyến mãi phải nhỏ hơn giá gốc.` }
      }
      const { data: skuCheck } = await supabase
        .from('variants').select('id').eq('sku', v.sku).maybeSingle()
      if (skuCheck) return { ok: false, message: `SKU ${v.sku} đã tồn tại.` }
    }

    const id = product.id || `P${Date.now()}`
    const { data: newProduct, error: pErr } = await supabase
      .from('products').insert({ ...product, id }).select().single()
    if (pErr) throw pErr

    const { error: vErr } = await supabase
      .from('variants').insert(variants.map(v => ({ ...v, product_id: id })))
    if (vErr) throw vErr

    return { ok: true, data: newProduct }
  } catch (err) {
    console.error('createProduct error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function updateProduct(id, { product, variants }) {
  try {
    const supabase = getSupabaseServerClient()

    if (product.sale_price != null && product.sale_price >= product.price) {
      return { ok: false, message: 'Giá khuyến mãi phải nhỏ hơn giá gốc.' }
    }

    const { data: slugCheck } = await supabase
      .from('products').select('id').eq('slug', product.slug).neq('id', id).maybeSingle()
    if (slugCheck) return { ok: false, message: 'Slug đã tồn tại.' }

    // eslint-disable-next-line no-unused-vars
    const { created_at, ...productData } = product
    const { data: updated, error: pErr } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (pErr) throw pErr

    if (variants?.length > 0) {
      for (const v of variants) {
        if (v.sale_price != null && v.sale_price >= v.price) {
          return { ok: false, message: `SKU ${v.sku}: giá khuyến mãi phải nhỏ hơn giá gốc.` }
        }
      }
      const { error: vErr } = await supabase
        .from('variants')
        .upsert(variants.map(v => ({ ...v, product_id: id, updated_at: new Date().toISOString() })), { onConflict: 'sku' })
      if (vErr) throw vErr
    }

    return { ok: true, data: updated }
  } catch (err) {
    console.error('updateProduct error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function setProductStatus(id, status) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('products')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    console.error('setProductStatus error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}
