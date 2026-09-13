'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatVND } from '@/lib/utils'
import ConfirmModal from '@/components/store/ConfirmModal'
import Toast from '@/components/store/Toast'

const STATUS_LABELS = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', SHIPPING:'Đang giao', DELIVERED:'Đã giao', CANCELLED:'Đã hủy' }
const STATUS_COLORS = { PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700', SHIPPING:'bg-indigo-100 text-indigo-700', DELIVERED:'bg-green-100 text-green-700', CANCELLED:'bg-red-100 text-red-600' }

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(({ ok, data }) => { if (ok) setOrder(data); setLoading(false) })
  }, [id])

  async function handleCancel() {
    setCancelling(true)
    const res = await fetch(`/api/orders/${id}/cancel`, { method: 'POST' })
    const data = await res.json()
    setCancelling(false)
    setShowCancel(false)
    if (data.ok) {
      setToast({ message: 'Đã hủy đơn hàng thành công.', type: 'success' })
      setOrder(o => ({ ...o, status: 'CANCELLED' }))
    } else {
      setToast({ message: data.message, type: 'error' })
    }
  }

  if (loading) return <div className="flex items-center justify-center py-32 text-gray-400">Đang tải...</div>
  if (!order) return <div className="text-center py-32 text-gray-400">Không tìm thấy đơn hàng.</div>

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showCancel && <ConfirmModal title="Hủy đơn hàng" message="Bạn có chắc muốn hủy đơn hàng này?" onConfirm={handleCancel} onCancel={() => setShowCancel(false)} loading={cancelling} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-sole-dark">Đơn hàng #{order.id}</h1>
          <p className="text-sm text-gray-400 mt-1">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[order.status] || ''}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-4">
        <h2 className="font-semibold text-sole-dark mb-4">Sản phẩm</h2>
        <div className="space-y-3">
          {order.order_items?.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium text-sole-dark">{item.name}</p>
                <p className="text-gray-400 text-xs">{item.brand} · {item.color} · Size {item.size} · SKU: {item.sku} · x{item.qty}</p>
              </div>
              <p className="font-semibold text-primary whitespace-nowrap ml-4">{formatVND(item.line_total)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá {order.promo_code && `(${order.promo_code})`}</span><span>−{formatVND(order.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-gray-600">Phí vận chuyển</span><span>{order.shipping_fee === 0 ? 'Miễn phí' : formatVND(order.shipping_fee)}</span></div>
          <div className="flex justify-between font-bold text-base border-t pt-2"><span>Tổng cộng</span><span className="text-primary">{formatVND(order.total)}</span></div>
        </div>
      </div>

      {canCancel && (
        <button onClick={() => setShowCancel(true)} className="w-full border border-red-400 text-red-600 rounded-full py-3 font-medium hover:bg-red-50 transition-colors">
          Hủy đơn hàng
        </button>
      )}
    </div>
  )
}
