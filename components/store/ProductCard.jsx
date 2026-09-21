'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatVND } from '@/lib/utils'
import ShoeSvg from './ShoeSvg'
import { ArrowRightIcon, HeartIcon } from './Icons'

export default function ProductCard({ product, isWishlisted = false, onWishlistToggle }) {
  const router = useRouter()
  const displayPrice = product.sale_price || product.price
  const hasSale = Boolean(product.sale_price)

  function handleWishlist() {
    if (onWishlistToggle) onWishlistToggle(product.id)
    else router.push('/login')
  }

  return (
    <article className="group relative overflow-hidden rounded-[18px] border border-[#e5e7ea] bg-white shadow-[0_8px_28px_rgba(20,23,28,.055)] transition duration-500 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-[0_20px_45px_rgba(20,23,28,.13)]">
      <Link href={`/product/${product.slug}`} className="block" aria-label={`Xem ${product.name}`}>
        <div className="relative aspect-[1.32/1] overflow-hidden bg-[#eceeef]">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 420px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.055]"
            />
          ) : (
            <ShoeSvg className="absolute inset-x-[7%] top-[8%] h-[82%] w-[86%] transition duration-700 ease-out group-hover:scale-[1.08] group-hover:-rotate-1" color={product.accent || '#e8642a'} brand={product.brand} />
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 pr-12">
            {product.featured && <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white shadow-[0_4px_10px_rgba(242,106,46,.28)]">Nổi bật</span>}
            {hasSale && <span className="rounded-full bg-[#ff3347] px-2.5 py-1 text-[10px] font-bold text-white">SALE</span>}
            {product.best_seller && !product.featured && <span className="rounded-full bg-[#ff9f1c] px-2.5 py-1 text-[10px] font-bold text-white">Bán chạy</span>}
          </div>
        </div>

        <div className="min-h-[132px] p-4 pt-3.5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.08em] text-gray-400">{product.brand}</p>
          <h3 className="line-clamp-1 text-[14px] font-bold text-sole-dark transition-colors group-hover:text-primary-deep">{product.name}</h3>
          <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[15px] font-black text-[#ff4b24]">{formatVND(displayPrice)}</span>
            {hasSale && <span className="text-[11px] text-gray-400 line-through">{formatVND(product.price)}</span>}
          </div>
          <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary group-hover:opacity-100">Xem chi tiết <ArrowRightIcon className="size-3.5" /></span>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleWishlist}
        className={`absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full border border-black/5 bg-white/92 shadow-sm backdrop-blur transition hover:scale-110 hover:border-primary/25 hover:text-primary ${isWishlisted ? 'text-[#ff4058]' : 'text-gray-400'}`}
        aria-label={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      >
        <HeartIcon className="size-[15px]" filled={isWishlisted} />
      </button>
    </article>
  )
}
