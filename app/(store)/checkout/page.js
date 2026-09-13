'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => { if (items.length === 0) router.replace('/cart') }, [items, router])

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
      clearCart()
      router.push(`/order/${data.data.order_id}`)
    } catch { setToast({ message: 'Lỗi hệ thống.', type: 'error' }); setSubmitting(false) }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-sole-dark mb-8">Thanh toán</h1>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Contact */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-sole-dark mb-4">Thông tin giao hàng</h2>
            <div className="grid grid-cols-2 gap-4">
              {[['fullName','Họ tên *','text',true],['phone','Số điện thoại *','tel',true],['email','Email','email',false],['province','Tỉnh/Thành *','text',true],['district','Quận/Huyện *','text',true],['ward','Phường/Xã *','text',true]].map(([key,label,type,req]) => (
                <div key={key} className={key === 'fullName' || key === 'address' ? 'col-span-2' : ''}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input type={type} required={req} value={contact[key]} onChange={e => setContact(p => ({...p,[key]:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Địa chỉ *</label>
                <input required value={contact.address} onChange={e => setContact(p => ({...p,address:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Số nhà, tên đường..." />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Ghi chú</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-sole-dark mb-4">Vận chuyển & Thanh toán</h2>
            <div className="space-y-3">
              {[['STANDARD','Giao hàng tiêu chuẩn (30.000₫)'],['EXPRESS','Giao hàng nhanh (50.000₫)']].map(([v,l]) => (
                <label key={v} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="shipping" value={v} checked={shipping===v} onChange={()=>setShipping(v)} />
                  <span className="text-sm">{l}</span>
                </label>
              ))}
              <div className="border-t pt-3 mt-3 space-y-2">
                {[['COD','Tiền mặt khi nhận hàng'],['BANK','Chuyển khoản ngân hàng'],['MOMO','Ví MoMo']].map(([v,l]) => (
                  <label key={v} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" value={v} checked={payment===v} onChange={()=>setPayment(v)} />
                    <span className="text-sm">{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-sole-dark mb-4">Đơn hàng ({items.length} sản phẩm)</h2>
            <div className="space-y-3 mb-4">
              {items.map(i => (
                <div key={i.sku} className="flex justify-between text-sm">
                  <span className="text-gray-600 flex-1 truncate pr-2">{i.name} x{i.qty}</span>
                  <span className="font-medium">{formatVND(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            {/* Promo */}
            <div className="flex gap-2 mb-4">
              <input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Mã giảm giá" className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              <button type="button" onClick={applyPromo} className="px-3 bg-primary text-white rounded-lg text-sm hover:bg-orange-600">Áp dụng</button>
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
          <button type="submit" disabled={submitting} className="w-full bg-primary text-white rounded-full py-3 font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">
            {submitting ? 'Đang đặt...' : 'Đặt hàng'}
          </button>
        </div>
      </form>
    </div>
  )
}
