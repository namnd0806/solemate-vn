'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { formatVND } from '@/lib/utils'
import Toast from '@/components/store/Toast'

const PROVINCES = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Khác']
const SHIPPING_OPTIONS = [
  {
    value: 'STANDARD',
    title: 'Giao hàng tiêu chuẩn',
    subtitle: 'Nhận hàng trong 2-4 ngày',
    price: '30.000đ',
  },
  {
    value: 'EXPRESS',
    title: 'Giao hàng nhanh',
    subtitle: 'Ưu tiên xử lý và giao nhanh',
    price: '50.000đ',
  },
]

const PAYMENT_OPTIONS = [
  {
    value: 'COD',
    title: 'Thanh toán khi nhận hàng',
    subtitle: 'Kiểm tra hàng rồi thanh toán cho shipper',
    badge: 'COD',
  },
  {
    value: 'BANK',
    title: 'QR chuyển khoản ngân hàng',
    subtitle: 'Giả lập thanh toán QR, đơn được ghi nhận đã thanh toán',
    badge: 'QR',
  },
  {
    value: 'VISA',
    title: 'Thẻ Visa',
    subtitle: 'Giả lập thanh toán thẻ, không thu tiền thật',
    badge: 'VISA',
  },
]

const BANK_TRANSFER = {
  bank: 'Vietcombank',
  accountName: 'CONG TY SOLEMATE VN',
  accountNo: '1900 1234 8888',
}

