'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatVND } from '@/lib/utils'
import AdminPagination from '@/components/admin/AdminPagination'
import { AdminConfirm, AdminMetricCard, ProductToast } from '@/components/admin/ProductFeedback'

const CUSTOMER_PAGE_SIZE = 10
const TYPE_LABEL = { REGISTERED: 'Có tài khoản', GUEST: 'Khách vãng lai' }
const STATUS_LABELS = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PACKING: 'Đang đóng gói', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy' }

function CustomerTypeBadge({ type }) {
  const isGuest = type === 'GUEST'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black ${isGuest ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
      <span className={`size-1.5 rounded-full ${isGuest ? 'bg-sky-500' : 'bg-emerald-500'}`} />
      {TYPE_LABEL[type] || type}
    </span>
  )
}

function CustomerAvatar({ customer }) {
  const initials = customer.type === 'GUEST' ? 'G' : `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}` || 'KH'
  return (
    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl font-black ${customer.type === 'GUEST' ? 'bg-sky-50 text-sky-600' : 'bg-orange-50 text-primary'}`}>
      {initials.toUpperCase()}
    </span>
  )
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)
  const [page, setPage] = useState(1)
  const [confirmCustomer, setConfirmCustomer] = useState(null)
  const [updating, setUpdating] = useState(false)

  function showToast(message, type = 'success') {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    const response = await fetch('/api/customers')
    const result = await response.json()
    if (result.ok) {
      setCustomers(result.data || [])
      setSelected(current => current ? (result.data || []).find(customer => customer.id === current.id) || current : null)
    } else {
      showToast(result.message || 'Không thể tải khách hàng.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    let ignore = false
    async function run() {
      setLoading(true)
      const response = await fetch('/api/customers')
      const result = await response.json()
      if (ignore) return
      if (result.ok) setCustomers(result.data || [])
      else showToast(result.message || 'Không thể tải khách hàng.', 'error')
      setLoading(false)
    }
    run()
    return () => { ignore = true }
  }, [])

  const stats = useMemo(() => {
    const registered = customers.filter(customer => customer.type === 'REGISTERED').length
    const guests = customers.filter(customer => customer.type === 'GUEST').length
    const totalOrders = customers.reduce((sum, customer) => sum + Number(customer.orders_count || 0), 0)
    const totalSpent = customers.reduce((sum, customer) => sum + Number(customer.total_spent || 0), 0)
    return { registered, guests, totalOrders, totalSpent }
  }, [customers])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return customers.filter(customer => {
      if (typeFilter !== 'ALL' && customer.type !== typeFilter) return false
      if (!keyword) return true
      return [customer.first_name, customer.last_name, customer.full_name, customer.email, customer.phone, customer.address].filter(Boolean).join(' ').toLowerCase().includes(keyword)
    })
  }, [customers, search, typeFilter])

  const customerTotalPages = Math.max(1, Math.ceil(filtered.length / CUSTOMER_PAGE_SIZE))
  const currentPage = Math.min(page, customerTotalPages)
  const pagedCustomers = filtered.slice((currentPage - 1) * CUSTOMER_PAGE_SIZE, currentPage * CUSTOMER_PAGE_SIZE)

  async function toggle(customer) {
    if (customer.type === 'GUEST') {
      showToast('Khách vãng lai không có tài khoản để khóa/mở.', 'error')
      return
    }
    try {
      setUpdating(true)
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !customer.active }),
      })
      const result = await response.json()
      if (!result.ok) return showToast(result.message || 'Không thể cập nhật khách hàng.', 'error')
      showToast(customer.active ? 'Đã khóa tài khoản khách hàng.' : 'Đã mở lại tài khoản.')
      setConfirmCustomer(null)
      await load()
    } catch {
      showToast('Không thể kết nối máy chủ khách hàng.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <ProductToast key={toast?.id} toast={toast} onClose={() => setToast(null)} />
      <AdminConfirm
        open={confirmCustomer}
        title={confirmCustomer?.active ? 'Khóa tài khoản khách hàng?' : 'Mở lại tài khoản khách hàng?'}
        message={confirmCustomer?.active ? 'Khách hàng sẽ không thể đăng nhập tài khoản này cho đến khi admin mở lại.' : 'Khách hàng sẽ có thể đăng nhập và xem đơn hàng trong tài khoản.'}
        tone={confirmCustomer?.active ? 'red' : 'emerald'}
        confirmText={confirmCustomer?.active ? 'Xác nhận khóa' : 'Mở lại'}
        busy={updating}
        onCancel={() => setConfirmCustomer(null)}
        onConfirm={() => toggle(confirmCustomer)}
      />

      <div>
        <p className="text-xs font-black uppercase tracking-[.38em] text-primary">Admin Workspace</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-black tracking-[-.04em] text-sole-dark">Khách hàng</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" /> LIVE</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-400">Quản lý khách có tài khoản và khách vãng lai từ đơn hàng.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard title="Tổng khách" value={customers.length} subtitle="Tài khoản + khách vãng lai" tone="orange" trend="+ tổng"><span className="text-lg font-black">K</span></AdminMetricCard>
        <AdminMetricCard title="Có tài khoản" value={stats.registered} subtitle="Đăng nhập và xem đơn riêng" tone="emerald" trend="user"><span className="text-lg font-black">A</span></AdminMetricCard>
        <AdminMetricCard title="Khách vãng lai" value={stats.guests} subtitle="Mua nhanh không cần đăng nhập" tone="blue" trend="guest"><span className="text-lg font-black">G</span></AdminMetricCard>
        <AdminMetricCard title="Doanh thu đã giao" value={formatVND(stats.totalSpent)} subtitle={`${stats.totalOrders} đơn đã ghi nhận`} tone="violet" trend="DELIVERED"><span className="text-lg font-black">Đ</span></AdminMetricCard>
      </div>

      <div className="overflow-hidden rounded-[1.35rem] border border-gray-100 bg-white shadow-[0_18px_54px_rgba(15,23,42,.06)]">
        <div className="border-b border-gray-100 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_118px]">
            <label className="relative block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
              <input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder="Tìm tên, email, số điện thoại, địa chỉ..." className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-bold text-sole-dark shadow-inner outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(242,106,46,.1)]" />
            </label>
            <select value={typeFilter} onChange={event => { setTypeFilter(event.target.value); setPage(1) }} className="h-14 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-sole-dark shadow-sm outline-none transition focus:border-primary">
              <option value="ALL">Tất cả khách</option>
              <option value="REGISTERED">Có tài khoản</option>
              <option value="GUEST">Khách vãng lai</option>
            </select>
            <button onClick={load} className="h-14 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary">↻ Làm mới</button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-sm font-bold text-gray-400">Đang tải khách hàng...</div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 md:hidden">
              {pagedCustomers.length === 0 ? <div className="px-5 py-14 text-center text-sm font-bold text-gray-400">Không tìm thấy khách hàng.</div> : pagedCustomers.map(customer => (
                <article key={customer.id} className="p-4 transition hover:bg-orange-50/35">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3"><CustomerAvatar customer={customer} /><div className="min-w-0"><p className="line-clamp-1 font-black text-sole-dark">{customer.full_name || `${customer.first_name} ${customer.last_name}`}</p><p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{customer.email || customer.phone || 'Chưa có liên hệ'}</p></div></div>
                    <CustomerTypeBadge type={customer.type} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-[#f7f8f9] py-3 text-center">
                    <div><p className="font-black text-sole-dark">{customer.orders_count}</p><p className="text-[10px] font-bold text-gray-400">Đơn</p></div>
                    <div><p className="font-black text-sole-dark">{customer.delivered_count}</p><p className="text-[10px] font-bold text-gray-400">Đã giao</p></div>
                    <div><p className="font-black text-primary">{formatVND(customer.total_spent)}</p><p className="text-[10px] font-bold text-gray-400">Chi tiêu</p></div>
                  </div>
                  <button onClick={() => setSelected(customer)} className="mt-3 w-full rounded-xl border border-gray-200 py-2.5 text-xs font-black text-gray-600 transition hover:border-primary hover:text-primary">Xem chi tiết</button>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="bg-[#f8fafc] text-left text-xs uppercase tracking-wide text-gray-400">
                  <tr><th className="px-5 py-4">Khách hàng</th><th className="px-5 py-4">Liên hệ</th><th className="px-5 py-4">Loại khách</th><th className="px-5 py-4 text-center">Đơn</th><th className="px-5 py-4 text-center">Hủy</th><th className="px-5 py-4 text-right">Đã chi tiêu</th><th className="px-5 py-4">Gần nhất</th><th className="px-5 py-4" /></tr>
                </thead>
                <tbody>
                  {pagedCustomers.map(customer => (
                    <tr key={customer.id} className="border-t border-gray-100 transition hover:bg-orange-50/30">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><CustomerAvatar customer={customer} /><div><p className="font-black text-sole-dark">{customer.full_name || `${customer.first_name} ${customer.last_name}`}</p><p className="text-xs text-gray-400">Tạo từ {new Date(customer.created_at).toLocaleDateString('vi-VN')}</p></div></div></td>
                      <td className="px-5 py-4"><p className="font-bold text-gray-600">{customer.email || 'Chưa có email'}</p><p className="text-xs text-gray-400">{customer.phone || 'Chưa có SĐT'}</p></td>
                      <td className="px-5 py-4"><CustomerTypeBadge type={customer.type} /></td>
                      <td className="px-5 py-4 text-center font-black text-sole-dark">{customer.orders_count}</td>
                      <td className="px-5 py-4 text-center font-black text-red-500">{customer.cancelled_count || 0}</td>
                      <td className="px-5 py-4 text-right font-black text-primary">{formatVND(customer.total_spent)}</td>
                      <td className="px-5 py-4 text-xs font-bold text-gray-400">{customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString('vi-VN') : 'Chưa mua'}</td>
                      <td className="px-5 py-4 text-right"><button onClick={() => setSelected(customer)} className="rounded-full border border-gray-200 px-4 py-2 text-xs font-black transition hover:border-primary hover:text-primary">Chi tiết</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination page={currentPage} totalPages={customerTotalPages} totalItems={filtered.length} pageSize={CUSTOMER_PAGE_SIZE} label="khách hàng" onPageChange={setPage} />
          </>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onMouseDown={() => setSelected(null)}>
          <aside className="h-full w-full max-w-xl overflow-y-auto bg-[#f8fafc] p-5 shadow-2xl" onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center justify-between"><div><h2 className="text-xl font-black text-sole-dark">Chi tiết khách hàng</h2><p className="mt-1 text-xs font-semibold text-gray-400">Theo dõi thông tin và lịch sử đơn cơ bản.</p></div><button onClick={() => setSelected(null)} className="grid size-10 place-items-center rounded-full bg-white text-gray-500 shadow-sm transition hover:text-primary">×</button></div>
            <div className="mt-5 overflow-hidden rounded-[26px] bg-[#111315] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,.24)]"><CustomerTypeBadge type={selected.type} /><p className="mt-5 text-2xl font-black">{selected.full_name || `${selected.first_name} ${selected.last_name}`}</p><p className="mt-2 text-sm text-white/60">{selected.email || 'Chưa có email'} · {selected.phone || 'Chưa có SĐT'}</p>{selected.address && <p className="mt-3 text-sm leading-6 text-white/50">{selected.address}</p>}</div>
            <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs font-bold text-gray-400">Tổng đơn</p><p className="mt-1 text-2xl font-black text-sole-dark">{selected.orders_count}</p></div><div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs font-bold text-gray-400">Đã giao</p><p className="mt-1 text-2xl font-black text-sole-dark">{selected.delivered_count}</p></div><div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs font-bold text-gray-400">Đã hủy</p><p className="mt-1 text-2xl font-black text-red-500">{selected.cancelled_count || 0}</p></div><div className="rounded-2xl bg-orange-50 p-4 shadow-sm"><p className="text-xs font-bold text-primary">Tổng chi tiêu</p><p className="mt-1 text-2xl font-black text-primary">{formatVND(selected.total_spent)}</p></div></div>
            <h3 className="mb-3 mt-6 font-black text-sole-dark">Đơn hàng liên quan</h3>
            <div className="space-y-2">
              {[...(selected.orders || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(order => <div key={order.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"><div><p className="font-mono text-xs font-black text-sole-dark">#{order.id}</p><p className="mt-1 text-[11px] font-semibold text-gray-400">{new Date(order.created_at).toLocaleString('vi-VN')}</p></div><div className="text-right"><p className="text-sm font-black text-primary">{formatVND(order.total)}</p><p className="mt-1 text-[11px] font-bold text-gray-400">{STATUS_LABELS[order.status] || order.status}</p></div></div>)}
              {selected.orders?.length === 0 && <div className="rounded-2xl bg-white p-5 text-center text-sm font-bold text-gray-400">Chưa có đơn hàng.</div>}
            </div>
            {selected.type === 'REGISTERED' ? <button onClick={() => setConfirmCustomer(selected)} className={`mt-6 w-full rounded-2xl py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 ${selected.active ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>{selected.active ? 'Khóa tài khoản' : 'Mở lại tài khoản'}</button> : <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm font-semibold leading-6 text-sky-700">Khách này mua nhanh không đăng nhập, nên không có tài khoản để khóa/mở. Shop vẫn xem được lịch sử đơn dựa trên số điện thoại.</div>}
          </aside>
        </div>
      )}
    </div>
  )
}
