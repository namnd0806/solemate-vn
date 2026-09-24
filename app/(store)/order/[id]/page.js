'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { formatVND } from '@/lib/utils'
import ConfirmModal from '@/components/store/ConfirmModal'
import Toast from '@/components/store/Toast'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRightIcon, BoxIcon, CheckIcon, PhoneIcon, PinIcon, TruckIcon } from '@/components/store/Icons'

const STATUS_LABELS = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', PACKING:'Đang chuẩn bị hàng', SHIPPING:'Đang giao', DELIVERED:'Đã giao', CANCELLED:'Đã hủy' }
const STATUS_COLORS = {
  PENDING:'bg-yellow-100 text-yellow-700',
  CONFIRMED:'bg-blue-100 text-blue-700',
  PACKING:'bg-orange-100 text-orange-700',
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
    const res = await fetch(`/api/orders/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Khách tự hủy đơn trên website' }),
    })
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
      <div className="mx-auto flex min-h-[62vh] max-w-3xl items-center justify-center px-4 py-32">
        <div className="text-center">
          <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-gray-400">Đang tải đơn hàng...</p>
        </div>
      </div>
    )
  }

  // Order not found — show friendly message with order ID
  if (!order) {
    return (
      <div className="mx-auto min-h-[62vh] max-w-2xl px-4 py-16 text-center">
        {isNew && (
          <div className="mb-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-7">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-emerald-500 text-white"><CheckIcon className="size-7" /></div>
            <h2 className="text-xl font-bold text-emerald-700 mb-2">Đặt hàng thành công!</h2>
            <p className="text-emerald-600 text-sm mb-3">Mã đơn hàng của bạn: <strong className="font-mono">{id}</strong></p>
            <p className="text-emerald-600 text-sm">Chúng tôi sẽ liên hệ xác nhận qua số điện thoại bạn đã cung cấp.</p>
          </div>
        )}
        <div className="surface-card px-6 py-10"><div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-primary/8 text-primary"><BoxIcon className="size-8" /></div><h1 className="text-xl font-black text-sole-dark">Chưa thể hiển thị chi tiết đơn</h1><p className="mx-auto mb-6 mt-2 max-w-md text-sm leading-6 text-gray-500">Vui lòng đăng nhập hoặc dùng chức năng tra cứu với mã đơn và số điện thoại.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/track-order" className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors">
            Tra cứu đơn hàng
          </Link>
          <Link href="/" className="rounded-full border border-gray-200 px-6 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50">
            Về trang chủ
          </Link>
        </div></div>
      </div>
    )
  }

  const earlyOrder = ['PENDING', 'CONFIRMED'].includes(order.status)
  const canCancel = earlyOrder && !order.guest
  const shouldContactShop = ['PACKING', 'SHIPPING'].includes(order.status) || (earlyOrder && order.guest)

  return (
    <main className="mx-auto min-h-[62vh] max-w-4xl px-4 py-10 sm:py-14">
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
        <div className="mb-6 rounded-[22px] border border-emerald-200 bg-emerald-50 p-6 text-center" data-reveal>
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-emerald-500 text-white"><CheckIcon className="size-6" /></div>
          <h2 className="text-lg font-bold text-emerald-700 mb-1">Đặt hàng thành công!</h2>
          <p className="text-emerald-600 text-sm">Cảm ơn bạn đã mua sắm tại SoleMate VN</p>
        </div>
      )}

      <div className="mb-7 flex flex-wrap items-start justify-between gap-4" data-reveal>
        <div>
          <p className="section-kicker">Chi tiết đơn hàng</p>
          <h1 className="mt-1.5 text-2xl font-black text-sole-dark sm:text-3xl">Đơn hàng #{order.id}</h1>
          <p className="text-sm text-gray-400 mt-1">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[order.status] || ''}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      {/* Delivery info */}
      <div className="mb-5 grid gap-5 md:grid-cols-[1fr_.86fr]" data-reveal>
      <section className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-[0_10px_35px_rgba(20,23,28,.055)]">
        <div className="mb-4 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><PinIcon /></span><h2 className="font-bold text-sole-dark">Thông tin giao hàng</h2></div>
        <div className="space-y-2 text-sm text-gray-600">
          <p className="font-medium text-sole-dark">{order.contact?.fullName}</p>
          <p className="flex items-center gap-2"><PhoneIcon className="size-4 text-gray-400" /> {order.contact?.phone}</p>
          <p className="flex items-start gap-2"><PinIcon className="mt-0.5 size-4 shrink-0 text-gray-400" /> <span>{order.contact?.address}, {order.contact?.ward}, {order.contact?.district}, {order.contact?.province}</span></p>
          {order.tracking && <p className="flex items-center gap-2 font-bold text-primary"><TruckIcon className="size-4" /> Mã vận đơn: {order.tracking}</p>}
        </div>
      </section>

      <section className="rounded-[20px] bg-sole-dark p-6 text-white shadow-[0_16px_40px_rgba(20,23,28,.16)]">
        <div className="mb-5 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white/10 text-primary-light"><BoxIcon /></span><h2 className="font-bold">Tổng quan thanh toán</h2></div>
        <div className="space-y-3 text-sm text-white/65">
          <div className="flex justify-between"><span>Tạm tính</span><span className="text-white">{formatVND(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Giảm giá {order.promo_code && `(${order.promo_code})`}</span><span>−{formatVND(order.discount)}</span></div>}
          <div className="flex justify-between"><span>Phí vận chuyển</span><span className="text-white">{order.shipping_fee === 0 ? 'Miễn phí' : formatVND(order.shipping_fee)}</span></div>
          <div className="flex justify-between border-t border-white/10 pt-4 text-base font-black text-white"><span>Tổng cộng</span><span className="text-primary-light">{formatVND(order.total)}</span></div>
        </div>
      </section>
      </div>

      {/* Items */}
      <section className="mb-6 rounded-[20px] border border-gray-200 bg-white p-6 shadow-[0_10px_35px_rgba(20,23,28,.055)]" data-reveal>
        <h2 className="mb-5 font-bold text-sole-dark">Sản phẩm trong đơn</h2>
        <div className="divide-y divide-gray-100">
          {order.order_items?.map(item => (
            <div key={item.id} className="flex justify-between gap-4 py-4 first:pt-0 last:pb-0 text-sm">
              <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gray-100 text-gray-500"><BoxIcon className="size-5" /></span><div>
                <p className="font-medium text-sole-dark">{item.name}</p>
                <p className="text-gray-400 text-xs">{item.brand} · {item.color} · Size {item.size} · x{item.qty}</p>
              </div></div>
              <p className="font-semibold text-primary whitespace-nowrap ml-4">{formatVND(item.line_total)}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        {canCancel && (
          <button onClick={() => setShowCancel(true)}
            className="flex-1 border border-red-400 text-red-600 rounded-full py-3 font-medium hover:bg-red-50 transition-colors">
            Hủy đơn hàng
          </button>
        )}
        {shouldContactShop && (
          <div className="flex-1 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-700">
            {order.guest && earlyOrder
              ? 'Đơn guest cần xác minh qua số điện thoại. Vui lòng liên hệ shop nếu bạn cần hủy hoặc thay đổi thông tin.'
              : 'Đơn đang được xử lý. Vui lòng liên hệ shop nếu bạn cần hỗ trợ hủy hoặc thay đổi thông tin.'}
          </div>
        )}
        <Link href="/" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep">
          Tiếp tục mua sắm <ArrowRightIcon />
        </Link>
      </div>
    </main>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32 text-gray-400">Đang tải...</div>}>
      <OrderDetailContent />
    </Suspense>
  )
}
