import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyJwt } from '@/lib/auth'
import { getWishlist } from '@/lib/db/wishlist'
import ProductCard from '@/components/store/ProductCard'
import Link from 'next/link'

export const metadata = { title: 'Yêu thích – SoleMate VN' }

export default async function WishlistPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('smvn_customer_token')?.value
  const payload = token ? await verifyJwt(token) : null
  if (!payload) redirect('/login?returnUrl=/wishlist')

  const result = await getWishlist(payload.sub)
  const wishlistItems = result.ok ? result.data : []

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-sole-dark mb-8">Sản phẩm yêu thích ({wishlistItems.length})</h1>
      {wishlistItems.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">🤍</p>
          <p>Chưa có sản phẩm yêu thích.</p>
          <Link href="/products" className="mt-4 inline-block text-primary hover:underline">Khám phá ngay</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlistItems.map(w => (
            <ProductCard key={w.id} product={w.products} isWishlisted={true} />
          ))}
        </div>
      )}
    </div>
  )
}
