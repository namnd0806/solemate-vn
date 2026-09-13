import { getProducts } from '@/lib/db/products'
import ProductCard from '@/components/store/ProductCard'
import ShoeSvg from '@/components/store/ShoeSvg'

export const metadata = { title: 'SoleMate VN – Giày thể thao chính hãng' }

export default async function HomePage() {
  const [featuredRes, bestSellerRes] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getProducts({ bestSeller: true, limit: 8 }),
  ])

  const featured = featuredRes.ok ? featuredRes.data.products : []
  const bestSellers = bestSellerRes.ok ? bestSellerRes.data.products : []

  return (
    <div>
      {/* Hero */}
      <section className="bg-sole-dark text-white py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Giày thể thao<br /><span className="text-primary">chính hãng</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8">Hàng nghìn mẫu giày từ Nike, Adidas, New Balance và nhiều thương hiệu hàng đầu.</p>
            <a href="/products" className="inline-block bg-primary hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full transition-colors">
              Mua ngay
            </a>
          </div>
          <div className="flex-shrink-0">
            <ShoeSvg className="w-64 h-64" color="#e8642a" />
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-sole-dark mb-8">Sản phẩm nổi bật</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold text-sole-dark mb-8">Bán chạy nhất</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
