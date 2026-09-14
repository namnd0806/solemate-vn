'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-sole-gray">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-sole-dark mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-500 mb-4">Cảm ơn bạn đã mua sắm tại <span className="text-primary font-semibold">SoleMate VN</span></p>

        {orderId && (
          <div className="bg-sole-gray rounded-2xl px-5 py-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Mã đơn hàng của bạn</p>
            <p className="font-mono font-bold text-sole-dark text-lg">{orderId}</p>
          </div>
        )}

        <p className="text-sm text-gray-400 mb-8">
          Chúng tôi sẽ liên hệ xác nhận qua số điện thoại bạn đã cung cấp trong vòng 24 giờ.
        </p>

        <div className="flex flex-col gap-3">
          {orderId && (
            <Link href={`/order/${orderId}`}
              className="block w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-orange-600 transition-colors">
              Xem chi tiết đơn hàng
            </Link>
          )}
          <Link href="/track-order"
            className="block w-full py-3 border border-gray-200 text-gray-600 rounded-full font-medium hover:bg-gray-50 transition-colors">
            Tra cứu đơn hàng
          </Link>
          <Link href="/"
            className="block w-full py-3 text-gray-400 hover:text-primary transition-colors text-sm">
            ← Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
