import { getSupabaseServerClient } from '@/lib/supabase/server'

const ALLOWED_TRANSITIONS = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING',  'CANCELLED'],
  SHIPPING:  ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export async function createOrder(payload) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.rpc('create_order', { payload })
    if (error) throw error
    if (!data.ok) return { ok: false, message: data.message }
    return { ok: true, data }
  } catch (err) {
    console.error('createOrder error:', err)
    return { ok: false, message: 'Lỗi hệ thống khi tạo đơn hàng.' }
  }
}

export async function cancelOrder(orderId) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.rpc('cancel_order', { p_order_id: orderId })
    if (error) throw error
    if (!data.ok) return { ok: false, message: data.message }
    return { ok: true, data }
  } catch (err) {
    console.error('cancelOrder error:', err)
    return { ok: false, message: 'Lỗi hệ thống khi hủy đơn hàng.' }
  }
}

export async function getOrders({ status, customerId, page = 1, limit = 20 } = {}) {
  try {
    const supabase = getSupabaseServerClient()
    let query = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (customerId) query = query.eq('customer_id', customerId)

    const from = (Number(page) - 1) * Number(limit)
    query = query.range(from, from + Number(limit) - 1)

    const { data, error, count } = await query
    if (error) throw error
    return {
      ok: true,
      data: { orders: data, total: count, page: Number(page), totalPages: Math.ceil(count / Number(limit)) },
    }
  } catch (err) {
    console.error('getOrders error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function getOrderById(id) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()
    if (error || !data) return { ok: false, message: 'Không tìm thấy đơn hàng.' }
    return { ok: true, data }
  } catch (err) {
    console.error('getOrderById error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function updateOrderStatus(id, { status, tracking, paymentStatus }) {
  try {
    const supabase = getSupabaseServerClient()

    const { data: order, error: fetchErr } = await supabase
      .from('orders').select('status').eq('id', id).single()
    if (fetchErr || !order) return { ok: false, message: 'Không tìm thấy đơn hàng.' }

    if (status && status !== order.status) {
      const allowed = ALLOWED_TRANSITIONS[order.status] || []
      if (!allowed.includes(status)) {
        return { ok: false, message: `Không thể chuyển trạng thái từ ${order.status} sang ${status}.` }
      }
    }

    const updates = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (tracking !== undefined) updates.tracking = tracking
    if (paymentStatus) updates.payment_status = paymentStatus
    if (status === 'DELIVERED') updates.delivered_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('orders').update(updates).eq('id', id).select().single()
    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    console.error('updateOrderStatus error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function lookupGuestOrder(orderId, phone) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()
    if (error || !data) return { ok: false, message: 'Không tìm thấy đơn hàng.' }
    if (data.contact?.phone !== phone) return { ok: false, message: 'Không tìm thấy đơn hàng.' }
    return { ok: true, data }
  } catch (err) {
    console.error('lookupGuestOrder error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}
