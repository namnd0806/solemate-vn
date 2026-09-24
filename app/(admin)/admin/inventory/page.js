'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatVND } from '@/lib/utils'
import AdminPagination from '@/components/admin/AdminPagination'
import StockAdjustModal from '@/components/admin/StockAdjustModal'
import { ProductToast } from '@/components/admin/ProductFeedback'

const LOW_STOCK_THRESHOLD = 3
const SKU_PAGE_SIZE = 12
const MOVEMENT_PAGE_SIZE = 8

const STOCK_FILTERS = [
  ['ALL', 'Tất cả'],
  ['LOW', 'Tồn thấp'],
  ['OUT', 'Hết hàng'],
  ['HEALTHY', 'Ổn định'],
]

const STATUS_FILTERS = [
  ['ALL', 'Mọi trạng thái'],
  ['ACTIVE', 'Đang bán'],
  ['INACTIVE', 'Đã ẩn'],
]

const SORTS = [
  ['LOW_FIRST', 'Tồn thấp trước'],
  ['HIGH_FIRST', 'Tồn cao trước'],
  ['SKU_ASC', 'SKU A-Z'],
  ['NAME_ASC', 'Tên sản phẩm'],
]

const MOVEMENT_LABELS = {
  SALE: 'Bán hàng',
  CANCEL_RETURN: 'Hoàn kho',
  ADJUST: 'Điều chỉnh',
}

function MetricIcon({ tone, children }) {
  const tones = {
    dark: 'bg-[#17191c] text-white',
    orange: 'bg-orange-50 text-primary',
    red: 'bg-red-50 text-red-500',
    green: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-sky-50 text-sky-600',
  }
  return <span className={`grid size-14 shrink-0 place-items-center rounded-full shadow-inner ${tones[tone]}`}>{children}</span>
}

function InventoryMetricCard({ label, value, hint, tone, trend, children }) {
  const glow = { green: 'from-emerald-50 to-white', blue: 'from-sky-50 to-white', orange: 'from-orange-50 to-white', red: 'from-red-50 to-white' }
  const trendTone = tone === 'red' ? 'bg-red-50 text-red-500' : tone === 'blue' ? 'bg-sky-50 text-sky-600' : tone === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-primary'
  return (
    <div className={`group relative overflow-hidden rounded-[26px] border border-gray-200 bg-gradient-to-br ${glow[tone] || glow.green} p-5 shadow-[0_18px_50px_rgba(20,23,28,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(20,23,28,.12)]`}>
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/65 blur-2xl" />
      <div className="relative flex items-center gap-5">
        <MetricIcon tone={tone}>{children}</MetricIcon>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-3xl font-black leading-none tracking-tight text-sole-dark">{value}</p>
            <span className={`rounded-full px-3 py-1 text-xs font-black shadow-sm ${trendTone}`}>{trend}</span>
          </div>
          <p className="mt-3 text-base font-black text-sole-dark">{label}</p>
          <p className="mt-1 text-xs font-bold text-gray-400">{hint}</p>
        </div>
        <div className="hidden items-end gap-1 self-end sm:flex">
          {[12, 28, 18, 38, 25, 42].map((height, index) => <span key={index} className={`w-1.5 rounded-full ${tone === 'blue' ? 'bg-sky-200' : tone === 'red' ? 'bg-red-200' : tone === 'green' ? 'bg-emerald-200' : 'bg-orange-200'}`} style={{ height }} />)}
        </div>
      </div>
    </div>
  )
}

function StockBadge({ stock }) {
  if (stock === 0) {
    return <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-black text-red-600">Hết hàng</span>
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-black text-primary">Tồn thấp</span>
  }
  return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">Ổn định</span>
}

