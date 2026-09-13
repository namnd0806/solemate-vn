'use client'

import { useState } from 'react'

export default function StockAdjustModal({ variants, onClose, onSuccess }) {
  const [sku, setSku] = useState(variants?.[0]?.sku || '')
  const [delta, setDelta] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const d = parseInt(delta, 10)
    if (!sku) return setError('Vui lòng chọn SKU.')
    if (isNaN(d) || d === 0) return setError('Số lượng điều chỉnh phải là số nguyên khác 0.')

    setLoading(true)
    try {
      const res = await fetch('/api/stock/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, delta: d, note }),
      })
      const data = await res.json()
      if (!data.ok) { setError(data.message); setLoading(false); return }
      onSuccess?.(data.data)
      onClose?.()
    } catch {
      setError('Lỗi hệ thống.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold text-sole-dark mb-4">Điều chỉnh tồn kho</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <select value={sku} onChange={e => setSku(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required>
              {variants?.map(v => (
                <option key={v.sku} value={v.sku}>{v.sku} (tồn kho: {v.stock})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng (âm = giảm)</label>
            <input
              type="number"
              value={delta}
              onChange={e => setDelta(e.target.value)}
              placeholder="VD: 10 hoặc -5"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Lý do điều chỉnh..."
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Huỷ
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50">
              {loading ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
