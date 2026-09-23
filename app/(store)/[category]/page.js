import { getProducts } from '@/lib/db/products'
import ProductCard from '@/components/store/ProductCard'
import { notFound } from 'next/navigation'

const CATEGORY_MAP = {
  nam:         { gender: 'NAM',    title: 'Giày Nam' },
  nu:          { gender: 'NỮ',     title: 'Giày Nữ' },
  'hang-moi':  { sort: 'newest',   title: 'Hàng Mới' },
  sale:        { hasSalePrice: true, title: 'Giảm Giá' },
}

export async function generateMetadata({ params }) {
  const { category } = await params
  const info = CATEGORY_MAP[category]
  return { title: info ? `${info.title} – SoleMate VN` : 'SoleMate VN' }
}

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params
  const info = CATEGORY_MAP[category]
  if (!info) notFound()

  const sp = await searchParams
  const result = await getProducts({
    ...info,
    sort: sp.sort || info.sort || 'newest',
    page: Number(sp.page) || 1,
    limit: 12,
  })

  const { products = [], total = 0 } = result.ok ? result.data : {}

  return (
    <div className="min-h-[60vh] bg-[#f7f8f9] py-10 lg:py-14">
      <div className="store-container">
      <div className="mb-8" data-reveal>
        <span className="section-kicker">SoleMate collection</span>
        <h1 className="section-title mt-1.5">{info.title}</h1>
        <p className="mt-1 text-sm text-gray-400">{total} sản phẩm chính hãng</p>
      </div>

      {products.length === 0 ? (
        <div className="surface-card py-24 text-center text-gray-400">Chưa có sản phẩm trong danh mục này.</div>
      ) : (
        <div className="product-grid" data-reveal>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
      </div>
    </div>
  )
}
