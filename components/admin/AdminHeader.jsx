'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

const TITLES = {
  '/admin/dashboard': ['Dashboard', 'Tổng quan vận hành cửa hàng'],
  '/admin/products': ['Sản phẩm', 'Quản lý catalog, giá bán và SKU'],
  '/admin/inventory': ['Kho hàng', 'Theo dõi tồn kho và biến động'],
  '/admin/orders': ['Đơn hàng', 'Xử lý đơn theo trạng thái vận hành'],
  '/admin/customers': ['Khách hàng', 'Theo dõi thành viên và lịch sử mua'],
  '/admin/promotions': ['Khuyến mãi', 'Quản lý mã giảm giá và chiến dịch'],
}

function MenuIcon() {
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6 6 18" /></svg>
}

export default function AdminHeader({ admin }) {
  const router = useRouter()
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [now, setNow] = useState(null)

  const [title, subtitle] = useMemo(() => TITLES[pathname] || ['Admin', 'SoleMate VN workspace'], [pathname])

  useEffect(() => {
    const saved = localStorage.getItem('smvn_admin_theme') === 'dark'
    document.documentElement.classList.toggle('admin-dark', saved)
    const initTimer = setTimeout(() => {
      setDarkMode(saved)
      setNow(new Date())
    }, 0)
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => {
      clearTimeout(initTimer)
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDrawerOpen(false), 0)
    return () => clearTimeout(timer)
  }, [pathname])

  function toggleTheme() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('admin-dark', next)
    localStorage.setItem('smvn_admin_theme', next ? 'dark' : 'light')
  }

  async function handleLogout() {
    await fetch('/api/auth/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const timeText = now ? now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'
  const dateText = now ? now.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }) : ''

  return (
    <>
      <header className="admin-topbar sticky top-0 z-40 flex min-h-[72px] items-center justify-between gap-4 border-b border-gray-200/80 bg-white/86 px-4 shadow-[0_10px_34px_rgba(20,23,28,.055)] backdrop-blur-xl transition-colors sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={() => setDrawerOpen(true)} className="grid size-11 place-items-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary lg:hidden" aria-label="Mở sidebar admin">
            <MenuIcon />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">Admin workspace</p>
            <div className="mt-1 flex min-w-0 items-center gap-3">
              <h1 className="truncate text-xl font-black tracking-tight text-sole-dark sm:text-2xl">{title}</h1>
              <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 md:inline-flex">LIVE</span>
            </div>
            <p className="mt-0.5 hidden text-xs text-gray-400 sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border border-gray-200 bg-[#f7f8f9] px-4 py-2 lg:flex">
            <span className="grid size-9 place-items-center rounded-xl bg-white text-primary shadow-sm">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" /></svg>
            </span>
            <span>
              <span className="block text-sm font-black leading-none text-sole-dark">{timeText}</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-gray-400">{dateText}</span>
            </span>
          </div>

          <button type="button" onClick={toggleTheme} className="grid size-11 place-items-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary" aria-label="Đổi giao diện sáng tối">
            {darkMode ? (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4 12H2m20 0h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 13a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10Z" /></svg>
            )}
          </button>

          <div className="hidden items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm md:flex">
            <span className="grid size-9 place-items-center rounded-xl bg-[#17191c] text-xs font-black text-white">{(admin?.email || 'AD').slice(0, 2).toUpperCase()}</span>
            <span className="max-w-[160px] truncate text-xs font-bold text-gray-500">{admin?.email || 'Admin'}</span>
          </div>

          <button onClick={handleLogout} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs font-black text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary">
            Đăng xuất
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-sm lg:hidden" onMouseDown={() => setDrawerOpen(false)}>
          <aside className="h-full w-[min(310px,86vw)] bg-[#111315] shadow-[28px_0_90px_rgba(0,0,0,.35)]" onMouseDown={event => event.stopPropagation()}>
            <div className="flex justify-end p-4">
              <button type="button" onClick={() => setDrawerOpen(false)} className="grid size-10 place-items-center rounded-2xl border border-white/10 text-white/65 transition hover:bg-white/10 hover:text-white" aria-label="Đóng sidebar">
                <CloseIcon />
              </button>
            </div>
            <AdminNav />
          </aside>
        </div>
      )}
    </>
  )
}
