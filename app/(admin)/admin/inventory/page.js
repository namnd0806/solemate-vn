'use client'

import { useEffect, useState } from 'react'
import StockAdjustModal from '@/components/admin/StockAdjustModal'

export default function AdminInventoryPage() {
  const [variants, setVariants] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [threshold, setThreshold] = useState(3)

  async function load() {
    setLoading(true)
    const [prodRes, movRes] = await Promise.all([
      fetch('/api/products?status=ALL&limit=200'),
      fetch('/api/stock/movements'),
    ])
    const prodData = await prodRes.json()
    const movData = await movRes.json()
    if (prodData.ok) {
      const allVariants = prodData.data.products.flatMap(p =>
        (p.variants || []).map(v => ({ ...v, productName: p.name }))
      )
      setVariants(allVariants)
    }
    if (movData.ok) setMovements(movData.data.movements || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="text-gray-400 py-20 text-center">Đang tải...</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sole-dark">Quản lý kho hàng</h1>
        <button onClick={() => setModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors">
          Điều chỉnh kho
        </button>
      </div>

      {modalOpen && (
        <StockAdjustModal variants={variants} onClose={() => setModalOpen(false)} onSuccess={() => { setModalOpen(false); load() }} />
      )}

      {/* Variants table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-sole-gray">
          <h2 className="font-semibold text-sole-dark text-sm">Tồn kho hiện tại</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="px-4 py-3">SKU</th><th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Màu</th><th className="px-4 py-3">Size</th>
              <th className="px-4 py-3 text-right">Tồn kho</th>
            </tr></thead>
            <tbody>
              {variants.map(v => (
                <tr key={v.sku} className={`border-b last:border-0 ${v.stock <= threshold ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                  <td className="px-4 py-2 font-mono text-xs">{v.sku}</td>
                  <td className="px-4 py-2 text-gray-700">{v.productName}</td>
                  <td className="px-4 py-2 text-gray-500">{v.color}</td>
                  <td className="px-4 py-2 text-gray-500">{v.size}</td>
                  <td className={`px-4 py-2 text-right font-bold ${v.stock <= threshold ? 'text-red-600' : 'text-sole-dark'}`}>{v.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movements */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-sole-gray">
          <h2 className="font-semibold text-sole-dark text-sm">Lịch sử biến động kho</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="px-4 py-3">SKU</th><th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3 text-right">Trước</th><th className="px-4 py-3 text-right">Thay đổi</th>
              <th className="px-4 py-3 text-right">Sau</th><th className="px-4 py-3">Ghi chú</th>
              <th className="px-4 py-3">Thời gian</th>
            </tr></thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs">{m.sku}</td>
                  <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${m.type === 'SALE' ? 'bg-blue-100 text-blue-700' : m.type === 'CANCEL_RETURN' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.type}</span></td>
                  <td className="px-4 py-2 text-right">{m.before}</td>
                  <td className={`px-4 py-2 text-right font-semibold ${m.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>{m.delta > 0 ? '+' : ''}{m.delta}</td>
                  <td className="px-4 py-2 text-right font-semibold">{m.after}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{m.note}</td>
                  <td className="px-4 py-2 text-gray-400 text-xs">{new Date(m.created_at).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
