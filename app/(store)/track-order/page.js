'use client'

import { useState } from 'react'
import { formatVND } from '@/lib/utils'

const STATUS_LABELS = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', SHIPPING:'Đang giao', DELIVERED:'Đã giao', CANCELLED:'Đã hủy' }

export default function TrackOrderPage() {
  const [form, setForm] = useState({ orderId: '', phone: '' })
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setOrder(null)
    setLoading(true)
    const res = await fetch('/api/orders/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (!data.ok) { setError(data.message); return }
    setOrder(data.data)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-sole-dark mb-8">Tra cứu đơn hàng</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4 mb-8">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Mã đơn hàng</label>
          <input required value={form.orderId} onChange={e => setForm(p => ({...p, orderId: e.target.value}))} placeholder="VD: SMVN-17094823451234" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Số điện thoại đặt hàng</label>
          <input required value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="VD: 0912345678" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-full py-3 font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">
          {loading ? 'Đang tra cứu...' : 'Tra cứu'}
        </button>
      </form>

      {order && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-sole-dark">#{order.id}</h2>
            <span className="text-sm text-gray-500">{STATUS_LABELS[order.status] || order.status}</span>
          </div>
          <div className="space-y-2 text-sm">
            {order.order_items?.map(i => (
              <div key={i.id} className="flex justify-between">
                <span className="text-gray-600">{i.name} · {i.color} · Size {i.size} × {i.qty}</span>
                <span className="font-medium">{formatVND(i.line_total)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Tổng</span><span className="text-primary">{formatVND(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
