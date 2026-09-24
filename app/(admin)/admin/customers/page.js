'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatVND } from '@/lib/utils'
import { ProductToast } from '@/components/admin/ProductFeedback'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    const response = await fetch('/api/customers')
    const result = await response.json()
    if (result.ok) setCustomers(result.data || [])
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return customers
    return customers.filter(customer =>
      `${customer.first_name} ${customer.last_name} ${customer.email} ${customer.phone || ''}`.toLowerCase().includes(keyword)
    )
  }, [customers, search])

  async function toggle(customer) {
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !customer.active }),
      })
      const result = await response.json()
      if (!result.ok) return showToast(result.message || 'Không thể cập nhật khách hàng.', 'error')
      showToast(customer.active ? 'Đã khóa tài khoản khách hàng.' : 'Đã mở lại tài khoản.')
      setSelected(null)
      load()
    } catch {
      showToast('Không thể kết nối máy chủ khách hàng.', 'error')
    }
  }

  const activeCount = customers.filter(customer => customer.active).length
  const totalSpent = customers.reduce((sum, customer) => sum + customer.total_spent, 0)

  return (
    <div className="space-y-6">
      <ProductToast key={toast?.id} toast={toast} onClose={() => setToast(null)} />
      <div>
        <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Customer management</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-sole-dark">Khách hàng</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Tổng thành viên', customers.length], ['Đang hoạt động', activeCount], ['Doanh thu thành viên', formatVND(totalSpent)],
        ].map(([label, value]) => <div key={label} className="rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_35px_rgba(20,23,28,.06)]"><p className="text-xs font-bold text-gray-400">{label}</p><p className="mt-2 text-2xl font-black text-sole-dark">{value}</p></div>)}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_12px_35px_rgba(20,23,28,.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
          <h2 className="font-black text-sole-dark">Danh sách thành viên</h2>
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm tên, email, số điện thoại..." className="form-field max-w-sm" />
        </div>
        {loading ? <div className="p-16 text-center text-sm text-gray-400">Đang tải...</div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm">
            <thead className="bg-[#f7f8f9] text-left text-xs uppercase tracking-wide text-gray-400"><tr><th className="px-5 py-3">Khách hàng</th><th className="px-5 py-3">Liên hệ</th><th className="px-5 py-3 text-center">Đơn hàng</th><th className="px-5 py-3 text-right">Đã chi tiêu</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3" /></tr></thead>
            <tbody>{filtered.map(customer => <tr key={customer.id} className="border-t border-gray-100 transition hover:bg-orange-50/30">
              <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-primary/10 font-black text-primary">{customer.first_name?.[0]}{customer.last_name?.[0]}</span><div><p className="font-bold text-sole-dark">{customer.first_name} {customer.last_name}</p><p className="text-xs text-gray-400">Tham gia {new Date(customer.created_at).toLocaleDateString('vi-VN')}</p></div></div></td>
              <td className="px-5 py-4"><p>{customer.email}</p><p className="text-xs text-gray-400">{customer.phone || 'Chưa có SĐT'}</p></td>
              <td className="px-5 py-4 text-center font-bold">{customer.orders_count}</td>
              <td className="px-5 py-4 text-right font-black text-primary">{formatVND(customer.total_spent)}</td>
              <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${customer.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{customer.active ? 'Hoạt động' : 'Đã khóa'}</span></td>
              <td className="px-5 py-4 text-right"><button onClick={() => setSelected(customer)} className="rounded-full border border-gray-200 px-4 py-2 text-xs font-bold transition hover:border-primary hover:text-primary">Chi tiết</button></td>
            </tr>)}</tbody>
          </table></div>
        )}
      </div>

      {selected && <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onMouseDown={() => setSelected(null)}>
        <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl" onMouseDown={event => event.stopPropagation()}>
          <div className="flex items-center justify-between"><h2 className="text-xl font-black">Chi tiết khách hàng</h2><button onClick={() => setSelected(null)} className="grid size-9 place-items-center rounded-full bg-gray-100">✕</button></div>
          <div className="mt-8 rounded-[22px] bg-[#111315] p-6 text-white"><p className="text-2xl font-black">{selected.first_name} {selected.last_name}</p><p className="mt-2 text-sm text-white/60">{selected.email} · {selected.phone || 'Chưa có SĐT'}</p></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Tổng đơn</p><p className="mt-1 text-xl font-black">{selected.orders_count}</p></div><div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Đã giao</p><p className="mt-1 text-xl font-black">{selected.delivered_count}</p></div></div>
          <div className="mt-3 rounded-2xl bg-orange-50 p-4"><p className="text-xs font-bold text-primary">Tổng chi tiêu</p><p className="mt-1 text-2xl font-black text-primary">{formatVND(selected.total_spent)}</p></div>
          <h3 className="mb-3 mt-7 font-black">Đơn hàng gần đây</h3>
          <div className="space-y-2">{[...(selected.orders || [])].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,6).map(order => <div key={order.id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-3"><div><p className="text-xs font-black">{order.id}</p><p className="text-[11px] text-gray-400">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p></div><div className="text-right"><p className="text-sm font-black">{formatVND(order.total)}</p><p className="text-[11px] text-gray-400">{order.status}</p></div></div>)}</div>
          <button onClick={() => toggle(selected)} className={`mt-8 w-full rounded-full py-3 text-sm font-black text-white ${selected.active ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>{selected.active ? 'Khóa tài khoản' : 'Mở lại tài khoản'}</button>
        </aside>
      </div>}
    </div>
  )
}
