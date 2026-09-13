'use client'

import { useEffect, useState } from 'react'
import { formatVND } from '@/lib/utils'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/products?status=ALL&limit=100')
    const data = await res.json()
    if (data.ok) setProducts(data.data.products)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleStatus(p) {
    const newStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const res = await fetch(`/api/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    const data = await res.json()
    if (data.ok) { setMsg(`Đã cập nhật trạng thái ${p.name}`); load() }
    else setMsg(data.message)
  }

  if (loading) return <div className="text-gray-400 py-20 text-center">Đang tải...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-sole-dark">Quản lý sản phẩm</h1>
      </div>
      {msg && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{msg}</div>}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-sole-gray border-b text-left text-gray-500">
            <th className="px-4 py-3">Sản phẩm</th>
            <th className="px-4 py-3">Thương hiệu</th>
            <th className="px-4 py-3">Giá</th>
            <th className="px-4 py-3">Variants</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Thao tác</th>
          </tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-sole-dark">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.brand}</td>
                <td className="px-4 py-3 text-primary font-semibold">{formatVND(p.sale_price || p.price)}</td>
                <td className="px-4 py-3 text-gray-500">{p.variants?.length || 0}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.status === 'ACTIVE' ? 'Đang bán' : 'Tạm ẩn'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(p)}
                    className="text-xs text-blue-600 hover:underline">
                    {p.status === 'ACTIVE' ? 'Ẩn' : 'Hiện'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
