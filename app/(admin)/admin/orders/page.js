'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatVND } from '@/lib/utils'
import AdminPagination from '@/components/admin/AdminPagination'
import { ProductToast } from '@/components/admin/ProductFeedback'

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

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || {}
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${c.color || 'border-gray-200 bg-gray-50 text-gray-600'}`}>
      <span className={`size-1.5 rounded-full ${c.dot || 'bg-gray-400'}`} />
      {c.label || status}
    </span>
  )
}

function PaymentBadge({ order }) {
  const paid = order.payment_status === 'PAID'
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${paid ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
      {paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
    </span>
  )
}

function MetricCard({ title, value, subtitle, tone = 'orange', trend, mini }) {
  const toneMap = {
    orange: { gradient: 'from-orange-50 via-white to-white', iconText: 'text-primary', iconBg: 'bg-orange-100', borderColor: 'border-orange-100' },
    blue: { gradient: 'from-blue-50 via-white to-white', iconText: 'text-blue-600', iconBg: 'bg-blue-100', borderColor: 'border-blue-100' },
    emerald: { gradient: 'from-emerald-50 via-white to-white', iconText: 'text-emerald-600', iconBg: 'bg-emerald-100', borderColor: 'border-emerald-100' },
    violet: { gradient: 'from-violet-50 via-white to-white', iconText: 'text-violet-600', iconBg: 'bg-violet-100', borderColor: 'border-violet-100' },
    red: { gradient: 'from-rose-50 via-white to-white', iconText: 'text-rose-600', iconBg: 'bg-rose-100', borderColor: 'border-rose-100' },
  }
  const { gradient, iconText, iconBg, borderColor } = toneMap[tone] || toneMap.orange

  return (
    <div className={`group relative overflow-hidden rounded-[1.35rem] border ${borderColor} bg-gradient-to-br ${gradient} p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl`}>
      <div className="absolute -right-8 -top-10 size-24 rounded-full bg-white/60 blur-2xl transition group-hover:scale-125" />
      <div className="relative flex items-start gap-3">
        <div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${iconBg} ${iconText} shadow-inner`}>
          <span className="text-lg font-black">{mini}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 text-2xl font-black leading-tight text-sole-dark">{value}</div>
            {trend && <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-black text-emerald-600 shadow-sm">{trend}</span>}
          </div>
          <p className="mt-1 text-sm font-black text-sole-dark">{title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="relative mt-3 flex h-7 items-end justify-end gap-1 opacity-70">
        {[34, 48, 62, 82].map((height, index) => (
          <span key={height} className={`w-2 rounded-full ${iconBg}`} style={{ height: `${height}%`, animationDelay: `${index * 80}ms` }} />
        ))}
      </div>
    </div>
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

  function showToast(msg, type = 'success') {
    setToast({ message: msg, type, id: Date.now() })
    setTimeout(() => setToast(null), 3200)
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
        setSelected(current => current ? nextOrders.find(o => o.id === current.id) || current : null)
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

  async function changeStatus(status) {
    if (status === 'SHIPPING') {
      await patchOrder({ status, shippingCarrier: shipping.carrier, tracking: shipping.tracking, note: `Chuyển sang ${STATUS_CONFIG[status].label}` }, 'Đã chuyển sang đang giao.')
      return
    }
    await patchOrder({ status, note: `Chuyển sang ${STATUS_CONFIG[status].label}` }, `Đã chuyển sang ${STATUS_CONFIG[status].label}.`)
  }

  async function saveShipping() {
    await patchOrder({ shippingCarrier: shipping.carrier, tracking: shipping.tracking, internalNote, note: 'Cập nhật vận chuyển/ghi chú' }, 'Đã lưu thông tin đơn hàng.')
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

  const visibleOrders = useMemo(() => (
    filterStatus ? orders.filter(order => order.status === filterStatus) : orders
  ), [orders, filterStatus])

  const nextStatuses = selected ? TRANSITIONS[selected.status] || [] : []
  const sortedEvents = [...(selected?.order_events || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div className="space-y-6">
      <ProductToast key={toast?.id} toast={toast} onClose={() => setToast(null)} />

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
        <h1 className="text-2xl font-black text-sole-dark">Quản lý đơn hàng</h1>
        <p className="mt-1 text-sm text-gray-400">Xử lý đơn theo luồng: xác nhận, đóng gói, giao hàng, hoàn tất.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Tổng đơn" value={stats.total} subtitle="Toàn bộ đơn trong hệ thống" tone="orange" trend="+ tổng quan" mini="T" />
        <MetricCard title="Cần xử lý" value={stats.action} subtitle="Chờ xác nhận, đã xác nhận, đóng gói" tone="blue" trend={`${stats.statusCounts.PENDING || 0} mới`} mini="X" />
        <MetricCard title="Đang vận hành" value={stats.operating} subtitle="Đang đóng gói và đang giao" tone="emerald" trend={`${stats.statusCounts.SHIPPING || 0} giao`} mini="V" />
        <MetricCard title="Doanh thu đã giao" value={formatVND(stats.revenue)} subtitle="Chỉ tính đơn đã giao hoàn tất" tone="violet" trend="thực thu" mini="Đ" />
        <MetricCard title="Tỉ lệ hủy" value={`${stats.cancelRate}%`} subtitle={`${stats.cancelled} đơn đã hủy trên ${stats.total || 0} đơn`} tone="red" trend="rủi ro" mini="H" />
      </div>

      <div className="flex flex-wrap gap-2 rounded-[1.35rem] border border-gray-100 bg-white/90 p-2 shadow-sm backdrop-blur">
        {[['', 'Tất cả', stats.total], ...Object.entries(STATUS_CONFIG).map(([key, value]) => [key, value.label, stats.statusCounts[key] || 0])].map(([value, label, count]) => (
          <button key={value} onClick={() => { setFilterStatus(value); setPage(1) }} className={`group inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition duration-300 ${filterStatus === value ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg shadow-orange-200' : 'border border-gray-100 bg-gray-50 text-gray-600 hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50 hover:text-primary'}`}>
            <span>{label}</span>
            <span className={`min-w-7 rounded-full px-2 py-0.5 text-center text-xs ${filterStatus === value ? 'bg-white/25 text-white' : 'bg-white text-gray-500 shadow-sm group-hover:text-primary'}`}>{count}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
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
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-gray-500">Đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-gray-500">Khách</th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-gray-500">Thanh toán</th>
                  <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-gray-500">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-gray-100" /></td></tr>) : pagedOrders.map(order => (
                  <tr key={order.id} onClick={() => selectOrder(order)} className={`cursor-pointer border-b border-gray-50 transition hover:bg-gray-50 ${selected?.id === order.id ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-3"><div className="font-mono text-xs font-black text-sole-dark">#{order.id}</div><div className="mt-1 text-xs text-gray-400">{new Date(order.created_at).toLocaleString('vi-VN')}</div></td>
                    <td className="px-4 py-3"><div className="font-bold text-gray-700">{order.contact?.fullName || 'Khách'}</div><div className="text-xs text-gray-400">{order.contact?.phone}</div></td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3"><div className="text-xs font-bold text-gray-600">{PAYMENT_METHODS[order.payment_method] || order.payment_method}</div><div className="mt-1"><PaymentBadge order={order} /></div></td>
                    <td className="px-4 py-3 text-right font-black text-primary">{formatVND(order.total)}</td>
                  </tr>
                ))}
                {!loading && visibleOrders.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-400">Không có đơn hàng</td></tr>}
              </tbody>
            </table>
          </div>
          <AdminPagination page={currentPage} totalPages={orderTotalPages} totalItems={visibleOrders.length} pageSize={ORDER_PAGE_SIZE} label="đơn hàng" onPageChange={setPage} />
              </>
            )
          })()}
        </div>

        {selected ? (
          <aside className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div><div className="font-mono text-sm font-black text-sole-dark">#{selected.id}</div><p className="mt-1 text-xs text-gray-400">{STATUS_CONFIG[selected.status]?.hint}</p></div>
                <StatusBadge status={selected.status} />
              </div>
            </div>

            <div className="max-h-[calc(100vh-250px)] space-y-5 overflow-y-auto p-5">
              <section className="rounded-xl bg-gray-50 p-4 text-sm">
                <div className="font-black text-sole-dark">{selected.contact?.fullName}</div>
                <div className="mt-1 text-gray-500">{selected.contact?.phone}</div>
                <div className="mt-1 leading-6 text-gray-500">{selected.contact?.address}, {selected.contact?.ward}, {selected.contact?.district}, {selected.contact?.province}</div>
                {selected.note && <div className="mt-2 rounded-lg bg-white px-3 py-2 text-gray-500">Ghi chú khách: {selected.note}</div>}
              </section>

              <section>
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-gray-400">Sản phẩm</p>
                <div className="space-y-2">
                  {selected.order_items?.map(item => <div key={item.id} className="flex justify-between gap-3 border-b border-gray-50 py-2 last:border-0"><div><p className="text-sm font-bold text-sole-dark">{item.name}</p><p className="text-xs text-gray-400">{item.sku} · {item.color} · Size {item.size} · x{item.qty}</p></div><div className="whitespace-nowrap text-sm font-black text-primary">{formatVND(item.line_total)}</div></div>)}
                </div>
              </section>

              <section className="rounded-xl bg-gray-50 p-4 text-sm">
                <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{formatVND(selected.subtotal)}</span></div>
                {selected.discount > 0 && <div className="mt-1 flex justify-between text-emerald-600"><span>Giảm giá {selected.promo_code && `(${selected.promo_code})`}</span><span>-{formatVND(selected.discount)}</span></div>}
                <div className="mt-1 flex justify-between text-gray-600"><span>Vận chuyển</span><span>{selected.shipping_fee === 0 ? 'Miễn phí' : formatVND(selected.shipping_fee)}</span></div>
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-black"><span>Tổng</span><span className="text-primary">{formatVND(selected.total)}</span></div>
              </section>

              <section className="grid gap-3 rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between gap-3"><span className="text-sm font-bold text-gray-600">{PAYMENT_METHODS[selected.payment_method]}</span><PaymentBadge order={selected} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">Đơn vị vận chuyển</label><select value={shipping.carrier} onChange={e => setShipping(p => ({ ...p, carrier: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"><option value="">Chọn đơn vị</option>{CARRIERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                  <div><label className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">Mã vận đơn</label><input value={shipping.tracking} onChange={e => setShipping(p => ({ ...p, tracking: e.target.value }))} placeholder="VD: GHTK123..." className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" /></div>
                </div>
                <div><label className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-400">Ghi chú nội bộ</label><textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} rows={2} placeholder="Ghi chú cho nhân viên xử lý đơn..." className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" /></div>
                <button onClick={saveShipping} disabled={updating} className="rounded-xl bg-sole-dark px-4 py-2.5 text-sm font-black text-white hover:bg-gray-800 disabled:opacity-50">Lưu vận chuyển/ghi chú</button>
              </section>

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
