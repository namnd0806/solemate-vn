'use client'

import { useCart } from '@/contexts/CartContext'
import { formatVND } from '@/lib/utils'
import Image from 'next/image'
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
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <h1 className="section-title mt-1.5">Giỏ hàng <span className="text-base font-medium text-gray-400">({count} sản phẩm)</span></h1>
        <Link href="/products" className="text-sm font-bold text-primary transition hover:text-primary-deep">← Tiếp tục mua sắm</Link>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="space-y-3">
          {items.map(item => (
            <article key={item.sku} className="surface-card grid grid-cols-[92px_minmax(0,1fr)] gap-4 p-3.5 transition duration-300 hover:border-primary/20 hover:shadow-md sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:p-4">
              <Link href={`/product/${item.slug}`} className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                {item.image_url ? <Image src={item.image_url} alt={item.name} fill sizes="120px" className="object-cover transition duration-500 hover:scale-105" /> : <ShoeSvg className="h-full w-full p-2" color="#e8642a" brand={item.brand} />}
              </Link>
              <div className="min-w-0 py-1">
                <p className="text-[10px] font-black uppercase tracking-[.12em] text-gray-400">{item.brand}</p>
                <Link href={`/product/${item.slug}`} className="mt-1 block truncate font-bold text-sole-dark transition hover:text-primary">{item.name}</Link>
                <p className="mt-1.5 text-xs text-gray-400">{item.color} · Size {item.size}</p>
                <p className="mt-3 text-sm font-black text-primary">{formatVND(item.price || 0)}</p>
              </div>
              <div className="col-span-2 flex items-center justify-between border-t border-gray-100 pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:border-0 sm:pt-1">
                <button onClick={() => removeItem(item.sku)} className="grid size-8 place-items-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500" aria-label="Xoá sản phẩm">✕</button>
                <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 p-1">
                  <button onClick={() => handleQtyChange(item.sku, item.qty - 1)} className="grid size-8 place-items-center rounded-full text-sm transition hover:bg-white hover:text-primary hover:shadow-sm">−</button>
                  <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                  <button onClick={() => handleQtyChange(item.sku, item.qty + 1)} className="grid size-8 place-items-center rounded-full text-sm transition hover:bg-white hover:text-primary hover:shadow-sm">+</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="surface-card overflow-hidden lg:sticky lg:top-24">
          <div className="border-b border-gray-100 bg-[linear-gradient(135deg,#181b1e,#292d31)] p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-white/50">Order summary</p>
            <h2 className="mt-2 text-xl font-black">Tóm tắt đơn hàng</h2>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Tạm tính</span><span className="font-bold">{formatVND(total)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Vận chuyển</span><span className="font-bold text-emerald-600">{total >= 499000 ? 'Miễn phí' : 'Tính khi thanh toán'}</span></div>
            <div className="border-t border-dashed border-gray-200 pt-4">
              <div className="flex items-end justify-between"><span className="font-bold">Tổng cộng</span><span className="text-2xl font-black text-primary">{formatVND(total)}</span></div>
              <p className="mt-1 text-right text-[10px] text-gray-400">Đã bao gồm VAT nếu có</p>
            </div>
            <Link href="/checkout" className="btn-primary w-full text-sm">Tiến hành thanh toán</Link>
            <button onClick={clearCart} className="w-full py-2 text-xs font-semibold text-gray-400 transition hover:text-red-500">Xóa toàn bộ giỏ hàng</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
