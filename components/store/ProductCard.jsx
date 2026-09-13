'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatVND } from '@/lib/utils'
import ShoeSvg from './ShoeSvg'

export default function ProductCard({ product, isWishlisted = false, onWishlistToggle }) {
  const router = useRouter()

  const displayPrice = product.sale_price || product.price
  const hasSale = Boolean(product.sale_price)

  async function handleWishlist(e) {
    e.preventDefault()
    if (onWishlistToggle) {
      onWishlistToggle(product.id)
    } else {
      router.push('/login')
    }
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
    >
      {/* Image / placeholder */}
      <div
        className="aspect-square flex items-center justify-center p-6"
        style={{ backgroundColor: product.accent ? `${product.accent}18` : '#f5f5f5' }}
      >
        <ShoeSvg className="w-32 h-32" color={product.accent || '#e8642a'} />
      </div>

      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1">
        {product.featured && (
          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">Nổi bật</span>
        )}
        {hasSale && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">SALE</span>
        )}
        {product.best_seller && !product.featured && (
          <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Bán chạy</span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
        aria-label={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      >
        {isWishlisted ? '❤️' : '🤍'}
      </button>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.brand}</p>
        <h3 className="text-sm font-semibold text-sole-dark group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold">{formatVND(displayPrice)}</span>
          {hasSale && (
            <span className="text-gray-400 text-xs line-through">{formatVND(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
