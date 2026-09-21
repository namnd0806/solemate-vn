import { getProducts } from '@/lib/db/products'
import ProductCard from '@/components/store/ProductCard'
import ProductSort from '@/components/store/ProductSort'
import Link from 'next/link'

export const metadata = { title: 'Tất cả sản phẩm' }

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
    <div className="min-h-[60vh] bg-[#f7f8f9] py-10 lg:py-14">
      <div className="store-container">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4" data-reveal>
        <div>
          <span className="section-kicker">SoleMate collection</span>
          <h1 className="section-title mt-1.5">{sp.q ? `Kết quả cho “${sp.q}”` : 'Tất cả sản phẩm'}</h1>
          <p className="mt-1 text-sm text-gray-400">{total} sản phẩm chính hãng đang chờ bạn khám phá</p>
        </div>
        <ProductSort value={params.sort} />
      </div>

      {products.length === 0 ? (
        <div className="surface-card py-24 text-center text-gray-400">Không tìm thấy sản phẩm nào phù hợp.</div>
      ) : (
        <div className="product-grid" data-reveal>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <Link
              key={n}
              href={`?${new URLSearchParams({ ...sp, page: String(n) }).toString()}`}
              className={`grid size-10 place-items-center rounded-xl border text-sm font-bold transition ${n === page ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary'}`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