export default function AdminInventoryPage() {
  const [variants, setVariants] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [movementSearch, setMovementSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sort, setSort] = useState('LOW_FIRST')
  const [movementType, setMovementType] = useState('ALL')
  const [skuPage, setSkuPage] = useState(1)
  const [movementPage, setMovementPage] = useState(1)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3200)
  }

  async function load() {
    try {
      setLoading(true)
      const [prodRes, movRes] = await Promise.all([
        fetch('/api/products?status=ALL&limit=300'),
        fetch('/api/stock/movements'),
      ])
      const [prodData, movData] = await Promise.all([prodRes.json(), movRes.json()])
      if (prodData.ok) {
        const allVariants = prodData.data.products.flatMap(product =>
          (product.variants || []).map(variant => ({
            ...variant,
            productName: product.name,
            productId: product.id,
            productStatus: product.status,
            brand: product.brand,
            productCode: product.code || product.slug || product.id,
            imageUrl: product.image_url,
            price: product.price,
          }))
        )
        setVariants(allVariants)
      } else {
        showToast(prodData.message || 'Không tải được tồn kho.', 'error')
      }
      if (movData.ok) setMovements(movData.data.movements || [])
      else showToast(movData.message || 'Không tải được lịch sử kho.', 'error')
    } catch {
      showToast('Không thể kết nối máy chủ kho.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
  }, [])

  const filteredVariants = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return variants
      .filter(variant => {
        const searchable = `${variant.sku} ${variant.productName} ${variant.brand || ''} ${variant.color} ${variant.size}`.toLowerCase()
        const matchesSearch = !keyword || searchable.includes(keyword)
        const matchesStock =
          stockFilter === 'ALL' ||
          (stockFilter === 'LOW' && variant.stock > 0 && variant.stock <= LOW_STOCK_THRESHOLD) ||
          (stockFilter === 'OUT' && variant.stock === 0) ||
          (stockFilter === 'HEALTHY' && variant.stock > LOW_STOCK_THRESHOLD)
        const matchesStatus = statusFilter === 'ALL' || variant.productStatus === statusFilter
        return matchesSearch && matchesStock && matchesStatus
      })
      .sort((a, b) => {
        if (sort === 'HIGH_FIRST') return b.stock - a.stock
        if (sort === 'SKU_ASC') return a.sku.localeCompare(b.sku)
        if (sort === 'NAME_ASC') return a.productName.localeCompare(b.productName)
        return a.stock - b.stock
      })
  }, [variants, search, stockFilter, statusFilter, sort])

  const filteredMovements = useMemo(() => {
    const keyword = movementSearch.trim().toLowerCase()
    return movements.filter(movement => {
      const searchable = `${movement.sku || ''} ${movement.note || ''} ${movement.actor || ''} ${movement.type || ''}`.toLowerCase()
      return (movementType === 'ALL' || movement.type === movementType) && (!keyword || searchable.includes(keyword))
    })
  }, [movements, movementType, movementSearch])

  const skuTotalPages = Math.max(1, Math.ceil(filteredVariants.length / SKU_PAGE_SIZE))
  const movementTotalPages = Math.max(1, Math.ceil(filteredMovements.length / MOVEMENT_PAGE_SIZE))
  const currentSkuPage = Math.min(skuPage, skuTotalPages)
  const currentMovementPage = Math.min(movementPage, movementTotalPages)
  const pagedVariants = filteredVariants.slice((currentSkuPage - 1) * SKU_PAGE_SIZE, currentSkuPage * SKU_PAGE_SIZE)
  const pagedMovements = filteredMovements.slice((currentMovementPage - 1) * MOVEMENT_PAGE_SIZE, currentMovementPage * MOVEMENT_PAGE_SIZE)

  const metrics = useMemo(() => ({
    sku: variants.length,
    total: variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0),
    low: variants.filter(variant => variant.stock > 0 && variant.stock <= LOW_STOCK_THRESHOLD).length,
    out: variants.filter(variant => variant.stock === 0).length,
  }), [variants])
  const activeFilterCount = [
    search.trim(),
    stockFilter !== 'ALL',
    statusFilter !== 'ALL',
    sort !== 'LOW_FIRST',
  ].filter(Boolean).length

  if (loading) {
    return (
      <div className="space-y-6">
        <ProductToast key={toast?.id} toast={toast} onClose={() => setToast(null)} />
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Inventory control</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-sole-dark">Kho hàng</h1>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => <div key={index} className="h-28 animate-pulse rounded-[22px] border border-gray-100 bg-white" />)}
        </div>
        <div className="h-96 animate-pulse rounded-[26px] border border-gray-100 bg-white" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProductToast key={toast?.id} toast={toast} onClose={() => setToast(null)} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.24em] text-primary">Admin workspace</p>
          <h1 className="mt-1 text-4xl font-black tracking-[-.04em] text-sole-dark">Kho hàng</h1>
          <p className="mt-2 text-sm text-gray-400">Theo dõi tồn kho theo SKU, cảnh báo tồn thấp và lịch sử nhập xuất.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M12 5v14M5 12h14" /></svg>
          Điều chỉnh kho
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {[
          ['Tổng SKU', metrics.sku, 'Biến thể đang quản lý', 'green', '+12%', <svg key="sku" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7 12 3l8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></svg>],
          ['Tổng số đôi', metrics.total, 'Tồn thực tế theo SKU', 'blue', '+5%', <svg key="stock" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 20V8l7-4 7 4v12" /><path d="M9 20v-7h6v7" /></svg>],
          ['Tồn thấp', metrics.low, `Từ 1 đến ${LOW_STOCK_THRESHOLD} đôi`, 'orange', metrics.low ? `+${metrics.low}` : '0', <svg key="low" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01" /><path d="M10.3 4.3 2.8 17.5A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.5L13.7 4.3a2 2 0 0 0-3.4 0Z" /></svg>],
          ['Hết hàng', metrics.out, 'Cần nhập bổ sung', 'red', metrics.out ? `+${metrics.out}` : '0%', <svg key="out" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /><circle cx="12" cy="12" r="9" /></svg>],
        ].map(([label, value, hint, tone, trend, icon]) => (
          <InventoryMetricCard key={label} label={label} value={value} hint={hint} tone={tone} trend={trend}>{icon}</InventoryMetricCard>
        ))}
      </div>

      {modalOpen && (
        <StockAdjustModal
          variants={variants}
          onClose={() => setModalOpen(false)}
          onSuccess={(data) => {
            setModalOpen(false)
            showToast(`Đã điều chỉnh SKU ${data?.sku || ''}. Tồn mới: ${data?.after ?? 'đã cập nhật'}.`)
            load()
          }}
          onError={message => showToast(message, 'error')}
        />
      )}

      <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_18px_55px_rgba(20,23,28,.07)]">
        <div className="relative border-b border-gray-100 p-4 sm:p-5">
          <div className="absolute right-8 top-0 h-20 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <svg viewBox="0 0 24 24" className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input value={search} onChange={event => { setSearch(event.target.value); setSkuPage(1) }} placeholder="Tìm SKU, sản phẩm, thương hiệu, màu, size..." className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-14 pr-16 text-sm font-bold text-sole-dark shadow-inner outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(242,106,46,.1)]" />
              <span className="absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-xl bg-gray-100 px-2.5 py-1 text-xs font-black text-gray-400 sm:block">⌘ K</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex">
              <select value={stockFilter} onChange={event => { setStockFilter(event.target.value); setSkuPage(1) }} className="h-14 rounded-2xl border border-gray-200 bg-white px-4 text-xs font-black text-gray-600 outline-none transition hover:border-primary/40 focus:border-primary">{STOCK_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setSkuPage(1) }} className="h-14 rounded-2xl border border-gray-200 bg-white px-4 text-xs font-black text-gray-600 outline-none transition hover:border-primary/40 focus:border-primary">{STATUS_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <select value={sort} onChange={event => { setSort(event.target.value); setSkuPage(1) }} className="h-14 rounded-2xl border border-gray-200 bg-white px-4 text-xs font-black text-gray-600 outline-none transition hover:border-primary/40 focus:border-primary">{SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            </div>
          </div>
          <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap gap-2">
              {[
                ['ALL', `Tất cả (${variants.length})`, 'bg-primary text-white border-primary'],
                ['LOW', `Tồn thấp (${metrics.low})`, 'bg-orange-50 text-primary border-orange-100'],
                ['OUT', `Hết hàng (${metrics.out})`, 'bg-red-50 text-red-500 border-red-100'],
                ['HEALTHY', `Ổn định (${Math.max(0, variants.length - metrics.low - metrics.out)})`, 'bg-emerald-50 text-emerald-700 border-emerald-100'],
              ].map(([value, label, activeClass]) => (
                <button key={value} type="button" onClick={() => { setStockFilter(value); setSkuPage(1) }} className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 font-black transition hover:-translate-y-0.5 ${stockFilter === value ? activeClass : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-primary/30'}`}>
                  <span className="size-2 rounded-full bg-current" />{label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 4v6h-6" /></svg>
                Làm mới
              </button>
              <button type="button" onClick={() => setAdvancedOpen(open => !open)} aria-expanded={advancedOpen} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-[#ff4f24] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_26px_rgba(242,106,46,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(242,106,46,.32)]">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" /></svg>
                Lọc nâng cao
                {activeFilterCount > 0 && <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-primary">{activeFilterCount}</span>}
              </button>
            </div>
            <span className="w-full font-bold text-gray-400">Hiển thị <b className="text-sole-dark">{filteredVariants.length}</b> / {variants.length} SKU</span>
            {(search || stockFilter !== 'ALL' || statusFilter !== 'ALL' || sort !== 'LOW_FIRST') && (
              <button type="button" onClick={() => { setSearch(''); setStockFilter('ALL'); setStatusFilter('ALL'); setSort('LOW_FIRST'); setSkuPage(1) }} className="font-black text-primary hover:text-primary-deep">Xóa bộ lọc</button>
            )}
          </div>
          {advancedOpen && (
            <div className="relative mt-4 grid gap-3 rounded-[24px] border border-orange-100 bg-gradient-to-br from-orange-50/70 to-white p-4 shadow-inner md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[.14em] text-gray-400">Tồn kho</span>
                <select value={stockFilter} onChange={event => { setStockFilter(event.target.value); setSkuPage(1) }} className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-600 outline-none transition focus:border-primary">{STOCK_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              </label>
              <label className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[.14em] text-gray-400">Trạng thái bán</span>
                <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setSkuPage(1) }} className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-600 outline-none transition focus:border-primary">{STATUS_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              </label>
              <label className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[.14em] text-gray-400">Sắp xếp</span>
                <select value={sort} onChange={event => { setSort(event.target.value); setSkuPage(1) }} className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-600 outline-none transition focus:border-primary">{SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              </label>
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-100 md:hidden">
          {pagedVariants.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm font-bold text-gray-400">Không có SKU phù hợp với bộ lọc hiện tại.</div>
          ) : pagedVariants.map(variant => (
            <article key={variant.sku} className="group p-4 transition hover:bg-orange-50/35">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-black uppercase tracking-wide text-primary">{variant.sku}</p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-black text-sole-dark">{variant.productName}</h3>
                  <p className="mt-1 text-xs font-bold text-gray-400">{variant.brand || 'SoleMate'} · {variant.color} · size {variant.size}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${variant.productStatus === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                  {variant.productStatus === 'ACTIVE' ? 'Đang bán' : 'Đã ẩn'}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f7f8f9] px-4 py-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.12em] text-gray-400">Tồn kho</p>
                  <p className={`mt-1 text-2xl font-black leading-none ${variant.stock <= LOW_STOCK_THRESHOLD ? 'text-red-500' : 'text-sole-dark'}`}>{variant.stock}</p>
                </div>
                <StockBadge stock={variant.stock} />
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-[#f7f8f9] text-left text-[10px] uppercase tracking-[.12em] text-gray-400">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Sản phẩm</th>
                <th className="px-5 py-3">Thuộc tính</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Tồn kho</th>
                <th className="px-5 py-3 text-right">Giá bán</th>
                <th className="px-5 py-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {pagedVariants.length === 0 ? (
                <tr><td colSpan="7" className="px-5 py-16 text-center text-sm font-bold text-gray-400">Không có SKU phù hợp với bộ lọc hiện tại.</td></tr>
              ) : pagedVariants.map(variant => (
                <tr key={variant.sku} className="border-t border-gray-100 transition hover:bg-orange-50/30">
                  <td className="px-5 py-4"><span className="rounded-xl bg-gray-100 px-3 py-1.5 font-mono text-xs font-black text-gray-600">{variant.sku}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gray-100">
                        {variant.imageUrl ? <img src={variant.imageUrl} alt="" className="h-full w-full object-contain p-1.5" /> : <svg viewBox="0 0 24 24" className="size-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16l-1 13H5L4 7Z" /></svg>}
                      </span>
                      <div>
                        <p className="font-black text-sole-dark">{variant.productName}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{variant.brand || 'SoleMate'} · {variant.productCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{variant.color} · size {variant.size}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${variant.productStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{variant.productStatus === 'ACTIVE' ? 'Đang bán' : 'Đã ẩn'}</span></td>
                  <td className={`px-5 py-4 text-right text-lg font-black ${variant.stock <= LOW_STOCK_THRESHOLD ? 'text-red-500' : 'text-sole-dark'}`}>{variant.stock}</td>
                  <td className="px-5 py-4 text-right font-black text-sole-dark">{formatVND(variant.price || 0)}</td>
                  <td className="px-5 py-4 text-xs font-bold text-gray-400">{variant.updated_at ? new Date(variant.updated_at).toLocaleString('vi-VN') : 'Vừa cập nhật'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination page={currentSkuPage} totalPages={skuTotalPages} totalItems={filteredVariants.length} pageSize={SKU_PAGE_SIZE} label="SKU" onPageChange={next => setSkuPage(Math.min(Math.max(1, next), skuTotalPages))} />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_18px_55px_rgba(20,23,28,.07)]">
        <div className="relative border-b border-gray-100 p-5">
          <div className="absolute right-8 top-0 h-20 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-black text-sole-dark">Lịch sử biến động kho</h2>
            <p className="mt-1 text-xs text-gray-400">Ghi nhận bán hàng, hoàn kho và điều chỉnh thủ công.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-2.5 text-xs font-black text-primary">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5v14" /></svg>
              Thống kê nhanh
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-[#ff4f24] px-4 py-2.5 text-xs font-black text-white shadow-[0_12px_26px_rgba(242,106,46,.25)]">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 20h16" /></svg>
              Xuất dữ liệu
            </button>
          </div>
          </div>
          <div className="relative mt-4 flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <svg viewBox="0 0 24 24" className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input value={movementSearch} onChange={event => { setMovementSearch(event.target.value); setMovementPage(1) }} placeholder="Tìm SKU, sản phẩm, người thực hiện, ghi chú..." className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-14 pr-16 text-sm font-bold text-sole-dark shadow-inner outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(242,106,46,.1)]" />
              <span className="absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-xl bg-gray-100 px-2.5 py-1 text-xs font-black text-gray-400 sm:block">⌘ K</span>
            </div>
            <select value={movementType} onChange={event => { setMovementType(event.target.value); setMovementPage(1) }} className="h-14 rounded-2xl border border-gray-200 bg-white px-4 text-xs font-black text-gray-600 outline-none transition hover:border-primary/40 focus:border-primary">
              <option value="ALL">Mọi loại biến động</option>
              {Object.entries(MOVEMENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button type="button" onClick={load} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-black text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 4v6h-6" /></svg>
              Làm mới
            </button>
          </div>
          <div className="relative mt-3 flex flex-wrap gap-2">
            {[
              ['ALL', `Tất cả (${movements.length})`, 'bg-primary text-white border-primary'],
              ['ADJUST', `Điều chỉnh (${movements.filter(m => m.type === 'ADJUST').length})`, 'bg-orange-50 text-primary border-orange-100'],
              ['SALE', `Bán hàng (${movements.filter(m => m.type === 'SALE').length})`, 'bg-sky-50 text-sky-700 border-sky-100'],
              ['CANCEL_RETURN', `Hoàn kho (${movements.filter(m => m.type === 'CANCEL_RETURN').length})`, 'bg-emerald-50 text-emerald-700 border-emerald-100'],
            ].map(([value, label, activeClass]) => (
              <button key={value} type="button" onClick={() => { setMovementType(value); setMovementPage(1) }} className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black transition hover:-translate-y-0.5 ${movementType === value ? activeClass : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-primary/30'}`}>
                <span className="size-2 rounded-full bg-current" />{label}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100 md:hidden">
          {pagedMovements.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm font-bold text-gray-400">Chưa có biến động kho phù hợp.</div>
          ) : pagedMovements.map(movement => (
            <article key={movement.id} className="p-4 transition hover:bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] font-black text-gray-500">{movement.sku}</p>
                  <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${movement.type === 'SALE' ? 'bg-sky-50 text-sky-700' : movement.type === 'CANCEL_RETURN' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-primary'}`}>{MOVEMENT_LABELS[movement.type] || movement.type}</span>
                </div>
                <p className="text-right text-xs font-bold text-gray-400">{new Date(movement.created_at).toLocaleString('vi-VN')}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-gray-100 bg-[#f7f8f9] text-center">
                <div className="p-3"><p className="text-[10px] font-bold text-gray-400">Trước</p><p className="font-black text-sole-dark">{movement.before}</p></div>
                <div className="border-x border-gray-100 p-3"><p className="text-[10px] font-bold text-gray-400">Thay đổi</p><p className={`font-black ${movement.delta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{movement.delta > 0 ? '+' : ''}{movement.delta}</p></div>
                <div className="p-3"><p className="text-[10px] font-bold text-gray-400">Sau</p><p className="font-black text-sole-dark">{movement.after}</p></div>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">{movement.note || 'Không có ghi chú'} · {movement.actor || 'SYSTEM'}</p>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-[#f7f8f9] text-left text-[10px] uppercase tracking-[.12em] text-gray-400">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Loại</th>
                <th className="px-5 py-3 text-right">Trước</th>
                <th className="px-5 py-3 text-right">Thay đổi</th>
                <th className="px-5 py-3 text-right">Sau</th>
                <th className="px-5 py-3">Ghi chú</th>
                <th className="px-5 py-3">Người thực hiện</th>
                <th className="px-5 py-3">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {pagedMovements.length === 0 ? (
                <tr><td colSpan="8" className="px-5 py-14 text-center text-sm font-bold text-gray-400">Chưa có biến động kho phù hợp.</td></tr>
              ) : pagedMovements.map(movement => (
                <tr key={movement.id} className="border-t border-gray-100 transition hover:bg-gray-50">
                  <td className="px-5 py-4 font-mono text-xs font-black text-gray-600">{movement.sku}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${movement.type === 'SALE' ? 'bg-sky-50 text-sky-700' : movement.type === 'CANCEL_RETURN' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-primary'}`}>{MOVEMENT_LABELS[movement.type] || movement.type}</span></td>
                  <td className="px-5 py-4 text-right text-gray-500">{movement.before}</td>
                  <td className={`px-5 py-4 text-right font-black ${movement.delta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{movement.delta > 0 ? '+' : ''}{movement.delta}</td>
                  <td className="px-5 py-4 text-right font-black text-sole-dark">{movement.after}</td>
                  <td className="max-w-[240px] px-5 py-4 text-xs leading-5 text-gray-500">{movement.note || 'Không có ghi chú'}</td>
                  <td className="px-5 py-4 text-xs font-bold text-gray-400">{movement.actor || 'SYSTEM'}</td>
                  <td className="px-5 py-4 text-xs text-gray-400">{new Date(movement.created_at).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination page={currentMovementPage} totalPages={movementTotalPages} totalItems={filteredMovements.length} pageSize={MOVEMENT_PAGE_SIZE} label="biến động" onPageChange={next => setMovementPage(Math.min(Math.max(1, next), movementTotalPages))} />
      </section>
    </div>
  )
}
