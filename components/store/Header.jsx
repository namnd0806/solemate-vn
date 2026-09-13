'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'

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
  const router = useRouter()
  const { count } = useCart()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search.trim())}`)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-sole-dark text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 text-xl font-bold">
          <span className="text-primary">Sole</span>Mate VN
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:flex">
          <div className="flex w-full rounded-lg overflow-hidden border border-white/20">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm giày..."
              className="flex-1 px-3 py-2 bg-white/10 text-sm text-white placeholder-white/50 outline-none"
              aria-label="Tìm kiếm sản phẩm"
            />
            <button type="submit" className="px-3 bg-primary hover:bg-orange-600 text-white text-sm" aria-label="Tìm">
              🔍
            </button>
          </div>
        </form>

        {/* Nav (desktop) */}
        <nav className="hidden lg:flex gap-5 text-sm">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-primary transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Cart & User */}
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/cart" className="relative" aria-label={`Giỏ hàng (${count} sản phẩm)`}>
            <span className="text-2xl">🛒</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="text-sm hover:text-primary transition-colors"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                👤 {user.first_name}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-white text-sole-dark rounded-lg shadow-lg py-2 w-44 z-50">
                  <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-sole-gray" onClick={() => setMenuOpen(false)}>
                    Đơn hàng của tôi
                  </Link>
                  <Link href="/wishlist" className="block px-4 py-2 text-sm hover:bg-sole-gray" onClick={() => setMenuOpen(false)}>
                    Yêu thích
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-sole-gray text-red-600">
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2 text-sm">
              <Link href="/login" className="hover:text-primary transition-colors">Đăng nhập</Link>
              <span className="text-white/40">|</span>
              <Link href="/register" className="hover:text-primary transition-colors">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
