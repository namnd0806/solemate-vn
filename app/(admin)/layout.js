import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyJwt } from '@/lib/auth'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('smvn_admin_token')?.value

  let admin = null
  if (token) {
    try {
      const payload = await verifyJwt(token)
      if (payload?.role === 'ADMIN') admin = payload
    } catch {}
  }

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <div className="admin-shell min-h-screen bg-[#f7f8f9] transition-colors">
      <aside className="admin-sidebar fixed inset-y-0 left-0 z-50 w-[86px] border-r border-white/10 bg-[#111315] md:w-[276px]">
        <AdminNav />
      </aside>
      <div className="min-h-screen pl-[86px] md:pl-[276px]">
        <AdminHeader admin={admin} />
        <div className="flex">
          <main className="admin-main min-w-0 flex-1 p-3 transition-colors sm:p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
