import { getSupabaseServerClient } from '@/lib/supabase/server'

const ALLOWED_TRANSITIONS = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKING', 'CANCELLED'],
  PACKING:   ['SHIPPING', 'CANCELLED'],
  SHIPPING:  ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PACKING: 'Đang đóng gói',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
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

export async function confirmOrderAndDeductStock(orderId, { note = '', actor = 'ADMIN' } = {}) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.rpc('confirm_order_deduct_stock', {
      p_order_id: orderId,
      p_note: note,
      p_actor: actor,
    })
    if (error) throw error
    if (!data.ok) return { ok: false, message: data.message }
    return { ok: true, data }
  } catch (err) {
    console.error('confirmOrderAndDeductStock error:', err)
    return { ok: false, message: 'Lỗi hệ thống khi xác nhận đơn hàng.' }
  }
}

export async function cancelOrder(orderId, { reason = '', actor = 'SYSTEM' } = {}) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.rpc('cancel_order', {
      p_order_id: orderId,
      p_reason: reason,
      p_actor: actor,
    })
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
    const all = limit === 'all'

    const buildQuery = () => {
      let query = supabase
        .from('orders')
        .select('*, order_items(*), order_events(*)', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (status) query = query.eq('status', status)
      if (customerId) query = query.eq('customer_id', customerId)
      return query
    }

    if (all) {
      const chunkSize = 1000
      let from = 0
      let allRows = []
      let total = 0

      while (true) {
        const { data, error, count } = await buildQuery().range(from, from + chunkSize - 1)
        if (error) throw error
        if (count !== null) total = count
        allRows = allRows.concat(data || [])
        if (!data || data.length < chunkSize) break
        from += chunkSize
      }

      return {
        ok: true,
        data: { orders: allRows, total: total || allRows.length, page: 1, totalPages: 1 },
      }
    }

    const from = (Number(page) - 1) * Number(limit)
    const query = buildQuery().range(from, from + Number(limit) - 1)
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
      .select('*, order_items(*), order_events(*)')
      .eq('id', id)
      .single()
    if (error || !data) return { ok: false, message: 'Không tìm thấy đơn hàng.' }
    return { ok: true, data }
  } catch (err) {
    console.error('getOrderById error:', err)
    return { ok: false, message: 'Lỗi hệ thống.' }
  }
}

export async function updateOrderStatus(id, { status, tracking, shippingCarrier, paymentStatus, internalNote, note, actor = 'ADMIN' }) {
  try {
    const supabase = getSupabaseServerClient()

    const { data: order, error: fetchErr } = await supabase
      .from('orders').select('status, payment_method, payment_status, tracking, shipping_carrier').eq('id', id).single()
    if (fetchErr || !order) return { ok: false, message: 'Không tìm thấy đơn hàng.' }

    if (status && status !== order.status) {
      const allowed = ALLOWED_TRANSITIONS[order.status] || []
      if (!allowed.includes(status)) {
        return { ok: false, message: `Không thể chuyển từ "${STATUS_LABELS[order.status] || order.status}" sang "${STATUS_LABELS[status] || status}".` }
      }
    }

    if (status === 'CONFIRMED' && order.status === 'PENDING') {
      return await confirmOrderAndDeductStock(id, {
        note: note || 'Admin xác nhận đơn và trừ kho',
        actor,
      })
    }

    const nextTracking = tracking !== undefined ? tracking.trim() : order.tracking
    const nextCarrier = shippingCarrier !== undefined ? shippingCarrier.trim() : order.shipping_carrier
    const shippingTouched = tracking !== undefined || shippingCarrier !== undefined
    if (shippingTouched && !['PACKING', 'SHIPPING'].includes(order.status) && status !== 'SHIPPING') {
      return { ok: false, message: 'Chỉ được cập nhật vận chuyển khi đơn đang đóng gói hoặc đang giao.' }
    }
    if (status === 'SHIPPING') {
      if (!nextCarrier) return { ok: false, message: 'Vui lòng chọn đơn vị vận chuyển trước khi chuyển sang đang giao.' }
      if (nextCarrier !== 'SHOP' && !nextTracking) return { ok: false, message: 'Vui lòng nhập mã vận đơn trước khi chuyển sang đang giao.' }
    }

    const updates = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (tracking !== undefined) updates.tracking = tracking.trim()
    if (shippingCarrier !== undefined) updates.shipping_carrier = shippingCarrier.trim()
    if (internalNote !== undefined) updates.internal_note = internalNote.trim()
    if (paymentStatus) updates.payment_status = paymentStatus
    if (status === 'DELIVERED') {
      updates.delivered_at = new Date().toISOString()
      if (order.payment_status !== 'PAID') updates.payment_status = 'PAID'
    }

    const { data, error } = await supabase
      .from('orders').update(updates).eq('id', id).select().single()
    if (error) throw error

    if (status && status !== order.status) {
      await supabase.from('order_events').insert({
        order_id: id,
        actor,
        event_type: 'STATUS_CHANGE',
        from_status: order.status,
        to_status: status,
        note: note || '',
      })
    } else if (tracking !== undefined || shippingCarrier !== undefined || internalNote !== undefined || paymentStatus) {
      await supabase.from('order_events').insert({
        order_id: id,
        actor,
        event_type: 'ORDER_UPDATE',
        from_status: order.status,
        to_status: order.status,
        note: note || 'Cập nhật thông tin đơn hàng',
      })
    }

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
      .select('*, order_items(*), order_events(*)')
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