function PaymentIcon({ type }) {
  if (type === 'BANK') {
    return (
      <div className="relative grid size-11 place-items-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 8.5 12 4l8 4.5" />
          <path d="M5.5 10h13" />
          <path d="M7 10v7M11 10v7M15 10v7M19 10v7" />
          <path d="M5 19h14" />
        </svg>
        <span className="absolute -right-1 -top-1 rounded-md bg-sky-600 px-1.5 py-0.5 text-[9px] font-black text-white">QR</span>
      </div>
    )
  }
  if (type === 'VISA') {
    return (
      <div className="grid size-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,#102a6b,#2563eb)] text-white shadow-[0_14px_32px_rgba(37,99,235,.22)]">
        <span className="text-[12px] font-black italic tracking-tight">VISA</span>
      </div>
    )
  }
  return (
    <div className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7h16v10H4z" />
        <path d="M7 10h4" />
        <path d="M17 14h.01" />
        <path d="M15 14h.01" />
      </svg>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [contact, setContact] = useState({ fullName: '', phone: '', email: '', province: '', district: '', ward: '', address: '' })
  const [shipping, setShipping] = useState('STANDARD')
  const [payment, setPayment] = useState('COD')
  const [bankConfirmed, setBankConfirmed] = useState(false)
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
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
  const bankContent = `SMVN ${contact.phone || 'SODIENTHOAI'} ${Math.round(grandTotal)}`

  const cardNumberDigits = card.number.replace(/\D/g, '')
  const cardCvvDigits = card.cvv.replace(/\D/g, '')
  const isCardValid = cardNumberDigits.length >= 12 && cardNumberDigits.length <= 19 && cardCvvDigits.length >= 3 && cardCvvDigits.length <= 4 && card.name.trim().length >= 2 && /^\d{2}\/\d{2}$/.test(card.expiry)
  const isPaymentReady = payment === 'COD' || (payment === 'BANK' && bankConfirmed) || (payment === 'VISA' && isCardValid)

  function handlePaymentChange(value) {
    setPayment(value)
    setBankConfirmed(false)
    if (value !== 'VISA') setCard({ number: '', name: '', expiry: '', cvv: '' })
  }

  function formatCardNumber(value) {
    return value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(value) {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  }

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
    if (!isPaymentReady) {
      const message = payment === 'BANK'
        ? 'Vui lòng xác nhận đã quét QR chuyển khoản giả lập.'
        : 'Vui lòng nhập đủ thông tin thẻ Visa giả lập.'
      setToast({ message, type: 'error' })
      return
    }
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
        paymentConfirmed: payment === 'BANK' ? bankConfirmed : payment === 'VISA' ? isCardValid : false,
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
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {SHIPPING_OPTIONS.map(option => (
                  <label key={option.value} className={`group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,.08)] ${shipping===option.value ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-gray-200 hover:border-primary/40'}`}>
                    <input className="sr-only" type="radio" name="shipping" value={option.value} checked={shipping===option.value} onChange={()=>setShipping(option.value)} />
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border transition ${shipping===option.value ? 'border-primary bg-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                      {shipping===option.value && <span className="size-2 rounded-full bg-white" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black text-sole-dark">{option.title}</span>
                      <span className="mt-1 block text-xs text-gray-400">{option.subtitle}</span>
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-sole-dark">{option.price}</span>
                  </label>
                ))}
              </div>
              <div className="grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">
                {PAYMENT_OPTIONS.map(option => (
                  <label key={option.value} className={`group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-3xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,.09)] ${payment===option.value ? 'border-primary bg-[linear-gradient(135deg,rgba(255,106,32,.10),rgba(255,255,255,.96))] ring-2 ring-primary/10' : 'border-gray-200 hover:border-primary/40'}`}>
                    <input className="sr-only" type="radio" name="payment" value={option.value} checked={payment===option.value} onChange={()=>handlePaymentChange(option.value)} />
                    <span className="flex items-start justify-between gap-3">
                      <PaymentIcon type={option.value} />
                      <span className={`grid size-5 place-items-center rounded-full border transition ${payment===option.value ? 'border-primary bg-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                        {payment===option.value && <span className="size-2 rounded-full bg-white" />}
                      </span>
                    </span>
                    <span>
                      <span className="block text-sm font-black text-sole-dark">{option.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-gray-400">{option.subtitle}</span>
                    </span>
                    <span className="mt-auto w-fit rounded-full bg-sole-dark px-2.5 py-1 text-[10px] font-black text-white">{option.badge}</span>
                  </label>
                ))}
              </div>
              {payment === 'BANK' && (
                <div className="grid gap-4 rounded-3xl border border-sky-100 bg-[linear-gradient(135deg,#f0f9ff,#fff)] p-4 sm:grid-cols-[180px,1fr]">
                  <div className="grid aspect-square place-items-center rounded-3xl bg-white p-4 shadow-[0_18px_55px_rgba(2,132,199,.12)] ring-1 ring-sky-100">
                    <div className="grid size-full grid-cols-5 grid-rows-5 gap-1 rounded-2xl bg-slate-950 p-3">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <span key={index} className={`rounded-sm ${[0,1,3,4,5,9,15,19,20,21,23,24,7,11,13,17].includes(index) ? 'bg-white' : 'bg-sky-400'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.18em] text-sky-500">QR chuyển khoản giả lập</p>
                      <h3 className="mt-1 text-lg font-black text-sole-dark">{BANK_TRANSFER.bank}</h3>
                      <div className="mt-3 grid gap-2 text-sm text-gray-600">
                        <div className="flex justify-between gap-4"><span>Chủ tài khoản</span><strong className="text-right text-sole-dark">{BANK_TRANSFER.accountName}</strong></div>
                        <div className="flex justify-between gap-4"><span>Số tài khoản</span><strong className="text-right text-sole-dark">{BANK_TRANSFER.accountNo}</strong></div>
                        <div className="flex justify-between gap-4"><span>Số tiền</span><strong className="text-right text-primary">{formatVND(grandTotal)}</strong></div>
                      </div>
                      <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-xs text-gray-500 ring-1 ring-sky-100">
                        Nội dung: <span className="font-black text-sole-dark">{bankContent}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setBankConfirmed(true)} className={`rounded-2xl px-4 py-3 text-sm font-black transition ${bankConfirmed ? 'bg-emerald-500 text-white shadow-[0_14px_30px_rgba(16,185,129,.24)]' : 'bg-sky-600 text-white hover:-translate-y-0.5 hover:bg-sky-700'}`}>
                      {bankConfirmed ? 'Đã xác nhận chuyển khoản giả lập' : 'Tôi đã quét QR và chuyển khoản'}
                    </button>
                  </div>
                </div>
              )}
              {payment === 'VISA' && (
                <div className="grid gap-4 rounded-3xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff,#fff)] p-4 lg:grid-cols-[260px,1fr]">
                  <div className="flex min-h-40 flex-col justify-between rounded-3xl bg-[linear-gradient(135deg,#132c6f,#2563eb)] p-5 text-white shadow-[0_22px_60px_rgba(37,99,235,.22)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-[.18em] text-white/60">SoleMate Pay</span>
                      <span className="text-lg font-black italic">VISA</span>
                    </div>
                    <div>
                      <p className="font-mono text-lg tracking-[.18em]">{card.number || '4242 4242 4242 4242'}</p>
                      <div className="mt-5 flex items-end justify-between gap-4 text-xs">
                        <span><span className="block text-white/45">CARD HOLDER</span><strong>{card.name || 'NGUYEN VAN A'}</strong></span>
                        <span><span className="block text-white/45">EXP</span><strong>{card.expiry || '12/30'}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-bold text-sole-dark">Số thẻ Visa giả lập</label>
                      <input inputMode="numeric" autoComplete="cc-number" value={card.number} onChange={e => setCard(p => ({ ...p, number: formatCardNumber(e.target.value) }))} className="form-field" placeholder="4242 4242 4242 4242" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-bold text-sole-dark">Tên trên thẻ</label>
                      <input autoComplete="cc-name" value={card.name} onChange={e => setCard(p => ({ ...p, name: e.target.value.toUpperCase() }))} className="form-field" placeholder="NGUYEN VAN A" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold text-sole-dark">Hết hạn</label>
                      <input inputMode="numeric" autoComplete="cc-exp" value={card.expiry} onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))} className="form-field" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold text-sole-dark">CVV</label>
                      <input inputMode="numeric" autoComplete="cc-csc" value={card.cvv} onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="form-field" placeholder="123" />
                    </div>
                    <p className={`sm:col-span-2 rounded-2xl px-4 py-3 text-xs leading-5 ${isCardValid ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-white text-gray-500 ring-1 ring-blue-100'}`}>
                      {isCardValid ? 'Thẻ giả lập hợp lệ. Khi đặt hàng, đơn sẽ được đánh dấu đã thanh toán và backend vẫn trừ tồn kho.' : 'Bạn có thể nhập số bất kỳ từ 12-19 chữ số, tên, hạn MM/YY và CVV 3-4 số để mô phỏng thanh toán.'}
                    </p>
                  </div>
                </div>
              )}
              {payment !== 'COD' && (
                <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-xs leading-5 text-gray-600">
                  <span className="font-bold text-sole-dark">Lưu ý:</span> đây là thanh toán giả lập để test checkout. Không thu tiền thật; đơn chỉ được gửi khi bước thanh toán tương ứng đã hoàn tất.
                </div>
              )}
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
