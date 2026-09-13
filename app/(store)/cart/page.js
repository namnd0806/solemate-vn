'use client'

import { useCart } from '@/contexts/CartContext'
import { formatVND } from '@/lib/utils'
import Link from 'next/link'
import Toast from '@/components/store/Toast'
import { useState } from 'react'

export default function CartPage() {
  const { items, count, total, removeItem, updateQty, clearCart } = useCart()
  const [toast, setToast] = useState(null)

  async function handleQtyChange(sku, newQty) {
    const result = await updateQty(sku, parseInt(newQty, 10))
    if (!result.ok) setToast({ message: result.message, type: 'error' })
  }

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-6">🛒</p>
        <h1 className="text-2xl font-bold text-sole-dark mb-3">Giỏ hàng trống</h1>
        <p className="text-gray-400 mb-8">Thêm sản phẩm vào giỏ để tiếp tục mua sắm.</p>
        <Link href="/products" className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors">
          Khám phá sản phẩm
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-sole-dark mb-8">Giỏ hàng ({count} sản phẩm)</h1>
      <div className="space-y-4 mb-8">
        {items.map(item => (
          <div key={item.sku} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="w-20 h-20 bg-sole-gray rounded-lg flex items-center justify-center text-2xl flex-shrink-0">👟</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sole-dark truncate">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.brand} · {item.color} · Size {item.size} · SKU: {item.sku}</p>
              <p className="text-primary font-bold mt-1">{formatVND((item.price || 0) * item.qty)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={() => removeItem(item.sku)} className="text-gray-400 hover:text-red-500 text-xs transition-colors" aria-label="Xoá sản phẩm">✕</button>
              <div className="flex items-center gap-2">
                <button onClick={() => handleQtyChange(item.sku, item.qty - 1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm hover:border-primary transition-colors">−</button>
                <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                <button onClick={() => handleQtyChange(item.sku, item.qty + 1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm hover:border-primary transition-colors">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Tổng tạm tính</span>
          <span className="text-xl font-bold text-primary">{formatVND(total)}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={clearCart} className="flex-1 border border-gray-300 rounded-full py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Xoá giỏ hàng
          </button>
          <Link href="/checkout" className="flex-1 bg-primary text-white rounded-full py-3 text-sm font-semibold text-center hover:bg-orange-600 transition-colors">
            Tiến hành thanh toán
          </Link>
        </div>
      </div>
    </div>
  )
}
