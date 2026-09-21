'use client'

import { useCart } from '@/contexts/CartContext'
import { formatVND } from '@/lib/utils'
import Link from 'next/link'
import Toast from '@/components/store/Toast'
import { useState } from 'react'
import ShoeSvg from '@/components/store/ShoeSvg'
import { CartIcon } from '@/components/store/Icons'

export default function CartPage() {
  const { items, count, total, removeItem, updateQty, clearCart } = useCart()
  const [toast, setToast] = useState(null)

  async function handleQtyChange(sku, newQty) {
    const result = await updateQty(sku, parseInt(newQty, 10))
    if (!result.ok) setToast({ message: result.message, type: 'error' })
  }

  if (count === 0) {
    return (
      <div className="store-container py-24 text-center">
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-primary/10 text-primary"><CartIcon className="size-9" /></div>
        <h1 className="text-2xl font-bold text-sole-dark mb-3">Giỏ hàng trống</h1>
        <p className="text-gray-400 mb-8">Thêm sản phẩm vào giỏ để tiếp tục mua sắm.</p>
        <Link href="/products" className="btn-primary">
          Khám phá sản phẩm
        </Link>
      </div>
    )
  }

  return (
    <div className="store-container py-10 lg:py-14">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <span className="section-kicker">Your selection</span>
      <h1 className="section-title mb-8 mt-1.5">Giỏ hàng <span className="text-base font-medium text-gray-400">({count} sản phẩm)</span></h1>
      <div className="space-y-4 mb-8">
        {items.map(item => (
          <div key={item.sku} className="surface-card flex gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-sole-gray"><ShoeSvg className="h-20 w-24" color="#e8642a" brand={item.brand} /></div>
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
      <div className="surface-card p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Tổng tạm tính</span>
          <span className="text-xl font-bold text-primary">{formatVND(total)}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={clearCart} className="btn-secondary flex-1 text-sm">
            Xoá giỏ hàng
          </button>
          <Link href="/checkout" className="btn-primary flex-1 text-sm">
            Tiến hành thanh toán
          </Link>
        </div>
      </div>
    </div>
  )
}
