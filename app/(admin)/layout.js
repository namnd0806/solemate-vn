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
      <aside className="admin-sidebar fixed inset-y-0 left-0 z-50 hidden w-[276px] border-r border-white/10 bg-[#111315] lg:block">
        <AdminNav />
      </aside>
      <div className="min-h-screen lg:pl-[276px]">
        <AdminHeader admin={admin} />
        <div className="flex">
          <main className="admin-main min-w-0 flex-1 p-4 transition-colors sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
