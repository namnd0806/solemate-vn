import { getProducts } from '@/lib/db/products'
import ProductCard from '@/components/store/ProductCard'
import { notFound } from 'next/navigation'

const CATEGORY_MAP = {
  nam:         { gender: 'NAM',    title: 'Giày Nam' },
  nu:          { gender: 'NỮ',     title: 'Giày Nữ' },
  'tre-em':    { gender: 'TRẺ EM', title: 'Giày Trẻ Em' },
  'thuong-hieu': { brand: undefined, title: 'Thương Hiệu', status: 'ACTIVE' },
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
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-sole-dark mb-2">{info.title}</h1>
      <p className="text-gray-400 text-sm mb-8">{total} sản phẩm</p>

      {products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">Chưa có sản phẩm.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
