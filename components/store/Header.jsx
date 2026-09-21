'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import {
  CartIcon, ChevronDownIcon, CloseIcon, HeartIcon, MenuIcon,
  SearchIcon, UserIcon,
} from './Icons'
import { formatVND } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/nam', label: 'Nam' },
  { href: '/nu', label: 'Nữ' },
  { href: '/tre-em', label: 'Trẻ em' },
  { href: '/thuong-hieu', label: 'Thương hiệu' },
  { href: '/hang-moi', label: 'Hàng mới' },
  { href: '/sale', label: 'Giảm giá' },
]

export default function Header({ user }) {
  const pathname = usePathname()
  const router = useRouter()
  const { items, count, total } = useCart()
  const [search, setSearch] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleSearch(event) {
    event.preventDefault()
    const query = search.trim()
    if (!query) return
    setMobileOpen(false)
    router.push(`/products?q=${encodeURIComponent(query)}`)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAccountOpen(false)
    router.push('/')
    router.refresh()
  }

  function isActive(href) {
    return href === '/' ? pathname === '/' : pathname === href
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#101214]/96 text-white shadow-[0_10px_30px_rgba(0,0,0,.16)] backdrop-blur-xl">
      <div className="store-container flex h-[66px] items-center gap-4">
        <Link href="/" className="group shrink-0 text-[21px] font-black tracking-[-.045em]" aria-label="SoleMate VN - Trang chủ">
          <span className="text-primary transition-colors group-hover:text-[#ff8954]">Sole</span><span>Mate VN</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 md:flex lg:max-w-[325px]">
          <div className="flex h-10 w-full overflow-hidden rounded-xl border border-white/15 bg-white/8 transition focus-within:border-primary/70 focus-within:bg-white/12 focus-within:ring-4 focus-within:ring-primary/10">
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-4 text-[13px] text-white outline-none"
              aria-label="Tìm kiếm sản phẩm"
            />
            <button type="submit" className="grid w-11 place-items-center bg-primary transition hover:bg-[#ff7c42]" aria-label="Tìm kiếm">
              <SearchIcon className="size-[18px]" />
            </button>
          </div>
        </form>

        <nav className="ml-auto hidden items-stretch self-stretch xl:flex" aria-label="Điều hướng chính">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center px-[11px] text-[13px] font-semibold transition-colors after:absolute after:inset-x-[11px] after:bottom-0 after:h-0.5 after:origin-center after:rounded-full after:bg-primary after:transition-transform ${isActive(link.href) ? 'text-primary after:scale-x-100' : 'text-white/78 hover:text-white after:scale-x-0 hover:after:scale-x-100'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 xl:ml-0">
          <Link href="/wishlist" className="hidden size-10 place-items-center rounded-full text-white/70 transition hover:bg-white/8 hover:text-primary sm:grid" aria-label="Sản phẩm yêu thích">
            <HeartIcon className="size-[19px]" />
          </Link>
          <div className="group/cart relative">
            <Link href="/cart" className="relative grid size-10 place-items-center rounded-full text-white/85 transition hover:bg-white/8 hover:text-primary" aria-label={`Giỏ hàng (${count} sản phẩm)`}>
              <CartIcon className="size-[21px]" />
              {count > 0 ? (
                <span className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-black text-white ring-2 ring-[#101214]">
                  {count > 99 ? '99+' : count}
                </span>
              ) : null}
            </Link>

            <div className="pointer-events-none invisible absolute right-0 top-[calc(100%+12px)] w-[360px] translate-y-2 opacity-0 transition duration-200 group-hover/cart:pointer-events-auto group-hover/cart:visible group-hover/cart:translate-y-0 group-hover/cart:opacity-100">
              <div className="overflow-hidden rounded-[22px] border border-gray-100 bg-white text-sole-dark shadow-[0_28px_80px_rgba(0,0,0,.24)]">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <p className="text-sm font-black">Giỏ hàng của bạn</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">{count} sản phẩm</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{formatVND(total)}</span>
                </div>
                {items.length ? (
                  <>
                    <div className="max-h-[310px] space-y-1 overflow-y-auto p-2.5">
                      {items.slice(0, 4).map(item => (
                        <Link key={item.sku} href={`/product/${item.slug}`} className="flex gap-3 rounded-2xl p-2.5 transition hover:bg-gray-50">
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            {item.image_url ? <Image src={item.image_url} alt={item.name} fill sizes="64px" className="object-cover" /> : <div className="grid h-full place-items-center text-primary"><CartIcon /></div>}
                          </div>
                          <div className="min-w-0 flex-1 py-0.5">
                            <p className="truncate text-xs font-bold">{item.name}</p>
                            <p className="mt-1 text-[10px] text-gray-400">{item.color} · Size {item.size} · x{item.qty}</p>
                            <p className="mt-1.5 text-xs font-black text-primary">{formatVND(item.price * item.qty)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 p-3">
                      <Link href="/cart" className="btn-primary w-full text-xs">Xem giỏ hàng</Link>
                    </div>
                  </>
                ) : (
                  <div className="px-6 py-9 text-center">
                    <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-gray-100 text-gray-400"><CartIcon /></div>
                    <p className="text-sm font-bold">Giỏ hàng đang trống</p>
                    <p className="mt-1 text-xs text-gray-400">Thêm đôi giày bạn yêu thích nhé.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <span className="mx-1 hidden h-5 w-px bg-white/15 xl:block" />

          {user ? (
            <div className="relative hidden xl:block">
              <button
                onClick={() => setAccountOpen(open => !open)}
                className="flex h-10 items-center gap-2 rounded-full px-3 text-[13px] font-semibold text-white/85 transition hover:bg-white/8 hover:text-white"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <UserIcon className="size-[17px]" />
                {user.first_name}
                <ChevronDownIcon className={`size-3.5 transition ${accountOpen ? 'rotate-180' : ''}`} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 text-sole-dark shadow-2xl" role="menu">
                  <Link href="/account/orders" className="block rounded-xl px-3 py-2.5 text-sm hover:bg-sole-gray" onClick={() => setAccountOpen(false)}>Đơn hàng của tôi</Link>
                  <Link href="/wishlist" className="block rounded-xl px-3 py-2.5 text-sm hover:bg-sole-gray" onClick={() => setAccountOpen(false)}>Sản phẩm yêu thích</Link>
                  <button onClick={handleLogout} className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-1 xl:flex">
              <Link href="/login" className="rounded-full px-3 py-2 text-[13px] font-semibold text-white/80 transition hover:text-white">Đăng nhập</Link>
              <Link href="/register" className="rounded-full border border-primary/80 px-4 py-2 text-[13px] font-bold text-primary transition hover:bg-primary hover:text-white">Đăng ký</Link>
            </div>
          )}

          <button onClick={() => setMobileOpen(open => !open)} className="grid size-10 place-items-center rounded-full text-white transition hover:bg-white/8 xl:hidden" aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={mobileOpen}>
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/8 bg-[#121416] px-3 pb-5 pt-4 shadow-2xl xl:hidden">
          <form onSubmit={handleSearch} className="mx-auto mb-4 flex h-11 max-w-2xl overflow-hidden rounded-xl border border-white/15 bg-white/8 md:hidden">
            <input type="search" value={search} onChange={event => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none" aria-label="Tìm kiếm sản phẩm" />
            <button type="submit" className="grid w-12 place-items-center bg-primary" aria-label="Tìm kiếm"><SearchIcon /></button>
          </form>
          <nav className="mx-auto grid max-w-2xl grid-cols-2 gap-1" aria-label="Điều hướng di động">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive(link.href) ? 'bg-primary/12 text-primary' : 'text-white/75 hover:bg-white/6 hover:text-white'}`}>
                {link.label}
              </Link>
            ))}
            <div className="col-span-2 mt-2 flex gap-2 border-t border-white/10 pt-4">
              {user ? (
                <>
                  <Link href="/account/orders" onClick={() => setMobileOpen(false)} className="flex-1 rounded-full border border-white/15 py-2.5 text-center text-sm font-semibold">Đơn hàng</Link>
                  <button onClick={handleLogout} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold">Đăng xuất</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-full border border-white/15 py-2.5 text-center text-sm font-semibold">Đăng nhập</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 rounded-full bg-primary py-2.5 text-center text-sm font-bold">Đăng ký</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
