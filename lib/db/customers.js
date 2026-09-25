import { getSupabaseServerClient } from '@/lib/supabase/server'

function normalizePhone(phone = '') {
  return String(phone).replace(/\s/g, '')
}

function splitName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { first_name: 'Khách', last_name: 'vãng lai' }
  if (parts.length === 1) return { first_name: parts[0], last_name: '' }
  return { first_name: parts.slice(0, -1).join(' '), last_name: parts.at(-1) }
}

function summarizeCustomer(customer, orders, type = 'REGISTERED') {
  const delivered = orders.filter(order => order.status === 'DELIVERED')
  const cancelled = orders.filter(order => order.status === 'CANCELLED')
  const latest = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
  return {
    ...customer,
    type,
    orders,
    orders_count: orders.length,
    delivered_count: delivered.length,
    cancelled_count: cancelled.length,
    total_spent: delivered.reduce((sum, order) => sum + Number(order.total || 0), 0),
    last_order_at: latest?.created_at || null,
    last_order: latest || null,
  }
}

export async function getCustomers() {
  try {
    const supabase = getSupabaseServerClient()
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone, active, created_at, orders(id,status,total,created_at)')
      .eq('role', 'CUSTOMER')
      .order('created_at', { ascending: false })
    if (usersError) throw usersError

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id,status,total,created_at,customer_id,guest,contact,payment_method,payment_status')
      .order('created_at', { ascending: false })
    if (ordersError) throw ordersError

    const registered = (users || []).map(customer => {
      const customerOrders = (customer.orders || []).map(order => ({ ...order, customer_id: customer.id }))
      return summarizeCustomer(customer, customerOrders, 'REGISTERED')
    })

    const guestMap = new Map()
    ;(orders || []).forEach(order => {
      if (order.customer_id && !order.guest) return
      const phone = normalizePhone(order.contact?.phone)
      const key = phone || `order:${order.id}`
      const existing = guestMap.get(key)
      const fullName = order.contact?.fullName || 'Khách vãng lai'
      if (!existing) {
        const names = splitName(fullName)
        guestMap.set(key, {
          id: `guest:${key}`,
          ...names,
          full_name: fullName,
          email: order.contact?.email || '',
          phone,
          active: null,
          created_at: order.created_at,
          address: order.contact ? [order.contact.address, order.contact.ward, order.contact.district, order.contact.province].filter(Boolean).join(', ') : '',
          orders: [order],
        })
        return
      }
      existing.orders.push(order)
      if (new Date(order.created_at) > new Date(existing.created_at)) {
        existing.created_at = order.created_at
        existing.full_name = fullName
        existing.email = order.contact?.email || existing.email
        existing.address = order.contact ? [order.contact.address, order.contact.ward, order.contact.district, order.contact.province].filter(Boolean).join(', ') : existing.address
        Object.assign(existing, splitName(fullName))
      }
    })

    const guests = [...guestMap.values()].map(customer => summarizeCustomer(customer, customer.orders, 'GUEST'))
    const customers = [...registered, ...guests].sort((a, b) => new Date(b.last_order_at || b.created_at) - new Date(a.last_order_at || a.created_at))

    return {
      ok: true,
      data: customers,
    }
  } catch (err) {
    console.error('getCustomers error:', err)
    return { ok: false, message: 'Không thể tải danh sách khách hàng.' }
  }
}

export async function setCustomerActive(id, active) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.from('users')
      .update({ active: Boolean(active) })
      .eq('id', id).eq('role', 'CUSTOMER')
      .select('id, active').single()
    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    console.error('setCustomerActive error:', err)
    return { ok: false, message: 'Không thể cập nhật khách hàng.' }
  }
}
