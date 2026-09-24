'use client'

import { useEffect, useState } from 'react'
import StockAdjustModal from '@/components/admin/StockAdjustModal'

export default function AdminInventoryPage() {
  const [variants, setVariants] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const threshold = 3
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

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

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
  }, [])

  const filteredVariants = variants.filter(v => {
    const matchesSearch = `${v.sku} ${v.productName} ${v.color} ${v.size}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'ALL' || (filter === 'LOW' && v.stock > 0 && v.stock <= threshold) || (filter === 'OUT' && v.stock === 0)
    return matchesSearch && matchesFilter
  })
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0)
  const lowCount = variants.filter(variant => variant.stock > 0 && variant.stock <= threshold).length
  const outCount = variants.filter(variant => variant.stock === 0).length

  if (loading) return <div className="text-gray-400 py-20 text-center">Đang tải...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-primary">Inventory control</p><h1 className="mt-1 text-3xl font-black tracking-tight text-sole-dark">Kho hàng</h1></div>
        <button onClick={() => setModalOpen(true)}
          className="btn-primary text-sm">
          Điều chỉnh kho
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[["Tổng SKU",variants.length],["Tổng số đôi",totalStock],["Tồn thấp",lowCount],["Hết hàng",outCount]].map(([label,value]) => <div key={label} className="rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_35px_rgba(20,23,28,.06)]"><p className="text-xs font-bold text-gray-400">{label}</p><p className="mt-2 text-2xl font-black text-sole-dark">{value}</p></div>)}
      </div>

      {modalOpen && (
        <StockAdjustModal variants={variants} onClose={() => setModalOpen(false)} onSuccess={() => { setModalOpen(false); load() }} />
      )}

      {/* Variants table */}
      <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_12px_35px_rgba(20,23,28,.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
          <h2 className="font-black text-sole-dark">Tồn kho hiện tại</h2>
          <div className="flex flex-wrap gap-2"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm SKU, sản phẩm..." className="form-field max-w-xs" /><select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-gray-200 px-3 text-sm"><option value="ALL">Tất cả</option><option value="LOW">Tồn thấp</option><option value="OUT">Hết hàng</option></select></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="px-4 py-3">SKU</th><th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Màu</th><th className="px-4 py-3">Size</th>
              <th className="px-4 py-3 text-right">Tồn kho</th>
            </tr></thead>
            <tbody>
              {filteredVariants.map(v => (
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
      <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_12px_35px_rgba(20,23,28,.06)]">
        <div className="border-b border-gray-100 p-4">
          <h2 className="font-black text-sole-dark">Lịch sử biến động kho</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="px-4 py-3">SKU</th><th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3 text-right">Trước</th><th className="px-4 py-3 text-right">Thay đổi</th>
              <th className="px-4 py-3 text-right">Sau</th><th className="px-4 py-3">Ghi chú</th>
              <th className="px-4 py-3">Người thực hiện</th><th className="px-4 py-3">Thời gian</th>
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
                  <td className="px-4 py-2 text-gray-400 text-xs">{m.actor || 'SYSTEM'}</td>
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
