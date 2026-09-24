'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  ['/admin/dashboard', 'Dashboard', 'Tổng quan', <svg key="dashboard" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-3H4v3Z" /></svg>],
  ['/admin/products', 'Sản phẩm', 'Catalog', <svg key="products" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16l-1 13H5L4 7Z" /><path d="M8 9V6a4 4 0 0 1 8 0v3" /></svg>],
  ['/admin/inventory', 'Kho hàng', 'SKU & tồn kho', <svg key="inventory" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7 12 3l8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></svg>],
  ['/admin/orders', 'Đơn hàng', 'Vận hành', <svg key="orders" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 7h14l-2 8H8L7 7Z" /><path d="M7 7 6 4H3" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>],
  ['/admin/customers', 'Khách hàng', 'Thành viên', <svg key="customers" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 19a4 4 0 0 0-8 0" /><circle cx="12" cy="8" r="4" /><path d="M19 11a3 3 0 0 1 2 5M5 11a3 3 0 0 0-2 5" /></svg>],
  ['/admin/promotions', 'Khuyến mãi', 'Mã giảm giá', <svg key="promotions" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 12 8-8h6l2 2v6l-8 8-8-8Z" /><circle cx="16" cy="8" r="1" /><path d="M9 15 15 9" /></svg>],
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col overflow-y-auto px-2 pb-3 md:px-4 md:pb-5">
      <Link href="/admin/dashboard" className="group mt-3 flex items-center justify-center gap-3 rounded-[22px] border border-white/10 bg-white/[.06] p-3 transition hover:bg-white/[.09] md:mt-4 md:justify-start md:rounded-[24px] md:p-4">
        <span className="grid size-11 place-items-center rounded-2xl bg-primary text-lg font-black text-white shadow-[0_14px_30px_rgba(242,106,46,.26)] md:size-12">S</span>
        <span className="hidden min-w-0 md:block">
          <span className="block text-xl font-black tracking-[-.04em] text-white"><span className="text-primary">Sole</span>Mate</span>
          <span className="mt-0.5 block text-[10px] font-black uppercase tracking-[.22em] text-white/38">Admin Console</span>
        </span>
      </Link>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[.045] p-1.5 md:mt-6 md:rounded-[24px] md:p-2">
        <p className="hidden px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[.22em] text-white/35 md:block">Menu quản trị</p>
        <nav className="space-y-1.5">
          {NAV.map(([href, label, hint, icon]) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl px-2 py-3 text-sm font-black transition duration-200 active:scale-[.985] md:justify-start md:px-3 ${active ? 'bg-primary text-white shadow-[0_16px_34px_rgba(242,106,46,.24)]' : 'text-white/62 hover:bg-white/[.075] hover:text-white'}`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl transition ${active ? 'bg-white/18 text-white' : 'bg-white/[.07] text-white/55 group-hover:bg-white/10 group-hover:text-primary'}`}>{icon}</span>
                <span className="hidden min-w-0 flex-1 md:block">
                  <span className="block leading-none">{label}</span>
                  <span className={`mt-1 block text-[10px] font-bold leading-none ${active ? 'text-white/65' : 'text-white/32 group-hover:text-white/45'}`}>{hint}</span>
                </span>
                <span className={`absolute right-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition md:static md:h-2 md:w-2 md:translate-y-0 ${active ? 'bg-white' : 'bg-white/0 group-hover:bg-primary'}`} />
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto hidden rounded-[24px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025))] p-4 md:block">
        <p className="text-xs font-black text-white">SoleMate VN</p>
        <p className="mt-1 text-xs leading-5 text-white/42">Theo dõi sản phẩm, kho và đơn hàng trong một workspace.</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}
