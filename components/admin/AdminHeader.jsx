'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const MOBILE_NAV = [['/admin/dashboard','Dashboard'],['/admin/products','Sản phẩm'],['/admin/inventory','Kho hàng'],['/admin/orders','Đơn hàng'],['/admin/customers','Khách hàng'],['/admin/promotions','Khuyến mãi']]

export default function AdminHeader({ admin }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-white/8 bg-[#101214]/97 px-4 text-white shadow-[0_10px_30px_rgba(0,0,0,.15)] backdrop-blur-xl sm:px-6">
      <Link href="/admin/dashboard" className="text-xl font-black tracking-[-.04em]">
        <span className="text-primary">Sole</span>Mate VN <span className="ml-1 rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold tracking-wide text-white/45">ADMIN</span>
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <span className="hidden text-white/55 sm:block">{admin?.email || 'Admin'}</span>
        <button onClick={handleLogout} className="rounded-full border border-white/12 px-4 py-2 text-xs font-bold text-white/75 transition hover:border-primary hover:text-primary">
          Đăng xuất
        </button>
        <button onClick={() => setOpen(value => !value)} className="grid size-9 place-items-center rounded-full border border-white/12 lg:hidden" aria-label="Mở menu admin">{open ? '✕' : '☰'}</button>
      </div>
      {open && <nav className="absolute inset-x-3 top-[62px] grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-[#17191c] p-3 shadow-2xl lg:hidden">{MOBILE_NAV.map(([href,label]) => <Link key={href} href={href} onClick={()=>setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-white/70 hover:bg-primary hover:text-white">{label}</Link>)}</nav>}
    </header>
  )
}
