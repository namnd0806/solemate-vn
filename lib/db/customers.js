import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getCustomers() {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone, active, created_at, orders(id,status,total,created_at)')
      .eq('role', 'CUSTOMER')
      .order('created_at', { ascending: false })
    if (error) throw error
    return {
      ok: true,
      data: (data || []).map(customer => {
        const delivered = (customer.orders || []).filter(order => order.status === 'DELIVERED')
        const latest = [...(customer.orders || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        return {
          ...customer,
          orders_count: customer.orders?.length || 0,
          delivered_count: delivered.length,
          total_spent: delivered.reduce((sum, order) => sum + order.total, 0),
          last_order_at: latest?.created_at || null,
        }
      }),
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
