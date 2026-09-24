'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  ['/admin/dashboard', 'Dashboard'], ['/admin/products', 'Sản phẩm'], ['/admin/inventory', 'Kho hàng'],
  ['/admin/orders', 'Đơn hàng'], ['/admin/customers', 'Khách hàng'], ['/admin/promotions', 'Khuyến mãi'],
]

export default function AdminNav() {
  const pathname = usePathname()
  return <nav className="space-y-1.5 p-3">{NAV.map(([href, label]) => {
    const active = pathname === href
    return <Link key={href} href={href} className={`flex items-center rounded-xl px-4 py-3 text-sm font-bold transition ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/60 hover:bg-white/7 hover:text-white'}`}>{label}</Link>
  })}</nav>
}
