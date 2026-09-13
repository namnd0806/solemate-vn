'use client'

import { useEffect, useState } from 'react'
import { formatVND } from '@/lib/utils'
import ConfirmModal from '@/components/store/ConfirmModal'
import Toast from '@/components/store/Toast'

const STATUS_LABELS = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', SHIPPING:'Đang giao', DELIVERED:'Đã giao', CANCELLED:'Đã hủy' }
const STATUS_COLORS = { PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700', SHIPPING:'bg-indigo-100 text-indigo-700', DELIVERED:'bg-green-100 text-green-700', CANCELLED:'bg-red-100 text-red-600' }
const TRANSITIONS = { PENDING:['CONFIRMED','CANCELLED'], CONFIRMED:['SHIPPING','CANCELLED'], SHIPPING:['DELIVERED'], DELIVERED:[], CANCELLED:[] }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [tracking, setTracking] = useState('')
  const [toast, setToast] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)

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
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.ok) { setToast({ message: 'Đã cập nhật trạng thái.', type: 'success' }); load(); setSelected(null) }
    else setToast({ message: data.message, type: 'error' })
  }

  async function saveTracking(orderId) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracking }),
    })
    const data = await res.json()
    if (data.ok) setToast({ message: 'Đã lưu mã vận đơn.', type: 'success' })
    else setToast({ message: data.message, type: 'error' })
  }

  async function cancelOrder() {
    setCancelling(true)
    const res = await fetch(`/api/orders/${cancelTarget.id}/cancel`, { method: 'POST' })
    const data = await res.json()
    setCancelling(false)
    setCancelTarget(null)
    if (data.ok) { setToast({ message: 'Đã hủy đơn hàng.', type: 'success' }); load(); setSelected(null) }
    else setToast({ message: data.message, type: 'error' })
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {cancelTarget && (
        <ConfirmModal title="Hủy đơn hàng" message={`Hủy đơn #${cancelTarget.id}?`}
          onConfirm={cancelOrder} onCancel={() => setCancelTarget(null)} loading={cancelling} />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sole-dark">Quản lý đơn hàng</h1>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-sole-gray border-b text-left text-gray-500">
            <th className="px-4 py-3">Mã đơn</th><th className="px-4 py-3">Khách hàng</th>
            <th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Thanh toán</th>
            <th className="px-4 py-3 text-right">Tổng</th><th className="px-4 py-3">Ngày đặt</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Đang tải...</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} onClick={() => { setSelected(o); setTracking(o.tracking || '') }}
                className="border-b last:border-0 hover:bg-sole-gray cursor-pointer">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{o.id}</td>
                <td className="px-4 py-3 text-gray-600">{o.contact?.fullName || 'Khách'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || ''}`}>{STATUS_LABELS[o.status]}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{o.payment_method} / {o.payment_status}</td>
                <td className="px-4 py-3 text-right font-semibold text-primary">{formatVND(o.total)}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-bold text-sole-dark text-lg">#{selected.id}</h2>
              <p className="text-sm text-gray-400">{selected.contact?.fullName} · {selected.contact?.phone}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {selected.order_items?.map(i => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{i.name} · {i.color} · Size {i.size} × {i.qty}</span>
                <span className="font-semibold">{formatVND(i.line_total)}</span>
              </div>
            ))}
          </div>

          {/* Tracking */}
          <div className="flex gap-2">
            <input value={tracking} onChange={e => setTracking(e.target.value)}
              placeholder="Mã vận đơn..." className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={() => saveTracking(selected.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Lưu</button>
          </div>

          {/* Transitions */}
          <div className="flex flex-wrap gap-2">
            {(TRANSITIONS[selected.status] || []).map(s => (
              <button key={s} onClick={() => updateStatus(selected.id, s)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-orange-600">
                → {STATUS_LABELS[s]}
              </button>
            ))}
            {['PENDING','CONFIRMED'].includes(selected.status) && (
              <button onClick={() => setCancelTarget(selected)}
                className="px-4 py-2 border border-red-400 text-red-600 rounded-lg text-sm hover:bg-red-50">
                Hủy đơn
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
