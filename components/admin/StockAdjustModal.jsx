'use client'

import { useMemo, useState } from 'react'
import { AdminConfirm } from './ProductFeedback'

export default function StockAdjustModal({ variants, onClose, onSuccess, onError }) {
  const [sku, setSku] = useState(variants?.[0]?.sku || '')
  const [delta, setDelta] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingQuantity, setPendingQuantity] = useState(null)

  const selectedVariant = useMemo(() => variants?.find(variant => variant.sku === sku), [variants, sku])
  const parsedDelta = Number.parseInt(delta, 10)
  const projectedStock = selectedVariant && Number.isInteger(parsedDelta) ? selectedVariant.stock + parsedDelta : selectedVariant?.stock

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const quantity = Number.parseInt(delta, 10)
    if (!sku) return setError('Vui lòng chọn SKU.')
    if (!Number.isInteger(quantity) || quantity === 0) return setError('Số lượng điều chỉnh phải là số nguyên khác 0.')
    if (selectedVariant && selectedVariant.stock + quantity < 0) return setError('Tồn kho sau điều chỉnh không thể âm.')
    if (!note.trim()) return setError('Vui lòng nhập ghi chú để lưu vết điều chỉnh.')

    setPendingQuantity(quantity)
  }

  async function confirmAdjust() {
    if (!Number.isInteger(pendingQuantity)) return
    setLoading(true)
    try {
      const res = await fetch('/api/stock/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, delta: pendingQuantity, note: note.trim() }),
      })
      const data = await res.json()
      if (!data.ok) {
        setError(data.message)
        onError?.(data.message)
        setLoading(false)
        setPendingQuantity(null)
        return
      }
      onSuccess?.(data.data)
    } catch {
      const message = 'Không thể điều chỉnh kho. Vui lòng thử lại.'
      setError(message)
      onError?.(message)
      setLoading(false)
      setPendingQuantity(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#08090b]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <AdminConfirm
        open={Number.isInteger(pendingQuantity)}
        title="Xác nhận điều chỉnh tồn kho?"
        message={`SKU ${sku} sẽ thay đổi ${pendingQuantity > 0 ? '+' : ''}${pendingQuantity} đôi. Tồn sau điều chỉnh dự kiến là ${projectedStock}. Thao tác này sẽ được ghi vào lịch sử kho.`}
        tone={pendingQuantity < 0 ? 'red' : 'emerald'}
        confirmText="Điều chỉnh kho"
        busy={loading}
        onCancel={() => setPendingQuantity(null)}
        onConfirm={confirmAdjust}
      />
      <div className="w-full max-w-2xl animate-[admin-dialog-in_.28s_cubic-bezier(.2,.8,.2,1)] overflow-hidden rounded-[28px] bg-white shadow-[0_34px_110px_rgba(0,0,0,.35)]" onMouseDown={event => event.stopPropagation()}>
        <div className="relative overflow-hidden bg-[#17191c] px-6 py-5 text-white">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-primary">Stock operation</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Điều chỉnh tồn kho</h2>
              <p className="mt-1 text-sm text-white/55">Mọi thay đổi sẽ được ghi vào lịch sử biến động kho.</p>
            </div>
            <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white" aria-label="Đóng modal">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <label>
                <span className="mb-1.5 block text-xs font-black text-gray-500">SKU cần điều chỉnh</span>
                <select value={sku} onChange={event => setSku(event.target.value)} className="form-field" required>
                  {variants?.map(variant => (
                    <option key={variant.sku} value={variant.sku}>{variant.sku} · {variant.productName} · tồn {variant.stock}</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-xs font-black text-gray-500">Số lượng điều chỉnh</span>
                  <input type="number" value={delta} onChange={event => setDelta(event.target.value)} placeholder="VD: 10 hoặc -5" className="form-field" required />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-black text-gray-500">Ghi chú</span>
                  <input type="text" value={note} onChange={event => setNote(event.target.value)} placeholder="VD: Nhập thêm hàng, kiểm kê lệch..." className="form-field" required />
                </label>
              </div>

              {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div>}
            </div>

            <aside className="rounded-[24px] border border-gray-100 bg-[#f7f8f9] p-4">
              <p className="text-xs font-black uppercase tracking-[.14em] text-gray-400">Tóm tắt</p>
              <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                <p className="font-mono text-xs font-black text-primary">{selectedVariant?.sku || 'Chưa chọn SKU'}</p>
                <p className="mt-2 text-sm font-black text-sole-dark">{selectedVariant?.productName || 'Sản phẩm'}</p>
                <p className="mt-1 text-xs text-gray-400">{selectedVariant ? `${selectedVariant.color} · size ${selectedVariant.size}` : 'Màu · size'}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm"><p className="text-[10px] font-bold text-gray-400">Hiện tại</p><p className="mt-1 text-xl font-black text-sole-dark">{selectedVariant?.stock ?? '-'}</p></div>
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm"><p className="text-[10px] font-bold text-gray-400">Sau chỉnh</p><p className={`mt-1 text-xl font-black ${projectedStock < 0 ? 'text-red-500' : 'text-emerald-600'}`}>{projectedStock ?? '-'}</p></div>
              </div>
            </aside>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-600 transition hover:bg-gray-50">Huỷ</button>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(232,100,42,.28)] transition hover:bg-primary-deep disabled:opacity-50">
              {loading && <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />}
              {loading ? 'Đang lưu...' : 'Xác nhận điều chỉnh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
