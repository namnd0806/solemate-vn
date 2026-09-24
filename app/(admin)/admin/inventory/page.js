'use client'

import { useEffect, useMemo, useState } from 'react'
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
  }
  return <span className={`grid size-11 place-items-center rounded-2xl ${tones[tone]}`}>{children}</span>
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

function Pager({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 text-xs">
      <span className="font-bold text-gray-400">Trang <b className="text-sole-dark">{page}</b> / {totalPages}</span>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1} className="rounded-xl border border-gray-200 px-3 py-2 font-black text-gray-600 transition hover:border-primary hover:text-primary disabled:opacity-35">Trước</button>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page === totalPages} className="rounded-xl border border-gray-200 px-3 py-2 font-black text-gray-600 transition hover:border-primary hover:text-primary disabled:opacity-35">Sau</button>
      </div>
    </div>
  )
}

export default function AdminInventoryPage() {
  const [variants, setVariants] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sort, setSort] = useState('LOW_FIRST')
  const [movementType, setMovementType] = useState('ALL')
  const [skuPage, setSkuPage] = useState(1)
  const [movementPage, setMovementPage] = useState(1)
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

  const filteredMovements = useMemo(() => (
    movements.filter(movement => movementType === 'ALL' || movement.type === movementType)
  ), [movements, movementType])

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
          <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Inventory control</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-sole-dark">Kho hàng</h1>
          <p className="mt-2 text-sm text-gray-400">Theo dõi tồn kho theo SKU, cảnh báo tồn thấp và lịch sử nhập xuất.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M12 5v14M5 12h14" /></svg>
          Điều chỉnh kho
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ['Tổng SKU', metrics.sku, 'Biến thể đang quản lý', 'dark', <svg key="sku" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7 12 3l8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></svg>],
          ['Tổng số đôi', metrics.total, 'Tồn thực tế theo SKU', 'green', <svg key="stock" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 20V8l7-4 7 4v12" /><path d="M9 20v-7h6v7" /></svg>],
          ['Tồn thấp', metrics.low, `Từ 1 đến ${LOW_STOCK_THRESHOLD} đôi`, 'orange', <svg key="low" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01" /><path d="M10.3 4.3 2.8 17.5A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.5L13.7 4.3a2 2 0 0 0-3.4 0Z" /></svg>],
          ['Hết hàng', metrics.out, 'Cần nhập bổ sung', 'red', <svg key="out" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /><circle cx="12" cy="12" r="9" /></svg>],
        ].map(([label, value, hint, tone, icon]) => (
          <div key={label} className="flex items-center gap-4 rounded-[22px] border border-gray-200 bg-white p-4 shadow-[0_12px_36px_rgba(20,23,28,.055)]">
            <MetricIcon tone={tone}>{icon}</MetricIcon>
            <div>
              <p className="text-2xl font-black leading-none text-sole-dark">{value}</p>
              <p className="mt-1.5 text-xs font-bold text-gray-600">{label}</p>
              <p className="mt-0.5 text-[10px] text-gray-400">{hint}</p>
            </div>
          </div>
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

      <section className="overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-[0_12px_36px_rgba(20,23,28,.055)]">
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input value={search} onChange={event => { setSearch(event.target.value); setSkuPage(1) }} placeholder="Tìm SKU, sản phẩm, thương hiệu, màu, size..." className="form-field pl-11" />
            </div>
            <div className="grid grid-cols-3 gap-2 lg:flex">
              <select value={stockFilter} onChange={event => { setStockFilter(event.target.value); setSkuPage(1) }} className="min-h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-600 outline-none focus:border-primary">{STOCK_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setSkuPage(1) }} className="min-h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-600 outline-none focus:border-primary">{STATUS_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <select value={sort} onChange={event => { setSort(event.target.value); setSkuPage(1) }} className="min-h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-600 outline-none focus:border-primary">{SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-gray-400">Hiển thị <b className="text-sole-dark">{filteredVariants.length}</b> / {variants.length} SKU</span>
            {(search || stockFilter !== 'ALL' || statusFilter !== 'ALL' || sort !== 'LOW_FIRST') && (
              <button type="button" onClick={() => { setSearch(''); setStockFilter('ALL'); setStatusFilter('ALL'); setSort('LOW_FIRST') }} className="font-black text-primary hover:text-primary-deep">Xóa bộ lọc</button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-[#f7f8f9] text-left text-[10px] uppercase tracking-[.12em] text-gray-400">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Sản phẩm</th>
                <th className="px-5 py-3">Thuộc tính</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Tồn kho</th>
                <th className="px-5 py-3">Cảnh báo</th>
              </tr>
            </thead>
            <tbody>
              {pagedVariants.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-16 text-center text-sm font-bold text-gray-400">Không có SKU phù hợp với bộ lọc hiện tại.</td></tr>
              ) : pagedVariants.map(variant => (
                <tr key={variant.sku} className="border-t border-gray-100 transition hover:bg-orange-50/30">
                  <td className="px-5 py-4"><span className="rounded-xl bg-gray-100 px-3 py-1.5 font-mono text-xs font-black text-gray-600">{variant.sku}</span></td>
                  <td className="px-5 py-4">
                    <p className="font-black text-sole-dark">{variant.productName}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{variant.brand || 'SoleMate'} · {variant.productId}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{variant.color} · size {variant.size}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${variant.productStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{variant.productStatus === 'ACTIVE' ? 'Đang bán' : 'Đã ẩn'}</span></td>
                  <td className={`px-5 py-4 text-right text-lg font-black ${variant.stock <= LOW_STOCK_THRESHOLD ? 'text-red-500' : 'text-sole-dark'}`}>{variant.stock}</td>
                  <td className="px-5 py-4"><StockBadge stock={variant.stock} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={currentSkuPage} totalPages={skuTotalPages} onPage={next => setSkuPage(Math.min(Math.max(1, next), skuTotalPages))} />
      </section>

      <section className="overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-[0_12px_36px_rgba(20,23,28,.055)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5">
          <div>
            <h2 className="font-black text-sole-dark">Lịch sử biến động kho</h2>
            <p className="mt-1 text-xs text-gray-400">Ghi nhận bán hàng, hoàn kho và điều chỉnh thủ công.</p>
          </div>
          <select value={movementType} onChange={event => { setMovementType(event.target.value); setMovementPage(1) }} className="min-h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-600 outline-none focus:border-primary">
            <option value="ALL">Mọi loại biến động</option>
            {Object.entries(MOVEMENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
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
        <Pager page={currentMovementPage} totalPages={movementTotalPages} onPage={next => setMovementPage(Math.min(Math.max(1, next), movementTotalPages))} />
      </section>
    </div>
  )
}
