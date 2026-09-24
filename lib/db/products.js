import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getProducts({
  search, gender, category, brand, sort,
  page = 1, limit = 12,
  featured, bestSeller, status = 'ACTIVE', hasSalePrice,
} = {}) {
  try {
    const supabase = getSupabaseServerClient()
    const { data: salesRows, error: salesError } = await supabase
      .from('product_sales_stats')
      .select('product_id, sales_count')
    if (salesError) throw salesError
    const salesMap = new Map((salesRows || []).map(row => [row.product_id, Number(row.sales_count) || 0]))
    const rankedIds = [...salesMap.entries()]
      .filter(([, quantity]) => quantity > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
    const bestSellerIds = rankedIds.slice(0, 8)

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
    if (bestSeller === true || bestSeller === 'true') {
      if (!bestSellerIds.length) {
        return { ok: true, data: { products: [], total: 0, page: Number(page), limit: Number(limit), totalPages: 0 } }
      }
      query = query.in('id', bestSellerIds)
    }
    if (hasSalePrice === true || hasSalePrice === 'true') {
      const now = new Date().toISOString()
      query = query.not('sale_price', 'is', null)
        .or(`sale_start_at.is.null,sale_start_at.lte.${now}`)
        .or(`sale_end_at.is.null,sale_end_at.gte.${now}`)
    }

    switch (sort) {
      case 'price_asc':   query = query.order('price', { ascending: true });  break
      case 'price_desc':  query = query.order('price', { ascending: false }); break
      case 'newest':      query = query.order('created_at', { ascending: false }); break
      case 'best_seller': query = query.order('created_at', { ascending: false }); break
      default:            query = query.order('created_at', { ascending: false })
    }

    const from = (Number(page) - 1) * Number(limit)
    query = query.range(from, from + Number(limit) - 1)

    const { data, error, count } = await query
    if (error) throw error
    let products = (data || []).map(product => ({
      ...product,
      sales_count: salesMap.get(product.id) || 0,
      is_best_seller: bestSellerIds.includes(product.id),
    }))
    if (sort === 'best_seller' || bestSeller === true || bestSeller === 'true') {
      products = products.sort((a, b) => b.sales_count - a.sales_count)
    }
    return {
      ok: true,
      data: {
        products,
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

export async function getProductBySlug(slug, { allowInactive = false } = {}) {
  try {
    const supabase = getSupabaseServerClient()
    let query = supabase
      .from('products')
      .select('*, variants(*)')
      .eq('slug', slug)
    if (!allowInactive) query = query.eq('status', 'ACTIVE')
    const { data, error } = await query.single()
    if (error || !data) return { ok: false, message: 'Không tìm thấy sản phẩm.' }
    return { ok: true, data }
  } catch (err) {
    console.error('getProductBySlug error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function getProductById(id, { allowInactive = false } = {}) {
  try {
    const supabase = getSupabaseServerClient()
    // Try by id first, then slug
    let firstQuery = supabase
      .from('products')
      .select('*, variants(*)')
      .eq('id', id)
    if (!allowInactive) firstQuery = firstQuery.eq('status', 'ACTIVE')
    let { data, error } = await firstQuery.single()
    if (error || !data) {
      let slugQuery = supabase
        .from('products')
        .select('*, variants(*)')
        .eq('slug', id)
      if (!allowInactive) slugQuery = slugQuery.eq('status', 'ACTIVE')
      ;({ data, error } = await slugQuery.single())
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
    if (product.sale_start_at && product.sale_end_at && new Date(product.sale_end_at) <= new Date(product.sale_start_at)) {
      return { ok: false, message: 'Thời gian kết thúc sale phải sau thời gian bắt đầu.' }
    }
    const normalizedVariants = (variants || []).map(v => ({ ...v, sku: v.sku?.trim().toUpperCase() }))
    if (!normalizedVariants.length) return { ok: false, message: 'Sản phẩm cần ít nhất một biến thể.' }
    if (new Set(normalizedVariants.map(v => v.sku)).size !== normalizedVariants.length) {
      return { ok: false, message: 'SKU trong sản phẩm không được trùng nhau.' }
    }

    const { data: slugCheck } = await supabase
      .from('products').select('id').eq('slug', product.slug).maybeSingle()
    if (slugCheck) return { ok: false, message: 'Slug đã tồn tại.' }

    for (const v of normalizedVariants) {
      if (!v.sku?.trim() || !v.color?.trim() || !String(v.size || '').trim() || Number(v.stock) < 0) {
        return { ok: false, message: 'SKU, màu, size và tồn kho của biến thể là bắt buộc.' }
      }
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
      .from('variants').insert(normalizedVariants.map(v => ({
        ...v,
        color: v.color.trim(),
        size: String(v.size).trim(),
        stock: Math.max(0, Number(v.stock) || 0),
        product_id: id,
      })))
    if (vErr) {
      await supabase.from('products').delete().eq('id', id)
      throw vErr
    }

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
    if (product.sale_start_at && product.sale_end_at && new Date(product.sale_end_at) <= new Date(product.sale_start_at)) {
      return { ok: false, message: 'Thời gian kết thúc sale phải sau thời gian bắt đầu.' }
    }

    const { data: slugCheck } = await supabase
      .from('products').select('id').eq('slug', product.slug).neq('id', id).maybeSingle()
    if (slugCheck) return { ok: false, message: 'Slug đã tồn tại.' }

    const normalizedVariants = (variants || []).map(v => ({ ...v, sku: v.sku?.trim().toUpperCase() }))
    if (!normalizedVariants.length) return { ok: false, message: 'Sản phẩm cần ít nhất một biến thể.' }
    if (new Set(normalizedVariants.map(v => v.sku)).size !== normalizedVariants.length) {
      return { ok: false, message: 'SKU trong sản phẩm không được trùng nhau.' }
    }
    const { data: currentVariants, error: currentErr } = await supabase
      .from('variants').select('*').eq('product_id', id)
    if (currentErr) throw currentErr
    const incomingSkus = normalizedVariants.map(v => v.sku)
    const { data: skuOwners, error: ownerErr } = await supabase
      .from('variants').select('sku, product_id').in('sku', incomingSkus)
    if (ownerErr) throw ownerErr
    const foreignSku = skuOwners?.find(v => v.product_id !== id)
    if (foreignSku) return { ok: false, message: `SKU ${foreignSku.sku} đang thuộc sản phẩm khác.` }

    for (const v of normalizedVariants) {
      if (!v.sku || !v.color?.trim() || !String(v.size || '').trim()) {
        return { ok: false, message: 'SKU, màu và size của biến thể là bắt buộc.' }
      }
      if (v.sale_price != null && v.sale_price >= v.price) {
        return { ok: false, message: `SKU ${v.sku}: giá khuyến mãi phải nhỏ hơn giá gốc.` }
      }
    }

    const productData = Object.fromEntries(
      Object.entries(product).filter(([key]) => !['created_at', 'variants', 'id'].includes(key))
    )
    const { data: updated, error: pErr } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (pErr) throw pErr

    if (normalizedVariants.length > 0) {
      for (const v of normalizedVariants) {
        const exists = currentVariants.some(current => current.sku === v.sku)
        const variantData = {
          product_id: id, sku: v.sku, color: v.color.trim(), size: String(v.size).trim(),
          status: v.status || 'ACTIVE', updated_at: new Date().toISOString(),
        }
        const response = exists
          ? await supabase.from('variants').update(variantData).eq('sku', v.sku)
          : await supabase.from('variants').insert({ ...variantData, stock: Math.max(0, Number(v.stock) || 0) })
        if (response.error) throw response.error
      }
      const removedSkus = currentVariants.map(v => v.sku).filter(sku => !incomingSkus.includes(sku))
      if (removedSkus.length) {
        const { error: removeErr } = await supabase.from('variants')
          .update({ status: 'INACTIVE', updated_at: new Date().toISOString() }).in('sku', removedSkus)
        if (removeErr) throw removeErr
      }
    }

    return { ok: true, data: updated }
  } catch (err) {
    console.error('updateProduct error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function setProductStatus(id, status) {
  try {
    if (!['ACTIVE', 'INACTIVE'].includes(status)) return { ok: false, message: 'Trạng thái không hợp lệ.' }
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
