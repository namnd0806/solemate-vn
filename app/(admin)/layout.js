import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'
import AdminHeader from '@/components/admin/AdminHeader'
import Link from 'next/link'

const NAV = [
  { href: '/admin/dashboard', label: '📊 Dashboard' },
  { href: '/admin/products', label: '👟 Sản phẩm' },
  { href: '/admin/inventory', label: '📦 Kho hàng' },
  { href: '/admin/orders', label: '🛒 Đơn hàng' },
  { href: '/admin/promotions', label: '🏷️ Khuyến mãi' },
]

export default async function AdminLayout({ children }) {
  let admin = null
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('smvn_admin_token')?.value
    if (token) {
      const payload = await verifyJwt(token)
      if (payload?.role === 'ADMIN') admin = payload
    }
  } catch {}

  return (
    <div className="min-h-screen flex flex-col bg-sole-gray">
      <AdminHeader admin={admin} />
      <div className="flex flex-1">
        <aside className="w-56 bg-white border-r border-gray-100 shadow-sm flex-shrink-0">
          <nav className="p-4 space-y-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-sole-gray hover:text-primary transition-colors">
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
