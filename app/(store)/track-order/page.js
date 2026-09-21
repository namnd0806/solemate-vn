'use client'

import { useState } from 'react'
import { formatVND } from '@/lib/utils'
import { BoxIcon, SearchIcon, TruckIcon } from '@/components/store/Icons'

const STATUS_LABELS = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', SHIPPING:'Đang giao', DELIVERED:'Đã giao', CANCELLED:'Đã hủy' }
const STATUS_COLORS = { PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700', SHIPPING:'bg-indigo-100 text-indigo-700', DELIVERED:'bg-green-100 text-green-700', CANCELLED:'bg-red-100 text-red-600' }

export default function TrackOrderPage() {
  const [form, setForm] = useState({ orderId: '', phone: '' })
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setOrder(null)
    setLoading(true)
    const res = await fetch('/api/orders/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (!data.ok) { setError(data.message); return }
    setOrder(data.data)
  }

  return (
    <main className="mx-auto min-h-[68vh] max-w-5xl px-4 py-10 sm:py-14">
      <div className="grid items-start gap-6 lg:grid-cols-[.82fr_1.18fr]">
        <section className="overflow-hidden rounded-[24px] bg-sole-dark p-7 text-white shadow-[0_24px_60px_rgba(20,23,28,.18)] sm:p-9" data-reveal>
          <div className="mb-8 grid size-12 place-items-center rounded-2xl bg-primary"><TruckIcon /></div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-primary-light">Theo dõi hành trình</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Tra cứu đơn hàng</h1>
          <p className="mt-4 text-sm leading-7 text-white/60">Nhập đúng mã đơn và số điện thoại đã dùng khi đặt hàng để xem trạng thái mới nhất.</p>
          <div className="mt-10 space-y-4 text-sm text-white/70">
            {['Xác nhận trạng thái đơn hàng','Kiểm tra chi tiết sản phẩm','Theo dõi tổng giá trị đơn'].map((item, index) => (
              <div key={item} className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full border border-white/15 text-xs font-bold text-primary-light">{index + 1}</span>{item}</div>
            ))}
          </div>
        </section>

        <div data-reveal>
          <form onSubmit={handleSubmit} className="mb-6 space-y-5 rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_55px_rgba(20,23,28,.08)] sm:p-8">
            <div><p className="section-kicker">Thông tin đơn hàng</p><h2 className="mt-1.5 text-2xl font-black text-sole-dark">Tìm đơn của bạn</h2></div>
            <div>
              <label htmlFor="orderId" className="mb-1.5 block text-sm font-semibold text-gray-600">Mã đơn hàng</label>
              <input id="orderId" required value={form.orderId} onChange={e => setForm(p => ({...p, orderId: e.target.value}))} placeholder="VD: SMVN-17094823451234" className="form-field" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-gray-600">Số điện thoại đặt hàng</label>
              <input id="phone" type="tel" required value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="VD: 0912345678" className="form-field" />
            </div>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-bold text-white shadow-[0_10px_24px_rgba(242,106,46,.22)] transition hover:-translate-y-0.5 hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50">
              <SearchIcon className="size-4" /> {loading ? 'Đang tra cứu...' : 'Tra cứu đơn hàng'}
            </button>
          </form>

          {order && (
            <div className="rounded-[22px] border border-gray-200 bg-white p-6 shadow-[0_12px_40px_rgba(20,23,28,.07)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-sole-dark text-white"><BoxIcon /></span><h2 className="font-bold text-sole-dark">#{order.id}</h2></div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[order.status] || order.status}</span>
              </div>
              <div className="space-y-3 text-sm">
                {order.order_items?.map(i => (
                  <div key={i.id} className="flex justify-between gap-4">
                    <span className="text-gray-600"><strong className="block text-sole-dark">{i.name}</strong><span className="text-xs">{i.color} · Size {i.size} × {i.qty}</span></span>
                    <span className="whitespace-nowrap font-semibold">{formatVND(i.line_total)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-4 font-bold"><span>Tổng cộng</span><span className="text-lg text-primary">{formatVND(order.total)}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
