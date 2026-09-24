'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { formatVND } from '@/lib/utils'
import Link from 'next/link'
import { isProductSaleActive } from '@/lib/pricing'
import { ProductConfirm, ProductToast } from '@/components/admin/ProductFeedback'

const EMPTY_PRODUCT = {
  name: '', slug: '', brand: '', gender: 'NAM', category: 'LIFESTYLE',
  price: '', sale_price: '', sale_start_at: '', sale_end_at: '', description: '',
  status: 'ACTIVE', featured: false, image_url: '',
}
const EMPTY_VARIANT = { sku: '', color: '', size: '', stock: '0', status: 'ACTIVE' }

const GENDERS = ['NAM', 'NỮ']
const CATEGORIES = ['LIFESTYLE', 'RUNNING']
const BRANDS = ['NIKE', 'ADIDAS', 'NEW BALANCE', 'ASICS', 'CONVERSE', 'PUMA', 'VANS']

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

function toLocalInput(value) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function MetricIcon({ children, tone = 'orange' }) {
  const tones = { orange: 'bg-orange-50 text-primary', green: 'bg-emerald-50 text-emerald-600', blue: 'bg-sky-50 text-sky-600', red: 'bg-red-50 text-red-500' }
  return <span className={`grid size-11 place-items-center rounded-2xl ${tones[tone]}`}>{children}</span>
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
  const [toast, setToast] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [changingStatus, setChangingStatus] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [genderFilter, setGenderFilter] = useState('ALL')
  const [saleFilter, setSaleFilter] = useState('ALL')
  const fileRef = useRef()

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/products?status=ALL&limit=200')
      const data = await res.json()
      if (data.ok) setProducts(data.data.products || [])
      else showToast(data.message || 'Không thể tải danh mục.', 'error')
    } catch {
      showToast('Không thể kết nối máy chủ. Vui lòng thử lại.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ message: msg, type, id: Date.now() })
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
      sale_start_at: toLocalInput(p.sale_start_at), sale_end_at: toLocalInput(p.sale_end_at),
      description: p.description || '', status: p.status,
      featured: p.featured, image_url: p.image_url || '',
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
      product: {
        ...form,
        price: Number(form.price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        sale_start_at: form.sale_start_at ? new Date(form.sale_start_at).toISOString() : null,
        sale_end_at: form.sale_end_at ? new Date(form.sale_end_at).toISOString() : null,
      },
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

  async function confirmStatusChange() {
    const p = confirmTarget
    if (!p) return
    setChangingStatus(true)
    const newStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      const res = await fetch(`/api/products/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      const data = await res.json()
      if (data.ok) { showToast(newStatus === 'ACTIVE' ? 'Sản phẩm đã xuất hiện trở lại trên cửa hàng.' : 'Sản phẩm đã được ẩn an toàn khỏi cửa hàng.'); await load() }
      else showToast(data.message, 'error')
    } catch { showToast('Không thể cập nhật trạng thái sản phẩm.', 'error') }
    finally { setChangingStatus(false); setConfirmTarget(null) }
  }

  const filtered = useMemo(() => products.filter(p => {
    const keyword = search.trim().toLowerCase()
    const searchable = `${p.name} ${p.brand} ${(p.variants || []).map(v => v.sku).join(' ')}`.toLowerCase()
    const saleActive = isProductSaleActive(p)
    return (!keyword || searchable.includes(keyword)) && (statusFilter === 'ALL' || p.status === statusFilter) && (genderFilter === 'ALL' || p.gender === genderFilter) && (saleFilter === 'ALL' || (saleFilter === 'SALE' ? saleActive : !saleActive))
  }), [products, search, statusFilter, genderFilter, saleFilter])

  const metrics = useMemo(() => ({
    active: products.filter(p => p.status === 'ACTIVE').length,
    sale: products.filter(p => isProductSaleActive(p)).length,
    lowStock: products.filter(p => (p.variants || []).reduce((sum, v) => sum + Number(v.stock || 0), 0) <= 5).length,
    sold: products.reduce((sum, p) => sum + Number(p.sales_count || 0), 0),
  }), [products])

  return (
    <div className="space-y-6">
      <ProductToast key={toast?.id} toast={toast} onClose={() => setToast(null)} />
      <ProductConfirm product={confirmTarget} busy={changingStatus} onCancel={() => setConfirmTarget(null)} onConfirm={confirmStatusChange} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Catalog workspace</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-sole-dark">Quản lý sản phẩm</h1>
          <p className="mt-2 text-sm text-gray-400">Theo dõi danh mục, giá bán và hiệu suất sản phẩm tại một nơi.</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M12 5v14M5 12h14"/></svg> Thêm sản phẩm
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ['Đang kinh doanh', metrics.active, 'Sản phẩm hiển thị', 'green', <svg key="a" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16l-1 13H5L4 7Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg>],
          ['Đang khuyến mãi', metrics.sale, 'Sale đúng lịch', 'orange', <svg key="b" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 12 8-8h6l2 2v6l-8 8-8-8Z"/><circle cx="16" cy="8" r="1"/></svg>],
          ['Cần chú ý kho', metrics.lowStock, 'Tổng tồn ≤ 5 đôi', 'red', <svg key="c" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7 12 3l8 4v10l-8 4-8-4V7Z"/><path d="M12 12v5m0-9v.01"/></svg>],
          ['Đã bán ghi nhận', metrics.sold, 'Tự động từ đơn hợp lệ', 'blue', <svg key="d" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 20V10m7 10V4m7 16v-7"/></svg>],
        ].map(([label, value, hint, tone, icon]) => <div key={label} className="flex items-center gap-4 rounded-[22px] border border-gray-200 bg-white p-4 shadow-[0_12px_36px_rgba(20,23,28,.055)]"><MetricIcon tone={tone}>{icon}</MetricIcon><div><p className="text-2xl font-black leading-none text-sole-dark">{value}</p><p className="mt-1.5 text-xs font-bold text-gray-600">{label}</p><p className="mt-0.5 text-[10px] text-gray-400">{hint}</p></div></div>)}
      </div>

      <div className="rounded-[24px] border border-gray-200 bg-white p-3 shadow-[0_12px_36px_rgba(20,23,28,.05)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1"><svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, thương hiệu hoặc SKU..." className="form-field pl-11" /></div>
          <div className="grid grid-cols-3 gap-2 lg:flex">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="min-h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-600 outline-none focus:border-primary"><option value="ALL">Mọi trạng thái</option><option value="ACTIVE">Đang bán</option><option value="INACTIVE">Đã ẩn</option></select>
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="min-h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-600 outline-none focus:border-primary"><option value="ALL">Nam & Nữ</option><option value="NAM">Nam</option><option value="NỮ">Nữ</option></select>
            <select value={saleFilter} onChange={e => setSaleFilter(e.target.value)} className="min-h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-600 outline-none focus:border-primary"><option value="ALL">Mọi mức giá</option><option value="SALE">Đang sale</option><option value="REGULAR">Giá thường</option></select>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 px-1 pt-3 text-xs"><span className="font-bold text-gray-400">Hiển thị <b className="text-sole-dark">{filtered.length}</b> / {products.length} sản phẩm</span>{(search || statusFilter !== 'ALL' || genderFilter !== 'ALL' || saleFilter !== 'ALL') && <button type="button" onClick={() => { setSearch(''); setStatusFilter('ALL'); setGenderFilter('ALL'); setSaleFilter('ALL') }} className="font-black text-primary hover:text-primary-deep">Xóa bộ lọc</button>}</div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-[24px] border border-gray-100 bg-white p-4">
              <div className="mb-3 aspect-[1.55] rounded-2xl bg-gray-100" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-gray-300 bg-white py-20 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gray-100 text-gray-400"><svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg></span><h3 className="mt-4 font-black text-sole-dark">Không tìm thấy sản phẩm phù hợp</h3><p className="mt-1 text-sm text-gray-400">Thử thay đổi từ khóa hoặc bộ lọc hiện tại.</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(p => (
            <div key={p.id}
              className="group overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_10px_35px_rgba(20,23,28,.055)] transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_22px_55px_rgba(20,23,28,.12)]">
              <div className="relative aspect-[1.55] overflow-hidden bg-gradient-to-br from-[#f6f7f8] to-[#eceef0]">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-sm font-bold text-gray-300">Chưa có ảnh sản phẩm</div>
                )}
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{isProductSaleActive(p) && <span className="rounded-full bg-[#ff4058] px-2.5 py-1 text-[10px] font-black text-white shadow-sm">SALE</span>}{p.is_best_seller && <span className="rounded-full bg-[#17191c] px-2.5 py-1 text-[10px] font-black text-white">TOP BÁN CHẠY</span>}</div>
                <div className="absolute right-3 top-3"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black backdrop-blur ${p.status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50/90 text-emerald-700' : 'border-gray-200 bg-white/90 text-gray-500'}`}><i className={`size-1.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {p.status === 'ACTIVE' ? 'Đang bán' : 'Đã ẩn'}
                  </span></div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.12em] text-gray-400">{p.brand} · {p.gender} · {p.category}</p><h3 className="mt-1 line-clamp-1 text-base font-black text-sole-dark">{p.name}</h3></div><span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 font-mono text-[9px] font-bold text-gray-500">{p.id}</span></div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-lg font-black text-primary">{formatVND(isProductSaleActive(p) ? p.sale_price : p.price)}</span>
                  {isProductSaleActive(p) && <span className="text-xs text-gray-400 line-through">{formatVND(p.price)}</span>}
                </div>
                <div className="mt-4 grid grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-[#f7f8f9] py-3 text-center"><div><p className="text-sm font-black text-sole-dark">{p.variants?.length || 0}</p><p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Biến thể</p></div><div><p className="text-sm font-black text-sole-dark">{(p.variants || []).reduce((sum, v) => sum + Number(v.stock || 0), 0)}</p><p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Tồn kho</p></div><div><p className="text-sm font-black text-sole-dark">{p.sales_count || 0}</p><p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Đã bán</p></div></div>

                <div className="mt-4 flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#17191c] py-2.5 text-xs font-black text-white transition hover:bg-primary">
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 20 4-.8L19 8l-3-3L5 16l-1 4Z"/><path d="m14 7 3 3"/></svg> Chỉnh sửa
                  </button>
                  <button onClick={() => setConfirmTarget(p)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-black transition ${p.status === 'ACTIVE' ? 'border-orange-200 text-primary hover:bg-orange-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                    {p.status === 'ACTIVE' ? 'Ẩn khỏi shop' : 'Hiển thị lại'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#08090b]/70 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-5xl animate-[admin-dialog-in_.28s_cubic-bezier(.2,.8,.2,1)] overflow-hidden rounded-[30px] bg-white shadow-[0_34px_110px_rgba(0,0,0,.35)]">
            <div className="relative overflow-hidden bg-[#17191c] px-6 py-5 text-white sm:px-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">Product studio</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">{editing ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}</h2>
                  <p className="mt-1 text-sm text-white/55">Chuẩn hoá ảnh, giá, sale và biến thể để đồng bộ với cửa hàng.</p>
                </div>
                <button type="button" onClick={() => setShowForm(false)} className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white" aria-label="Đóng form">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="grid gap-0 lg:grid-cols-[340px_1fr]">
              <aside className="border-b border-gray-100 bg-[#f7f8f9] p-6 lg:border-b-0 lg:border-r">
                <label className="mb-3 block text-xs font-black uppercase tracking-[.14em] text-gray-400">Ảnh sản phẩm</label>
                <button type="button" onClick={() => fileRef.current?.click()} className="group relative aspect-square w-full overflow-hidden rounded-[26px] border border-dashed border-gray-300 bg-white shadow-inner transition hover:border-primary/70">
                  {form.image_url ? (
                    <img src={form.image_url} alt="preview" className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="grid h-full place-items-center px-8 text-center">
                      <span>
                        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-orange-50 text-primary"><svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h3l2-3h6l2 3h3v13H4V7Z" /><circle cx="12" cy="13" r="3.5" /></svg></span>
                        <span className="mt-4 block text-sm font-black text-sole-dark">Tải ảnh sản phẩm</span>
                        <span className="mt-1 block text-xs leading-5 text-gray-400">Nền sáng, giày nằm giữa khung, WebP/JPG/PNG tối đa 5MB.</span>
                      </span>
                    </span>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingImg} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#17191c] px-4 py-3 text-xs font-black text-white transition hover:bg-primary disabled:opacity-50">
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4m0 0 4 4m-4-4-4 4" /><path d="M4 20h16" /></svg>
                    {uploadingImg ? 'Đang upload...' : 'Chọn ảnh'}
                  </button>
                  {form.image_url && <button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))} className="grid size-11 place-items-center rounded-2xl border border-red-100 text-red-500 transition hover:bg-red-50" aria-label="Xóa ảnh"><svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg></button>}
                </div>

                <div className="mt-5 rounded-2xl border border-orange-100 bg-white p-4">
                  <p className="text-xs font-black text-sole-dark">Bán chạy tự động</p>
                  <p className="mt-2 text-xs leading-5 text-gray-500">Nhãn bán chạy được tính từ số lượng bán của đơn đã xác nhận, đang đóng gói, đang giao hoặc đã giao. Admin không cần tích tay.</p>
                </div>
              </aside>

              <div className="max-h-[78vh] overflow-y-auto p-6 sm:p-8">
                <div className="space-y-7">
                  <section className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(20,23,28,.045)]">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div><h3 className="font-black text-sole-dark">Thông tin bán hàng</h3><p className="mt-1 text-xs text-gray-400">Tên, phân loại, giá và trạng thái hiển thị.</p></div>
                      <label className="flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-black text-primary">
                        <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="size-4 rounded accent-primary" />
                        Nổi bật trang chủ
                      </label>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-black text-gray-500">Tên sản phẩm *</span><input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: editing ? p.slug : slugify(e.target.value) }))} className="form-field" /></label>
                      <label><span className="mb-1.5 block text-xs font-black text-gray-500">Slug *</span><input required value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className="form-field" /></label>
                      <label><span className="mb-1.5 block text-xs font-black text-gray-500">Thương hiệu *</span><select required value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} className="form-field">{BRANDS.map(b => <option key={b} value={b}>{b}</option>)}</select></label>
                      <label><span className="mb-1.5 block text-xs font-black text-gray-500">Giới tính *</span><select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="form-field">{GENDERS.map(g => <option key={g} value={g}>{g}</option>)}</select></label>
                      <label><span className="mb-1.5 block text-xs font-black text-gray-500">Danh mục *</span><select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="form-field">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
                      <label><span className="mb-1.5 block text-xs font-black text-gray-500">Giá gốc (VNĐ) *</span><input required type="number" min="1" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="form-field" /></label>
                      <label><span className="mb-1.5 block text-xs font-black text-gray-500">Giá sale (VNĐ)</span><input type="number" min="1" value={form.sale_price} onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))} className="form-field" /></label>
                      <label><span className="mb-1.5 block text-xs font-black text-gray-500">Bắt đầu sale</span><input type="datetime-local" value={form.sale_start_at} onChange={e => setForm(p => ({ ...p, sale_start_at: e.target.value }))} disabled={!form.sale_price} className="form-field disabled:bg-gray-50 disabled:text-gray-400" /></label>
                      <label><span className="mb-1.5 block text-xs font-black text-gray-500">Kết thúc sale</span><input type="datetime-local" value={form.sale_end_at} onChange={e => setForm(p => ({ ...p, sale_end_at: e.target.value }))} disabled={!form.sale_price} className="form-field disabled:bg-gray-50 disabled:text-gray-400" /></label>
                      <label><span className="mb-1.5 block text-xs font-black text-gray-500">Trạng thái</span><select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="form-field"><option value="ACTIVE">Đang bán</option><option value="INACTIVE">Ẩn</option></select></label>
                      <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-black text-gray-500">Mô tả</span><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="form-field resize-none" /></label>
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(20,23,28,.045)]">
                    <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="font-black text-sole-dark">Biến thể & SKU</h3><p className="mt-1 text-xs text-gray-400">Mỗi dòng là một SKU theo màu, size và tồn kho ban đầu.</p></div><button type="button" onClick={() => setVariants(v => [...v, { ...EMPTY_VARIANT }])} className="rounded-2xl bg-orange-50 px-4 py-2 text-xs font-black text-primary transition hover:bg-orange-100">Thêm biến thể</button></div>
                    <div className="overflow-hidden rounded-2xl border border-gray-100">
                      <div className="hidden grid-cols-[1.4fr_1fr_.8fr_.8fr_42px] gap-2 bg-[#f7f8f9] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-gray-400 md:grid"><span>SKU</span><span>Màu</span><span>Size</span><span>Tồn</span><span /></div>
                      <div className="max-h-64 divide-y divide-gray-100 overflow-y-auto">
                        {variants.map((v, i) => (
                          <div key={i} className="grid grid-cols-1 gap-2 p-3 md:grid-cols-[1.4fr_1fr_.8fr_.8fr_42px]">
                            <input placeholder="SKU" value={v.sku} onChange={e => { const nv = [...variants]; nv[i] = { ...nv[i], sku: e.target.value }; setVariants(nv) }} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
                            <input placeholder="Màu" value={v.color} onChange={e => { const nv = [...variants]; nv[i] = { ...nv[i], color: e.target.value }; setVariants(nv) }} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
                            <input placeholder="Size" value={v.size} onChange={e => { const nv = [...variants]; nv[i] = { ...nv[i], size: e.target.value }; setVariants(nv) }} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
                            <input type="number" min="0" placeholder="Tồn" value={v.stock} disabled={Boolean(editing)} onChange={e => { const nv = [...variants]; nv[i] = { ...nv[i], stock: e.target.value }; setVariants(nv) }} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-100 disabled:text-gray-400" />
                            <button type="button" onClick={() => setVariants(v => v.filter((_, j) => j !== i))} disabled={variants.length === 1} className="grid size-10 place-items-center rounded-xl text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30" aria-label="Xóa biến thể"><svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {editing && <p className="mt-3 text-xs leading-5 text-gray-400">Tồn kho chỉ thay đổi tại <Link href="/admin/inventory" className="font-black text-primary hover:underline">màn Kho hàng</Link> để giữ lịch sử nhập xuất.</p>}
                  </section>

                  {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div>}
                </div>

                <div className="sticky bottom-0 -mx-6 -mb-6 mt-7 flex flex-col gap-3 border-t border-gray-100 bg-white/92 px-6 py-4 backdrop-blur sm:-mx-8 sm:-mb-8 sm:flex-row sm:justify-end sm:px-8">
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-600 transition hover:bg-gray-50">Huỷ</button>
                  <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(232,100,42,.28)] transition hover:bg-primary-deep disabled:opacity-50">
                    {saving && <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />}
                    {saving ? 'Đang lưu...' : editing ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
