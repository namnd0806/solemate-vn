'use client'

import { useEffect, useState } from 'react'
import { formatVND } from '@/lib/utils'

const STATUS_CONFIG = {
  PENDING:   { label: 'Chờ xác nhận', color: 'bg-yellow-50 text-yellow-700 border-yellow-200',   dot: 'bg-yellow-400' },
  CONFIRMED: { label: 'Đã xác nhận',  color: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-400' },
  SHIPPING:  { label: 'Đang giao',    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',   dot: 'bg-indigo-400' },
  DELIVERED: { label: 'Đã giao',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',dot: 'bg-emerald-400' },
  CANCELLED: { label: 'Đã hủy',       color: 'bg-red-50 text-red-600 border-red-200',            dot: 'bg-red-400' },
}

const TRANSITIONS = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING', 'CANCELLED'],
  SHIPPING:  ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

const PAYMENT_METHODS = { COD: '💵 COD', BANK: '🏦 QR ngân hàng', VISA: '💳 Visa', MOMO: '💜 MoMo' }

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || {}
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [tracking, setTracking] = useState('')
  const [toast, setToast] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    const url = filterStatus ? `/api/orders?status=${filterStatus}` : '/api/orders'
    const res = await fetch(url)
    const data = await res.json()
    if (data.ok) setOrders(data.data.orders || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus])

  async function updateStatus(orderId, status) {
    setUpdatingStatus(true)
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    setUpdatingStatus(false)
    if (data.ok) {
      showToast(`Chuyển sang: ${STATUS_CONFIG[status]?.label}`)
      load()
      setSelected(s => s ? { ...s, status } : null)
    } else showToast(data.message, 'error')
  }

  async function saveTracking() {
    if (!selected) return
    const res = await fetch(`/api/orders/${selected.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracking }),
    })
    const data = await res.json()
    if (data.ok) showToast('Đã lưu mã vận đơn!')
    else showToast(data.message, 'error')
  }

  async function cancelOrder() {
    if (!cancelTarget) return
    setCancelling(true)
    const res = await fetch(`/api/orders/${cancelTarget.id}/cancel`, { method: 'POST' })
    const data = await res.json()
    setCancelling(false)
    setCancelTarget(null)
    if (data.ok) {
      showToast('Đã hủy đơn hàng')
      load()
      setSelected(s => s ? { ...s, status: 'CANCELLED' } : null)
    } else showToast(data.message, 'error')
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    revenue: orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.total, 0),
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-4xl text-center mb-3">⚠️</div>
            <h3 className="font-bold text-sole-dark text-lg mb-2 text-center">Hủy đơn hàng?</h3>
            <p className="text-gray-500 text-sm mb-6 text-center">Đơn <strong>{cancelTarget.id}</strong> sẽ bị hủy và tồn kho sẽ được hoàn lại.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Giữ lại</button>
              <button onClick={cancelOrder} disabled={cancelling} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {cancelling ? 'Đang hủy...' : 'Hủy đơn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-sole-dark">Quản lý đơn hàng</h1>
        <p className="text-sm text-gray-400 mt-1">{orders.length} đơn hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng đơn', value: stats.total, icon: '📦', color: 'text-sole-dark' },
          { label: 'Chờ xử lý', value: stats.pending, icon: '⏳', color: 'text-yellow-600' },
          { label: 'Đã giao', value: stats.delivered, icon: '✅', color: 'text-emerald-600' },
          { label: 'Doanh thu', value: formatVND(stats.revenue), icon: '💰', color: 'text-primary' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['', 'Tất cả'], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])].map(([v, l]) => (
          <button key={v} onClick={() => setFilterStatus(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === v ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Order list */}
        <div className={`${selected ? 'w-1/2' : 'w-full'} transition-all`}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Đơn hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Khách</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td colSpan={4} className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : orders.map(o => (
                    <tr key={o.id}
                      onClick={() => { setSelected(o); setTracking(o.tracking || '') }}
                      className={`border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${selected?.id === o.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold text-sole-dark">{o.id}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{new Date(o.created_at).toLocaleDateString('vi-VN')}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-gray-700">{o.contact?.fullName || 'Khách'}</div>
                        <div className="text-xs text-gray-400">{PAYMENT_METHODS[o.payment_method]}</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{formatVND(o.total)}</td>
                    </tr>
                  ))}
                  {!loading && orders.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-12 text-gray-400">Không có đơn hàng</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-1/2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <div className="font-mono font-bold text-sole-dark">#{selected.id}</div>
                <div className="text-xs text-gray-400 mt-0.5">{new Date(selected.created_at).toLocaleString('vi-VN')}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors">✕</button>
              </div>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-300px)]">
              {/* Contact */}
              <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                <p className="font-semibold text-sole-dark">{selected.contact?.fullName}</p>
                <p className="text-gray-500">📞 {selected.contact?.phone}</p>
                <p className="text-gray-500">📍 {selected.contact?.address}, {selected.contact?.ward}, {selected.contact?.district}, {selected.contact?.province}</p>
                {selected.note && <p className="text-gray-500 italic">📝 {selected.note}</p>}
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sản phẩm</p>
                <div className="space-y-2">
                  {selected.order_items?.map(i => (
                    <div key={i.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-sole-dark">{i.name}</p>
                        <p className="text-xs text-gray-400">{i.brand} · {i.color} · Size {i.size} · ×{i.qty}</p>
                      </div>
                      <p className="font-semibold text-primary text-sm">{formatVND(i.line_total)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{formatVND(selected.subtotal)}</span></div>
                {selected.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Giảm giá {selected.promo_code && `(${selected.promo_code})`}</span><span>−{formatVND(selected.discount)}</span></div>}
                <div className="flex justify-between text-gray-600"><span>Vận chuyển</span><span>{selected.shipping_fee === 0 ? 'Miễn phí' : formatVND(selected.shipping_fee)}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-1.5"><span>Tổng</span><span className="text-primary">{formatVND(selected.total)}</span></div>
              </div>

              {/* Payment */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{PAYMENT_METHODS[selected.payment_method]}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${selected.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                  {selected.payment_status === 'PAID' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                </span>
              </div>

              {/* Tracking */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mã vận đơn</p>
                <div className="flex gap-2">
                  <input value={tracking} onChange={e => setTracking(e.target.value)}
                    placeholder="Nhập mã vận đơn..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-all" />
                  <button onClick={saveTracking}
                    className="px-4 py-2 bg-sole-dark text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Lưu</button>
                </div>
              </div>

              {/* Actions */}
              {TRANSITIONS[selected.status]?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Chuyển trạng thái</p>
                  <div className="flex flex-wrap gap-2">
                    {TRANSITIONS[selected.status].filter(s => s !== 'CANCELLED').map(s => (
                      <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={updatingStatus}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50">
                        → {STATUS_CONFIG[s]?.label}
                      </button>
                    ))}
                    {['PENDING', 'CONFIRMED'].includes(selected.status) && (
                      <button onClick={() => setCancelTarget(selected)}
                        className="px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-all">
                        🚫 Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
