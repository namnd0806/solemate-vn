'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatVND } from '@/lib/utils'
import AdminPagination from '@/components/admin/AdminPagination'
import { AdminConfirm, AdminMetricCard, ProductToast } from '@/components/admin/ProductFeedback'

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xác nhận', hint: 'Đơn mới, cần kiểm tra thông tin', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  CONFIRMED: { label: 'Đã xác nhận', hint: 'Đã chốt đơn, chuẩn bị soạn hàng', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400' },
  PACKING: { label: 'Đang đóng gói', hint: 'Đóng gói và tạo vận đơn ngoài hệ thống', color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
  SHIPPING: { label: 'Đang giao', hint: 'Đơn đã bàn giao vận chuyển', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' },
  DELIVERED: { label: 'Đã giao', hint: 'Đơn hoàn tất', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  CANCELLED: { label: 'Đã hủy', hint: 'Đơn đã hủy và hoàn kho nếu đủ điều kiện', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-400' },
}

const TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKING', 'CANCELLED'],
  PACKING: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

const PAYMENT_METHODS = { COD: 'COD', BANK: 'QR ngân hàng', VISA: 'Visa', MOMO: 'MoMo' }
const CARRIERS = [['GHN', 'GHN'], ['GHTK', 'GHTK'], ['VIETTEL_POST', 'Viettel Post'], ['SHOP', 'Shop tự giao'], ['OTHER', 'Khác']]
const ORDER_PAGE_SIZE = 10
const STATUS_KEYS = Object.keys(STATUS_CONFIG)
const TIME_FILTERS = [
  ['ALL', 'Chọn khoảng thời gian'],
  ['TODAY', 'Hôm nay'],
  ['7D', '7 ngày gần đây'],
  ['30D', '30 ngày gần đây'],
]

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || {}
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black shadow-sm ${c.color || 'border-gray-200 bg-gray-50 text-gray-600'}`}>
      <span className={`grid size-4 place-items-center rounded-full text-[9px] text-white ${c.dot || 'bg-gray-400'}`}>{status === 'CANCELLED' ? '×' : status === 'DELIVERED' ? '✓' : '•'}</span>
      {c.label || status}
    </span>
  )
}

function PaymentBadge({ order }) {
  const paid = order.payment_status === 'PAID'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black shadow-sm ${paid ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
      <span className={`grid size-4 place-items-center rounded-full text-[9px] text-white ${paid ? 'bg-emerald-500' : 'bg-yellow-500'}`}>{paid ? '✓' : '!'}</span>
      {paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
    </span>
  )
}

function InfoBlock({ tone = 'orange', icon, title, children, action }) {
  const toneMap = {
    orange: 'bg-orange-50 text-primary',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
  }
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`grid size-10 place-items-center rounded-xl ${toneMap[tone] || toneMap.orange}`}>{icon}</span>
          <h3 className="font-black text-sole-dark">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [toast, setToast] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [shipping, setShipping] = useState({ carrier: '', tracking: '' })
  const [internalNote, setInternalNote] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [timeFilter, setTimeFilter] = useState('ALL')
  const [confirmAction, setConfirmAction] = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ message: msg, type, id: Date.now() })
    setTimeout(() => setToast(null), 3200)
  }

  async function refreshOrders() {
    setLoading(true)
    const res = await fetch('/api/orders')
    const data = await res.json()
    if (data.ok) {
      const nextOrders = data.data.orders || []
      setOrders(nextOrders)
      setSelected(current => {
        if (current) return nextOrders.find(o => o.id === current.id) || current
        return nextOrders[0] || null
      })
    } else {
      showToast(data.message || 'Không tải được đơn hàng.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    let ignore = false
    async function run() {
      setLoading(true)
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (ignore) return
      if (data.ok) {
        const nextOrders = data.data.orders || []
        setOrders(nextOrders)
        setSelected(current => {
          if (current) return nextOrders.find(o => o.id === current.id) || current
          return nextOrders[0] || null
        })
      } else {
        showToast(data.message || 'Không tải được đơn hàng.', 'error')
      }
      setLoading(false)
    }
    run()
    return () => { ignore = true }
  }, [])

  function selectOrder(order) {
    setSelected(order)
    setShipping({ carrier: order.shipping_carrier || '', tracking: order.tracking || '' })
    setInternalNote(order.internal_note || '')
  }

  async function reloadSelected(orderId) {
    const res = await fetch(`/api/orders/${orderId}`)
    const data = await res.json()
    if (data.ok) {
      setSelected(data.data)
      setOrders(list => list.map(o => o.id === orderId ? data.data : o))
      setShipping({ carrier: data.data.shipping_carrier || '', tracking: data.data.tracking || '' })
      setInternalNote(data.data.internal_note || '')
    }
  }

  async function patchOrder(payload, successMessage) {
    if (!selected) return
    setUpdating(true)
    const res = await fetch(`/api/orders/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setUpdating(false)
    if (!data.ok) {
      showToast(data.message || 'Cập nhật thất bại.', 'error')
      return
    }
    showToast(successMessage)
    await reloadSelected(selected.id)
  }

  function requestConfirm(config) {
    setConfirmAction(config)
  }

  async function runConfirmedAction() {
    const action = confirmAction?.action
    if (!action) return
    await action()
    setConfirmAction(null)
  }

  async function changeStatus(status) {
    requestConfirm({
      title: `Chuyển đơn sang ${STATUS_CONFIG[status]?.label}?`,
      message: status === 'DELIVERED'
        ? 'Đơn sẽ được ghi nhận hoàn tất, chốt thanh toán nếu còn chưa thanh toán và được tính vào doanh thu đã giao.'
        : 'Trạng thái đơn sẽ được cập nhật và lưu vào lịch sử xử lý để nhân viên khác theo dõi.',
      tone: status === 'DELIVERED' ? 'emerald' : 'orange',
      confirmText: 'Xác nhận chuyển',
      action: async () => {
        if (status === 'SHIPPING') {
          await patchOrder({ status, shippingCarrier: shipping.carrier, tracking: shipping.tracking, note: `Chuyển sang ${STATUS_CONFIG[status].label}` }, 'Đã chuyển sang đang giao.')
          return
        }
        await patchOrder({ status, note: `Chuyển sang ${STATUS_CONFIG[status].label}` }, `Đã chuyển sang ${STATUS_CONFIG[status].label}.`)
      },
    })
  }

  async function saveShipping() {
    requestConfirm({
      title: 'Lưu vận chuyển và ghi chú?',
      message: 'Thông tin vận chuyển, mã vận đơn và ghi chú nội bộ sẽ được cập nhật cho đơn hiện tại.',
      tone: 'dark',
      confirmText: 'Lưu thay đổi',
      action: async () => {
        await patchOrder({ shippingCarrier: shipping.carrier, tracking: shipping.tracking, internalNote, note: 'Cập nhật vận chuyển/ghi chú' }, 'Đã lưu thông tin đơn hàng.')
      },
    })
  }

  async function cancelOrder() {
    if (!cancelTarget || !cancelReason.trim()) {
      showToast('Vui lòng nhập lý do hủy đơn.', 'error')
      return
    }
    setUpdating(true)
    const res = await fetch(`/api/orders/${cancelTarget.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: cancelReason.trim() }),
    })
    const data = await res.json()
    setUpdating(false)
    if (!data.ok) {
      showToast(data.message || 'Hủy đơn thất bại.', 'error')
      return
    }
    showToast('Đã hủy đơn và hoàn kho.')
    setCancelTarget(null)
    setCancelReason('')
    await reloadSelected(cancelTarget.id)
  }

  const stats = useMemo(() => {
    const statusCounts = STATUS_KEYS.reduce((acc, status) => ({ ...acc, [status]: 0 }), {})
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    })
    const total = orders.length
    const cancelled = statusCounts.CANCELLED || 0
    return {
      total,
      statusCounts,
      action: (statusCounts.PENDING || 0) + (statusCounts.CONFIRMED || 0) + (statusCounts.PACKING || 0),
      operating: (statusCounts.PACKING || 0) + (statusCounts.SHIPPING || 0),
      revenue: orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.total, 0),
      cancelRate: total ? Math.round((cancelled / total) * 100) : 0,
      cancelled,
    }
  }, [orders])

  const visibleOrders = useMemo(() => {
    const now = new Date()
    const keyword = search.trim().toLowerCase()
    return orders.filter(order => {
      if (filterStatus && order.status !== filterStatus) return false
      if (timeFilter !== 'ALL') {
        const created = new Date(order.created_at)
        const diffDays = (now - created) / 86400000
        if (timeFilter === 'TODAY' && created.toDateString() !== now.toDateString()) return false
        if (timeFilter === '7D' && diffDays > 7) return false
        if (timeFilter === '30D' && diffDays > 30) return false
      }
      if (!keyword) return true
      const haystack = [
        order.id,
        order.contact?.fullName,
        order.contact?.phone,
        PAYMENT_METHODS[order.payment_method],
        order.payment_method,
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(keyword)
    })
  }, [orders, filterStatus, search, timeFilter])

  const nextStatuses = selected ? TRANSITIONS[selected.status] || [] : []
  const sortedEvents = [...(selected?.order_events || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div className="space-y-6">
      <ProductToast key={toast?.id} toast={toast} onClose={() => setToast(null)} />
      <AdminConfirm
        open={confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        tone={confirmAction?.tone}
        confirmText={confirmAction?.confirmText}
        busy={updating}
        onCancel={() => setConfirmAction(null)}
        onConfirm={runConfirmedAction}
      />

      {cancelTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-sole-dark">Hủy đơn #{cancelTarget.id}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">Đơn sẽ chuyển sang đã hủy và tồn kho được hoàn lại. Vui lòng ghi lý do để nhân viên khác nắm được.</p>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} placeholder="VD: Khách yêu cầu hủy, sai số điện thoại, hết hàng..." className="mt-4 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" />
            <div className="mt-5 flex gap-3">
              <button onClick={() => setCancelTarget(null)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Giữ lại</button>
              <button onClick={cancelOrder} disabled={updating} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50">Xác nhận hủy</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-black uppercase tracking-[.38em] text-primary">Admin Workspace</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black tracking-tight text-sole-dark">Đơn hàng</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" /> LIVE
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-gray-400">Xử lý đơn theo trạng thái vận hành.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminMetricCard title="Tổng đơn" value={stats.total} subtitle="Toàn bộ đơn trong hệ thống" tone="orange" trend="+12%"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg></AdminMetricCard>
        <AdminMetricCard title="Cần xử lý" value={stats.action} subtitle="Chờ xác nhận, đã xác nhận, đóng gói" tone="blue" trend="+3%"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="9" /></svg></AdminMetricCard>
        <AdminMetricCard title="Đang vận hành" value={stats.operating} subtitle="Đang đóng gói và đang giao" tone="emerald" trend="+50%"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 7h11v10H3z" /><path d="M14 11h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg></AdminMetricCard>
        <AdminMetricCard title="Doanh thu đã giao" value={formatVND(stats.revenue)} subtitle="Chỉ tính đơn đã giao hoàn tất" tone="violet" trend="+18%"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 20V10m7 10V4m7 16v-7" /><path d="M4 20h16" /></svg></AdminMetricCard>
        <AdminMetricCard title="Tỉ lệ hủy" value={`${stats.cancelRate}%`} subtitle={`${stats.cancelled} đơn đã hủy trên ${stats.total || 0} đơn`} tone="red" trend="+2%"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></svg></AdminMetricCard>
      </div>

      <div className="flex flex-wrap gap-2">
        {[['', 'Tất cả', stats.total], ...Object.entries(STATUS_CONFIG).map(([key, value]) => [key, value.label, stats.statusCounts[key] || 0])].map(([value, label, count]) => (
          <button key={value} onClick={() => { setFilterStatus(value); setPage(1) }} className={`group inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black shadow-sm transition duration-300 ${filterStatus === value ? 'border-primary bg-gradient-to-r from-primary to-orange-500 text-white shadow-orange-200' : 'border-gray-100 bg-white text-gray-600 hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50 hover:text-primary hover:shadow-md'}`}>
            <span>{label}</span>
            <span className={`min-w-7 rounded-full px-2 py-0.5 text-center text-xs ${filterStatus === value ? 'bg-white/25 text-white' : 'bg-white text-gray-500 shadow-sm group-hover:text-primary'}`}>{count}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="overflow-hidden rounded-[1.35rem] border border-gray-100 bg-white shadow-[0_18px_54px_rgba(15,23,42,.06)]">
          <div className="border-b border-gray-100 bg-white p-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_116px]">
              <label className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
                <input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder="Tìm đơn hàng, khách hàng hoặc số điện thoại..." className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-14 text-sm font-bold text-sole-dark shadow-inner outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(242,106,46,.1)]" />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-black text-gray-400">⌘ K</span>
              </label>
              <select value={timeFilter} onChange={event => { setTimeFilter(event.target.value); setPage(1) }} className="h-14 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-sole-dark shadow-sm outline-none transition hover:border-orange-100 focus:border-primary">
                {TIME_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <button type="button" onClick={refreshOrders} className="h-14 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary">↻ Làm mới</button>
            </div>
          </div>
          {(() => {
            const orderTotalPages = Math.max(1, Math.ceil(visibleOrders.length / ORDER_PAGE_SIZE))
            const currentPage = Math.min(page, orderTotalPages)
            const pagedOrders = visibleOrders.slice((currentPage - 1) * ORDER_PAGE_SIZE, currentPage * ORDER_PAGE_SIZE)
            return (
              <>
          <div className="divide-y divide-gray-100 md:hidden">
            {loading ? [...Array(5)].map((_, i) => <div key={i} className="p-4"><div className="h-20 animate-pulse rounded-2xl bg-gray-100" /></div>) : pagedOrders.map(order => (
              <button key={order.id} type="button" onClick={() => selectOrder(order)} className={`block w-full p-4 text-left transition hover:bg-orange-50/35 ${selected?.id === order.id ? 'bg-primary/5' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-black text-sole-dark">#{order.id}</p>
                    <p className="mt-1 text-xs text-gray-400">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-black text-sole-dark">{order.contact?.fullName || 'Khách'}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{order.contact?.phone || 'Chưa có SĐT'} · {PAYMENT_METHODS[order.payment_method] || order.payment_method}</p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-primary">{formatVND(order.total)}</p>
                </div>
              </button>
            ))}
            {!loading && visibleOrders.length === 0 && <div className="py-12 text-center text-gray-400">Không có đơn hàng</div>}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-[#f8fafc]">
                <tr>
                  <th className="w-12 px-5 py-4"><span className="block size-5 rounded-md border border-gray-300 bg-white" /></th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-500">Đơn ↕</th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-500">Khách ↕</th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-500">Trạng thái ↕</th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-500">Thanh toán ↕</th>
                  <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-wide text-gray-500">Tổng ↕</th>
                  <th className="w-16 px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-gray-100" /></td></tr>) : pagedOrders.map(order => (
                  <tr key={order.id} onClick={() => selectOrder(order)} className={`cursor-pointer border-b border-gray-100 transition hover:bg-orange-50/30 ${selected?.id === order.id ? 'bg-orange-50/70 shadow-[inset_4px_0_0_#f26a2e]' : ''}`}>
                    <td className="px-5 py-4"><span className={`grid size-5 place-items-center rounded-md border text-xs font-black ${selected?.id === order.id ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-white'}`}>✓</span></td>
                    <td className="px-4 py-3"><div className="font-mono text-xs font-black text-sole-dark">#{order.id}</div><div className="mt-1 text-xs text-gray-400">{new Date(order.created_at).toLocaleString('vi-VN')}</div></td>
                    <td className="px-4 py-3"><div className="font-bold text-gray-700">{order.contact?.fullName || 'Khách'}</div><div className="text-xs text-gray-400">{order.contact?.phone}</div></td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3"><div className="text-xs font-bold text-gray-600">{PAYMENT_METHODS[order.payment_method] || order.payment_method}</div><div className="mt-1"><PaymentBadge order={order} /></div></td>
                    <td className="px-4 py-3 text-right font-black text-primary">{formatVND(order.total)}</td>
                    <td className="px-5 py-3 text-right"><span className="inline-grid size-9 place-items-center rounded-full border border-gray-100 bg-white text-lg text-sole-dark shadow-sm transition group-hover:text-primary">›</span></td>
                  </tr>
                ))}
                {!loading && visibleOrders.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">Không có đơn hàng</td></tr>}
              </tbody>
            </table>
          </div>
          <AdminPagination page={currentPage} totalPages={orderTotalPages} totalItems={visibleOrders.length} pageSize={ORDER_PAGE_SIZE} label="đơn hàng" onPageChange={setPage} />
              </>
            )
          })()}
        </div>

        {selected ? (
          <aside className="overflow-hidden rounded-[1.35rem] border border-gray-100 bg-[#f8fafc] shadow-[0_18px_54px_rgba(15,23,42,.06)]">
            <div className="border-b border-gray-100 bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-sole-dark">Chi tiết đơn hàng</h2>
                  <div className="mt-1 font-mono text-sm font-black text-blue-900">#{selected.id}</div>
                  <p className="mt-1 text-xs text-gray-400">{new Date(selected.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>
            </div>

            <div className="max-h-[calc(100vh-230px)] space-y-4 overflow-y-auto p-4">
              <InfoBlock title="Thông tin khách hàng" icon="♙" tone="orange">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs font-bold text-gray-400">Tên khách hàng</p><p className="mt-1 font-black text-sole-dark">{selected.contact?.fullName || 'Khách'}</p></div>
                  <div><p className="text-xs font-bold text-gray-400">Số điện thoại</p><p className="mt-1 font-black text-sole-dark">{selected.contact?.phone || '-'}</p></div>
                  <div className="col-span-2"><p className="text-xs font-bold text-gray-400">Địa chỉ</p><p className="mt-1 leading-6 text-gray-600">{selected.contact?.address}, {selected.contact?.ward}, {selected.contact?.district}, {selected.contact?.province}</p></div>
                </div>
                {selected.note && <div className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-gray-600">Ghi chú khách: {selected.note}</div>}
              </InfoBlock>

              <InfoBlock title="Thông tin thanh toán" icon="▣" tone="violet">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs font-bold text-gray-400">Phương thức</p><p className="mt-1 font-black text-sole-dark">{PAYMENT_METHODS[selected.payment_method]}</p></div>
                  <div><p className="text-xs font-bold text-gray-400">Trạng thái thanh toán</p><div className="mt-1"><PaymentBadge order={selected} /></div></div>
                  <div><p className="text-xs font-bold text-gray-400">Mã giao dịch</p><p className="mt-1 font-black text-sole-dark">{selected.payment_transaction || selected.bank_transfer_code || 'SMB123456789'}</p></div>
                  <div><p className="text-xs font-bold text-gray-400">Thời gian thanh toán</p><p className="mt-1 font-semibold text-gray-500">{selected.paid_at ? new Date(selected.paid_at).toLocaleString('vi-VN') : '-'}</p></div>
                </div>
              </InfoBlock>

              <InfoBlock title="Tổng tiền" icon="▤" tone="emerald">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4 text-gray-600"><span>Tạm tính</span><span className="font-bold text-sole-dark">{formatVND(selected.subtotal)}</span></div>
                  <div className="flex justify-between gap-4 text-gray-600"><span>Phí vận chuyển</span><span className="font-bold text-sole-dark">{selected.shipping_fee === 0 ? 'Miễn phí' : formatVND(selected.shipping_fee)}</span></div>
                  <div className="flex justify-between gap-4 text-gray-600"><span>Giảm giá</span><span className="font-bold text-sole-dark">{selected.discount > 0 ? `-${formatVND(selected.discount)}` : '0 đ'}</span></div>
                  <div className="mt-3 flex justify-between rounded-xl bg-orange-50 px-3 py-3 text-base font-black"><span>Tổng thanh toán</span><span className="text-primary">{formatVND(selected.total)}</span></div>
                </div>
              </InfoBlock>

              <InfoBlock title="Sản phẩm" icon="□" tone="blue">
                <div className="space-y-3">
                  {selected.order_items?.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3"><div className="min-w-0"><p className="line-clamp-1 text-sm font-black text-sole-dark">{item.name}</p><p className="mt-1 text-xs text-gray-400">{item.sku} · {item.color} · Size {item.size} · ×{item.qty}</p></div><div className="shrink-0 text-sm font-black text-primary">{formatVND(item.line_total)}</div></div>)}
                </div>
              </InfoBlock>

              <InfoBlock title="Vận chuyển" icon="▰" tone="emerald">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">Đơn vị vận chuyển</label><select value={shipping.carrier} onChange={e => setShipping(p => ({ ...p, carrier: e.target.value }))} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold outline-none transition focus:border-primary"><option value="">Chọn đơn vị</option>{CARRIERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                  <div><label className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">Mã vận đơn</label><input value={shipping.tracking} onChange={e => setShipping(p => ({ ...p, tracking: e.target.value }))} placeholder="VD: GHTK123..." className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold outline-none transition focus:border-primary" /></div>
                </div>
              </InfoBlock>

              <InfoBlock title="Ghi chú nội bộ" icon="▨" tone="violet">
                <textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} rows={2} placeholder="Ghi chú cho nhân viên xử lý đơn..." className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold outline-none transition focus:border-primary" />
                <button onClick={saveShipping} disabled={updating} className="mt-3 w-full rounded-xl bg-sole-dark px-4 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(15,23,42,.18)] transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:opacity-50">Lưu vận chuyển/ghi chú</button>
              </InfoBlock>

              {nextStatuses.length > 0 && (
                <section>
                  <p className="mb-2 text-xs font-black uppercase tracking-wide text-gray-400">Thao tác tiếp theo</p>
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses.filter(status => status !== 'CANCELLED').map(status => <button key={status} onClick={() => changeStatus(status)} disabled={updating} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-orange-600 disabled:opacity-50">Chuyển sang {STATUS_CONFIG[status]?.label}</button>)}
                    {nextStatuses.includes('CANCELLED') && <button onClick={() => { setCancelTarget(selected); setCancelReason('') }} disabled={updating} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-black text-red-500 hover:bg-red-50 disabled:opacity-50">Hủy đơn</button>}
                  </div>
                </section>
              )}

              <section>
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-gray-400">Lịch sử xử lý</p>
                {sortedEvents.length === 0 ? <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-400">Chưa có lịch sử thao tác.</div> : (
                  <div className="space-y-2">
                    {sortedEvents.map(event => <div key={event.id} className="rounded-xl border border-gray-100 px-4 py-3 text-sm"><div className="flex justify-between gap-3"><span className="font-bold text-sole-dark">{event.event_type === 'CANCEL' ? 'Hủy đơn' : event.event_type === 'STATUS_CHANGE' ? 'Đổi trạng thái' : 'Cập nhật đơn'}</span><span className="text-xs text-gray-400">{new Date(event.created_at).toLocaleString('vi-VN')}</span></div>{(event.from_status || event.to_status) && <p className="mt-1 text-xs text-gray-500">{STATUS_CONFIG[event.from_status]?.label || event.from_status} → {STATUS_CONFIG[event.to_status]?.label || event.to_status}</p>}{event.note && <p className="mt-1 text-xs text-gray-500">{event.note}</p>}</div>)}
                  </div>
                )}
              </section>
            </div>
          </aside>
        ) : <aside className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-400">Chọn một đơn hàng để xử lý.</aside>}
      </div>
    </div>
  )
}
