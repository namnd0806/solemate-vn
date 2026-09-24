'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatVND } from '@/lib/utils'

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

const PAYMENT_METHODS = { COD: '💵 COD', BANK: '🏦 QR ngân hàng', VISA: '💳 Visa', MOMO: '💜 MoMo' }
const CARRIERS = [['GHN', 'GHN'], ['GHTK', 'GHTK'], ['VIETTEL_POST', 'Viettel Post'], ['SHOP', 'Shop tự giao'], ['OTHER', 'Khác']]

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

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  useEffect(() => {
    let ignore = false
    async function run() {
      setLoading(true)
      const url = filterStatus ? `/api/orders?status=${filterStatus}` : '/api/orders'
      const res = await fetch(url)
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
  }, [filterStatus])

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

  const stats = useMemo(() => ({
    total: orders.length,
    action: orders.filter(o => ['PENDING', 'CONFIRMED', 'PACKING'].includes(o.status)).length,
    shipping: orders.filter(o => o.status === 'SHIPPING').length,
    revenue: orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.total, 0),
  }), [orders])

  const nextStatuses = selected ? TRANSITIONS[selected.status] || [] : []
  const sortedEvents = [...(selected?.order_events || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div className="space-y-6">
      {toast && <div className={`fixed right-4 top-4 z-50 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>{toast.msg}</div>}

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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Tổng đơn', stats.total],
          ['Cần xử lý', stats.action],
          ['Đang giao', stats.shipping],
          ['Doanh thu đã giao', formatVND(stats.revenue)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-xl font-black text-sole-dark">{value}</div>
            <div className="mt-1 text-xs font-bold text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[['', 'Tất cả'], ...Object.entries(STATUS_CONFIG).map(([key, value]) => [key, value.label])].map(([value, label]) => (
          <button key={value} onClick={() => setFilterStatus(value)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${filterStatus === value ? 'bg-primary text-white shadow-md' : 'border border-gray-200 bg-white text-gray-600 hover:border-primary'}`}>{label}</button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
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
                {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-gray-100" /></td></tr>) : orders.map(order => (
                  <tr key={order.id} onClick={() => selectOrder(order)} className={`cursor-pointer border-b border-gray-50 transition hover:bg-gray-50 ${selected?.id === order.id ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-3"><div className="font-mono text-xs font-black text-sole-dark">#{order.id}</div><div className="mt-1 text-xs text-gray-400">{new Date(order.created_at).toLocaleString('vi-VN')}</div></td>
                    <td className="px-4 py-3"><div className="font-bold text-gray-700">{order.contact?.fullName || 'Khách'}</div><div className="text-xs text-gray-400">{order.contact?.phone}</div></td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3"><div className="text-xs font-bold text-gray-600">{PAYMENT_METHODS[order.payment_method] || order.payment_method}</div><div className="mt-1"><PaymentBadge order={order} /></div></td>
                    <td className="px-4 py-3 text-right font-black text-primary">{formatVND(order.total)}</td>
                  </tr>
                ))}
                {!loading && orders.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-400">Không có đơn hàng</td></tr>}
              </tbody>
            </table>
          </div>
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
