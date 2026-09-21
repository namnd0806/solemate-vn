import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyJwt } from '@/lib/auth'
import { getWishlist } from '@/lib/db/wishlist'
import ProductCard from '@/components/store/ProductCard'
import { HeartIcon, ArrowRightIcon } from '@/components/store/Icons'
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
    <main className="mx-auto min-h-[62vh] max-w-7xl px-4 py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4" data-reveal>
        <div>
          <p className="section-kicker">Bộ sưu tập của bạn</p>
          <h1 className="section-title mt-1.5">Sản phẩm yêu thích</h1>
          <p className="mt-2 text-sm text-gray-500">{wishlistItems.length} sản phẩm bạn đã lưu để xem lại.</p>
        </div>
        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:gap-3">
          Khám phá thêm <ArrowRightIcon />
        </Link>
      </div>
      {wishlistItems.length === 0 ? (
        <div className="surface-card flex flex-col items-center px-6 py-20 text-center" data-reveal>
          <div className="mb-5 grid size-20 place-items-center rounded-full bg-primary/8 text-primary"><HeartIcon className="size-9" /></div>
          <h2 className="text-xl font-black text-sole-dark">Danh sách đang chờ đôi giày đầu tiên</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">Lưu lại những mẫu bạn thích để dễ dàng so sánh và quay lại mua sau.</p>
          <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(242,106,46,.25)] transition hover:-translate-y-0.5 hover:bg-primary-deep">Khám phá ngay <ArrowRightIcon /></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 min-[440px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" data-reveal>
          {wishlistItems.map(w => (
            <ProductCard key={w.id} product={w.products} isWishlisted={true} />
          ))}
        </div>
      )}
    </main>
  )
}
