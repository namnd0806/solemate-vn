'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { formatVND } from '@/lib/utils'
import Toast from '@/components/store/Toast'

const PROVINCES = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Khác']

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [contact, setContact] = useState({ fullName: '', phone: '', email: '', province: '', district: '', ward: '', address: '' })
  const [shipping, setShipping] = useState('STANDARD')
  const [payment, setPayment] = useState('COD')
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoMsg, setPromoMsg] = useState('')
  const [note, setNote] = useState('')
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (items.length === 0 && !submitting) router.replace('/cart') }, [items, router, submitting])

  const subtotal = total
  const shippingFee = shipping === 'EXPRESS' ? 50000 : subtotal - discount >= 499000 ? 0 : 30000
  const grandTotal = Math.max(0, subtotal - discount + shippingFee)

  async function applyPromo() {
    setPromoMsg('')
    const res = await fetch('/api/promotions/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoCode, subtotal }),
    })
    const data = await res.json()
    if (data.ok) {
      setDiscount(data.data.discount)
      setPromoMsg(`✅ Giảm ${formatVND(data.data.discount)}`)
    } else {
      setDiscount(0)
      setPromoMsg(`❌ ${data.message}`)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        contact,
        items: items.map(i => ({
          product_id: i.productId, slug: i.slug, name: i.name, brand: i.brand,
          sku: i.sku, color: i.color, size: i.size, qty: i.qty,
          unit_price: i.price, line_total: i.price * i.qty,
        })),
        shippingMethod: shipping,
        paymentMethod: payment,
        promoCode: discount > 0 ? promoCode : '',
        note,
      }
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!data.ok) { setToast({ message: data.message, type: 'error' }); setSubmitting(false); return }
      const orderId = data.data?.order_id || data.order_id
      clearCart()
      setTimeout(() => router.push(`/order-success?id=${orderId}`), 150)
    } catch { setToast({ message: 'Lỗi hệ thống.', type: 'error' }); setSubmitting(false) }
  }

  return (
    <div className="store-container py-10 lg:py-14">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <span className="section-kicker">Secure checkout</span>
      <h1 className="section-title mb-8 mt-1.5">Thanh toán</h1>
      <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-8">
        <div className="space-y-6">
          {/* Contact */}
          <div className="surface-card p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-black text-white">1</span>
              <div><h2 className="font-bold text-sole-dark">Thông tin giao hàng</h2><p className="text-xs text-gray-400">Điền thông tin người nhận chính xác</p></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[['fullName','Họ tên *','text',true],['phone','Số điện thoại *','tel',true],['email','Email','email',false],['province','Tỉnh/Thành *','text',true],['district','Quận/Huyện *','text',true],['ward','Phường/Xã *','text',true]].map(([key,label,type,req]) => (
                <div key={key} className={key === 'fullName' || key === 'address' ? 'col-span-2' : ''}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input type={type} required={req} value={contact[key]} onChange={e => setContact(p => ({...p,[key]:e.target.value}))} className="form-field" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Địa chỉ *</label>
                <input required value={contact.address} onChange={e => setContact(p => ({...p,address:e.target.value}))} className="form-field" placeholder="Số nhà, tên đường..." />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Ghi chú</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className="form-field min-h-20 resize-none py-3" />
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="surface-card p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-black text-white">2</span>
              <div><h2 className="font-bold text-sole-dark">Vận chuyển & Thanh toán</h2><p className="text-xs text-gray-400">Chọn phương thức phù hợp với bạn</p></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[['STANDARD','Giao hàng tiêu chuẩn (30.000₫)'],['EXPRESS','Giao hàng nhanh (50.000₫)']].map(([v,l]) => (
                <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${shipping===v ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-gray-200 hover:border-primary/40'}`}>
                  <input type="radio" name="shipping" value={v} checked={shipping===v} onChange={()=>setShipping(v)} />
                  <span className="text-sm font-semibold">{l}</span>
                </label>
              ))}
              <div className="col-span-full mt-2 grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">
                {[['COD','Tiền mặt khi nhận hàng'],['BANK','Chuyển khoản ngân hàng'],['MOMO','Ví MoMo']].map(([v,l]) => (
                  <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${payment===v ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-gray-200 hover:border-primary/40'}`}>
                    <input type="radio" name="payment" value={v} checked={payment===v} onChange={()=>setPayment(v)} />
                    <span className="text-sm font-semibold">{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="surface-card overflow-hidden">
            <div className="bg-[linear-gradient(135deg,#181b1e,#292d31)] px-5 py-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/45">Order summary</p>
              <h2 className="mt-1 font-black">Đơn hàng ({items.length} sản phẩm)</h2>
            </div>
            <div className="p-5">
            <div className="mb-5 max-h-[300px] space-y-3 overflow-y-auto pr-1">
              {items.map(i => (
                <div key={i.sku} className="flex items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {i.image_url ? <Image src={i.image_url} alt={i.name} fill sizes="56px" className="object-cover" /> : null}
                    <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-sole-dark text-[8px] font-bold text-white">{i.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{i.name}</p><p className="mt-1 text-[10px] text-gray-400">{i.color} · Size {i.size}</p></div>
                  <span className="text-xs font-bold">{formatVND(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            {/* Promo */}
            <div className="flex gap-2 mb-4">
              <input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Mã giảm giá" className="form-field min-w-0 flex-1" />
              <button type="button" onClick={applyPromo} className="rounded-xl bg-sole-dark px-4 text-xs font-bold text-white transition hover:bg-primary">Áp dụng</button>
            </div>
            {promoMsg && <p className="text-xs mb-3">{promoMsg}</p>}
            <div className="space-y-2 text-sm border-t pt-3">
              <div className="flex justify-between"><span className="text-gray-600">Tạm tính</span><span>{formatVND(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>−{formatVND(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-600">Phí vận chuyển</span><span>{shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Tổng cộng</span><span className="text-primary">{formatVND(grandTotal)}</span>
              </div>
            </div>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Đang xử lý đơn hàng...' : `Đặt hàng · ${formatVND(grandTotal)}`}
          </button>
          <p className="text-center text-[11px] leading-5 text-gray-400">Bằng việc đặt hàng, bạn đồng ý với điều khoản mua hàng và chính sách đổi trả của SoleMate VN.</p>
        </div>
      </form>
    </div>
  )
}
