import { getProducts } from '@/lib/db/products'
import ProductCard from '@/components/store/ProductCard'
import Link from 'next/link'

export const metadata = { title: 'Tất cả sản phẩm – SoleMate VN' }

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'best_seller', label: 'Bán chạy' },
]

export default async function PLPPage({ searchParams }) {
  const sp = await searchParams
  const params = {
    search: sp.q || undefined,
    gender: sp.gender || undefined,
    category: sp.category || undefined,
    brand: sp.brand || undefined,
    sort: sp.sort || 'newest',
    page: Number(sp.page) || 1,
    limit: 12,
  }

  const result = await getProducts(params)
  const { products = [], total = 0, totalPages = 1, page = 1 } = result.ok ? result.data : {}

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-sole-dark">
          {sp.q ? `Kết quả cho "${sp.q}"` : 'Tất cả sản phẩm'}
          <span className="text-sm font-normal text-gray-400 ml-2">({total} sản phẩm)</span>
        </h1>
        <form>
          <select
            name="sort"
            defaultValue={params.sort}
            onChange={e => { const f = e.target.form; const url = new URL(window.location.href); url.searchParams.set('sort', e.target.value); window.location.href = url.toString() }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">Không tìm thấy sản phẩm nào.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <Link
              key={n}
              href={`?${new URLSearchParams({ ...sp, page: n })}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm border transition-colors ${n === page ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary text-gray-700'}`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
