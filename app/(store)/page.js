import Image from 'next/image'
import Link from 'next/link'
import { getProducts } from '@/lib/db/products'
import ProductCard from '@/components/store/ProductCard'
import {
  ArrowRightIcon, RefreshIcon, ShieldIcon, SparkIcon, TruckIcon,
} from '@/components/store/Icons'
import { HERO_IMAGE } from '@/lib/hero-image'

export const metadata = { title: 'SoleMate VN – Giày thể thao chính hãng' }

const BENEFITS = [
  { icon: TruckIcon, title: 'Giao hàng toàn quốc', subtitle: 'Nhanh chóng, an toàn' },
  { icon: ShieldIcon, title: 'Sản phẩm chính hãng', subtitle: 'Cam kết 100%' },
  { icon: RefreshIcon, title: 'Đổi trả dễ dàng', subtitle: 'Trong 7 ngày' },
]

export default async function HomePage() {
  const [featuredRes, bestSellerRes] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getProducts({ bestSeller: true, limit: 8 }),
  ])

  const featured = featuredRes.ok ? featuredRes.data.products : []
  const bestSellers = bestSellerRes.ok ? bestSellerRes.data.products : []

  return (
    <div className="bg-[#f7f8f9]">
      <section className="relative isolate min-h-[475px] overflow-hidden bg-[#0b0c0d] text-white lg:min-h-[515px]">
        <Image
          src={HERO_IMAGE}
          alt="Giày thể thao trắng trên nền đá với ánh sáng cam"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[64%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,7,.98)_0%,rgba(5,6,7,.92)_28%,rgba(5,6,7,.46)_55%,rgba(5,6,7,.08)_100%)] sm:bg-[linear-gradient(90deg,rgba(5,6,7,.98)_0%,rgba(5,6,7,.84)_34%,rgba(5,6,7,.18)_70%,rgba(5,6,7,.02)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.36),transparent_50%)]" />
        <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-primary/10 blur-[90px] [animation:hero-glow_5s_ease-in-out_infinite]" />

        <div className="store-container relative flex min-h-[475px] items-center py-14 lg:min-h-[515px]">
          <div className="max-w-[560px]">
            <div className="hero-enter flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.43em] text-white/55">
              <span className="h-px w-8 bg-primary" /> Step a better you
            </div>
            <h1 className="hero-enter hero-enter-delay-1 mt-4 font-[family-name:var(--font-inter)] text-[42px] font-black leading-[1.06] tracking-[-.045em] sm:text-[54px] lg:text-[62px]">
              Giày thể thao<br /><span className="text-primary">chính hãng</span>
            </h1>
            <p className="hero-enter hero-enter-delay-2 mt-5 max-w-[465px] text-[15px] leading-7 text-white/70 sm:text-[16px]">
              Hàng nghìn mẫu giày từ Nike, Adidas, New Balance và nhiều thương hiệu hàng đầu — sẵn sàng đồng hành trong từng bước chân.
            </p>
            <div className="hero-enter hero-enter-delay-3 mt-8 flex flex-wrap items-center gap-4">
              <Link href="/products" className="btn-primary min-w-[145px]">Mua ngay <ArrowRightIcon /></Link>
              <Link href="/hang-moi" className="inline-flex h-11 items-center gap-2 border-b border-white/35 text-sm font-bold text-white/75 transition hover:border-primary hover:text-white">Khám phá hàng mới</Link>
            </div>

            <div className="hero-enter hero-enter-delay-3 mt-10 hidden grid-cols-3 gap-5 border-t border-white/12 pt-6 sm:grid">
              {BENEFITS.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-primary/50 text-primary"><Icon className="size-[18px]" /></span>
                  <span><strong className="block text-[11px] font-bold text-white/90">{title}</strong><small className="mt-0.5 block text-[9px] text-white/42">{subtitle}</small></span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-9 right-0 hidden border-l border-primary/45 pl-5 text-[9px] font-bold uppercase leading-7 tracking-[.32em] text-white/62 xl:block">
            Thể thao<br />Phong cách<br />Cuộc sống
          </div>
        </div>
      </section>

      <div className="border-b border-gray-200 bg-white sm:hidden">
        <div className="store-container grid grid-cols-3 divide-x divide-gray-100 py-4">
          {BENEFITS.map(({ icon: Icon, title }) => (
            <div key={title} className="flex flex-col items-center gap-2 px-2 text-center"><Icon className="size-5 text-primary" /><span className="text-[9px] font-bold text-gray-600">{title}</span></div>
          ))}
        </div>
      </div>

      <main className="store-container py-11 lg:py-14">
        {featured.length > 0 && (
          <section data-reveal>
            <SectionHeader title="Sản phẩm nổi bật" subtitle="Tuyển chọn được yêu thích tuần này" href="/products?featured=true" />
            <div className="product-grid mt-6">
              {featured.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        )}

        <section data-reveal className="relative my-12 overflow-hidden rounded-[26px] bg-[#17191b] px-6 py-8 text-white shadow-[0_25px_60px_rgba(17,19,21,.18)] sm:px-9 lg:flex lg:items-center lg:justify-between">
          <div className="absolute -right-16 -top-28 size-72 rounded-full border-[44px] border-primary/15" />
          <div className="relative flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-[0_10px_30px_rgba(242,106,46,.3)]"><SparkIcon /></span>
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">SoleMate Member</p><h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">Ưu đãi riêng cho thành viên mới</h2><p className="mt-1 text-sm text-white/50">Đăng ký để lưu wishlist, theo dõi đơn hàng và nhận ưu đãi mới.</p></div>
          </div>
          <Link href="/register" className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-5 py-3 text-sm font-bold transition hover:border-primary hover:bg-primary lg:mt-0">Đăng ký ngay <ArrowRightIcon /></Link>
        </section>

        {bestSellers.length > 0 && (
          <section data-reveal>
            <SectionHeader title="Bán chạy nhất" subtitle="Những đôi giày luôn được săn đón" href="/products?sort=best_seller" />
            <div className="product-grid mt-6">
              {bestSellers.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        )}

        <section data-reveal className="mt-14 grid gap-3 overflow-hidden rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-3 sm:p-0">
          {BENEFITS.map(({ icon: Icon, title, subtitle }, index) => (
            <div key={title} className={`flex items-center gap-4 rounded-2xl px-5 py-5 sm:rounded-none sm:px-7 ${index > 0 ? 'sm:border-l sm:border-gray-100' : ''}`}>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-5" /></span>
              <div><h3 className="text-sm font-bold">{title}</h3><p className="mt-0.5 text-xs text-gray-400">{subtitle}</p></div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

function SectionHeader({ title, subtitle, href }) {
  return (
    <div className="flex items-end justify-between gap-5">
      <div><span className="section-kicker">SoleMate select</span><h2 className="section-title mt-1.5">{title}</h2><p className="mt-1 text-sm text-gray-400">{subtitle}</p></div>
      <Link href={href} className="group hidden items-center gap-2 pb-1 text-xs font-bold text-primary-deep sm:flex">Xem tất cả <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1" /></Link>
    </div>
  )
}
