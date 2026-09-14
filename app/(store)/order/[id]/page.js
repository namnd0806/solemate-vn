'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { formatVND } from '@/lib/utils'
import ConfirmModal from '@/components/store/ConfirmModal'
import Toast from '@/components/store/Toast'
import Link from 'next/link'
import { Suspense } from 'react'

const STATUS_LABELS = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', SHIPPING:'Đang giao', DELIVERED:'Đã giao', CANCELLED:'Đã hủy' }
const STATUS_COLORS = {
  PENDING:'bg-yellow-100 text-yellow-700',
  CONFIRMED:'bg-blue-100 text-blue-700',
  SHIPPING:'bg-indigo-100 text-indigo-700',
  DELIVERED:'bg-green-100 text-green-700',
  CANCELLED:'bg-red-100 text-red-600'
}

function OrderDetailContent() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const isNew = searchParams.get('new') === '1'

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    // Try authenticated fetch first, fallback to guest lookup if needed
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(({ ok, data }) => {
        if (ok) setOrder(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Đang tải đơn hàng...</p>
        </div>
      </div>
    )
  }

  // Order not found — show friendly message with order ID
  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        {isNew && (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-emerald-700 mb-2">Đặt hàng thành công!</h2>
            <p className="text-emerald-600 text-sm mb-3">Mã đơn hàng của bạn: <strong className="font-mono">{id}</strong></p>
            <p className="text-emerald-600 text-sm">Chúng tôi sẽ liên hệ xác nhận qua số điện thoại bạn đã cung cấp.</p>
          </div>
        )}
        <p className="text-gray-400 mb-4">Để xem chi tiết đơn hàng, vui lòng đăng nhập hoặc dùng chức năng tra cứu.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/track-order" className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors">
            Tra cứu đơn hàng
          </Link>
          <Link href="/" className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-full text-sm hover:bg-gray-50 transition-colors">
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showCancel && (
        <ConfirmModal
          title="Hủy đơn hàng"
          message="Bạn có chắc muốn hủy đơn hàng này?"
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
          loading={cancelling}
        />
      )}

      {/* Success banner for new orders */}
      {isNew && (
        <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-lg font-bold text-emerald-700 mb-1">Đặt hàng thành công!</h2>
          <p className="text-emerald-600 text-sm">Cảm ơn bạn đã mua sắm tại SoleMate VN</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-sole-dark">Đơn hàng #{order.id}</h1>
          <p className="text-sm text-gray-400 mt-1">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[order.status] || ''}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      {/* Delivery info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-4">
        <h2 className="font-semibold text-sole-dark mb-3">Thông tin giao hàng</h2>
        <div className="text-sm space-y-1 text-gray-600">
          <p className="font-medium text-sole-dark">{order.contact?.fullName}</p>
          <p>📞 {order.contact?.phone}</p>
          <p>📍 {order.contact?.address}, {order.contact?.ward}, {order.contact?.district}, {order.contact?.province}</p>
          {order.tracking && <p className="text-primary font-medium">🚚 Mã vận đơn: {order.tracking}</p>}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-4">
        <h2 className="font-semibold text-sole-dark mb-4">Sản phẩm</h2>
        <div className="space-y-3">
          {order.order_items?.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium text-sole-dark">{item.name}</p>
                <p className="text-gray-400 text-xs">{item.brand} · {item.color} · Size {item.size} · x{item.qty}</p>
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
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá {order.promo_code && `(${order.promo_code})`}</span>
              <span>−{formatVND(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển</span>
            <span>{order.shipping_fee === 0 ? 'Miễn phí' : formatVND(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Tổng cộng</span>
            <span className="text-primary">{formatVND(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {canCancel && (
          <button onClick={() => setShowCancel(true)}
            className="flex-1 border border-red-400 text-red-600 rounded-full py-3 font-medium hover:bg-red-50 transition-colors">
            Hủy đơn hàng
          </button>
        )}
        <Link href="/" className="flex-1 bg-primary text-white rounded-full py-3 font-semibold text-center hover:bg-orange-600 transition-colors">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32 text-gray-400">Đang tải...</div>}>
      <OrderDetailContent />
    </Suspense>
  )
}
