'use client'

import { useEffect, useState, useRef } from 'react'
import { formatVND } from '@/lib/utils'
import Image from 'next/image'

const EMPTY_PRODUCT = {
  name: '', slug: '', brand: '', gender: 'NAM', category: 'LIFESTYLE',
  price: '', sale_price: '', accent: '#e8642a', description: '',
  status: 'ACTIVE', featured: false, best_seller: false, image_url: '',
}
const EMPTY_VARIANT = { sku: '', color: '', size: '', stock: '0', status: 'ACTIVE' }

const GENDERS = ['NAM', 'NỮ', 'TRẺ EM', 'UNISEX']
const CATEGORIES = ['LIFESTYLE', 'RUNNING', 'KIDS']
const BRANDS = ['NIKE', 'ADIDAS', 'NEW BALANCE', 'ASICS', 'CONVERSE', 'PUMA', 'VANS']

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [variants, setVariants] = useState([{ ...EMPTY_VARIANT }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [uploadingImg, setUploadingImg] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)
  const fileRef = useRef()

  async function load() {
    setLoading(true)
    const res = await fetch('/api/products?status=ALL&limit=200')
    const data = await res.json()
    if (data.ok) setProducts(data.data.products || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function openNew() {
    setForm(EMPTY_PRODUCT)
    setVariants([{ ...EMPTY_VARIANT }])
    setEditing(null)
    setError('')
    setShowForm(true)
  }

  function openEdit(p) {
    setForm({
      name: p.name, slug: p.slug, brand: p.brand, gender: p.gender,
      category: p.category, price: p.price, sale_price: p.sale_price || '',
      accent: p.accent, description: p.description || '', status: p.status,
      featured: p.featured, best_seller: p.best_seller, image_url: p.image_url || '',
    })
    setVariants(p.variants?.map(v => ({
      sku: v.sku, color: v.color, size: v.size, stock: v.stock, status: v.status
    })) || [{ ...EMPTY_VARIANT }])
    setEditing(p.id)
    setError('')
    setShowForm(true)
  }

  async function uploadImage(file) {
    setUploadingImg(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/products/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingImg(false)
    if (data.ok) setForm(p => ({ ...p, image_url: data.data.url }))
    else setError('Upload ảnh thất bại: ' + data.message)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      product: { ...form, price: Number(form.price), sale_price: form.sale_price ? Number(form.sale_price) : null },
      variants: variants.map(v => ({ ...v, stock: Number(v.stock) })),
    }
    const url = editing ? `/api/products/${editing}` : '/api/products'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setSaving(false)
    if (!data.ok) { setError(data.message); return }
    showToast(editing ? 'Đã cập nhật sản phẩm!' : 'Đã thêm sản phẩm!')
    setShowForm(false)
    load()
  }

  async function handleDelete(p) {
    const res = await fetch(`/api/products/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'INACTIVE' })
    })
    const data = await res.json()
    if (data.ok) { showToast('Đã ẩn sản phẩm'); load() }
    else showToast(data.message, 'error')
    setDeleteTarget(null)
  }

  async function toggleStatus(p) {
    const newStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const res = await fetch(`/api/products/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    const data = await res.json()
    if (data.ok) { showToast(`Đã ${newStatus === 'ACTIVE' ? 'hiện' : 'ẩn'} sản phẩm`); load() }
    else showToast(data.message, 'error')
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sole-dark">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-400 mt-1">{products.length} sản phẩm</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
          <span className="text-lg">+</span> Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên, thương hiệu..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group overflow-hidden">
              {/* Image */}
              <div className="h-40 relative overflow-hidden" style={{ backgroundColor: `${p.accent}18` }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">👟</div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.status === 'ACTIVE' ? 'Đang bán' : 'Đã ẩn'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{p.brand} · {p.gender}</p>
                <h3 className="font-semibold text-sole-dark mt-0.5 mb-2 line-clamp-1">{p.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-primary font-bold">{formatVND(p.sale_price || p.price)}</span>
                  {p.sale_price && <span className="text-xs text-gray-400 line-through">{formatVND(p.price)}</span>}
                </div>
                <p className="text-xs text-gray-400 mb-3">{p.variants?.length || 0} biến thể</p>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 hover:border-primary transition-all font-medium">
                    ✏️ Sửa
                  </button>
                  <button onClick={() => toggleStatus(p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${p.status === 'ACTIVE' ? 'border border-orange-200 text-orange-600 hover:bg-orange-50' : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                    {p.status === 'ACTIVE' ? '🙈 Ẩn' : '👁️ Hiện'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-sole-dark">{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh sản phẩm</label>
                <div className="flex gap-4 items-start">
                  <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileRef.current?.click()}>
                    {form.image_url ? (
                      <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-2xl mb-1">📸</div>
                        <div className="text-xs">Click để upload</div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
                    <button type="button" onClick={() => fileRef.current?.click()}
                      disabled={uploadingImg}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                      {uploadingImg ? '⏳ Đang upload...' : '📤 Chọn ảnh'}
                    </button>
                    {form.image_url && (
                      <button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))}
                        className="ml-2 px-4 py-2 border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                        🗑️ Xóa ảnh
                      </button>
                    )}
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP — tối đa 5MB</p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tên sản phẩm *</label>
                  <input required value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: editing ? p.slug : slugify(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Slug *</label>
                  <input required value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Thương hiệu *</label>
                  <select value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all">
                    {BRANDS.map(b => <option key={b}>{b}</option>)}
                    <option value="">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Giới tính *</label>
                  <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all">
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Danh mục *</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Giá gốc (VNĐ) *</label>
                  <input required type="number" min="1" value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Giá sale (VNĐ)</label>
                  <input type="number" min="1" value={form.sale_price}
                    onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Màu accent</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.accent} onChange={e => setForm(p => ({ ...p, accent: e.target.value }))}
                      className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
                    <input value={form.accent} onChange={e => setForm(p => ({ ...p, accent: e.target.value }))}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all">
                    <option value="ACTIVE">Đang bán</option>
                    <option value="INACTIVE">Ẩn</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Mô tả</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none" />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                      className="w-4 h-4 rounded accent-primary" />
                    <span className="text-sm text-gray-700">Nổi bật</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.best_seller} onChange={e => setForm(p => ({ ...p, best_seller: e.target.checked }))}
                      className="w-4 h-4 rounded accent-primary" />
                    <span className="text-sm text-gray-700">Bán chạy</span>
                  </label>
                </div>
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sole-dark text-sm">Biến thể (SKU)</h3>
                  <button type="button" onClick={() => setVariants(v => [...v, { ...EMPTY_VARIANT }])}
                    className="text-xs text-primary hover:underline font-medium">+ Thêm biến thể</button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-6 gap-2 items-center bg-gray-50 rounded-xl p-2">
                      {[['sku','SKU',2],['color','Màu',1],['size','Size',1]].map(([k,l,cols]) => (
                        <input key={k} placeholder={l} value={v[k]}
                          onChange={e => { const nv=[...variants]; nv[i]={...nv[i],[k]:e.target.value}; setVariants(nv) }}
                          className={`col-span-${cols} border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary transition-all`} />
                      ))}
                      <input type="number" placeholder="Tồn kho" value={v.stock}
                        onChange={e => { const nv=[...variants]; nv[i]={...nv[i],stock:e.target.value}; setVariants(nv) }}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary transition-all" />
                      <button type="button" onClick={() => setVariants(v => v.filter((_,j) => j !== i))}
                        disabled={variants.length === 1}
                        className="text-red-400 hover:text-red-600 disabled:opacity-30 text-sm">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Huỷ
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50">
                  {saving ? '⏳ Đang lưu...' : editing ? '💾 Cập nhật' : '✨ Tạo sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
