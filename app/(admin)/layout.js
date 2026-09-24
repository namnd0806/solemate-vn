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
    <div className="min-h-screen bg-[#f7f8f9]">
      <AdminHeader admin={admin} />
      <div className="flex min-h-[calc(100vh-68px)]">
        <aside className="sticky top-[68px] hidden h-[calc(100vh-68px)] w-60 flex-shrink-0 border-r border-white/5 bg-[#111315] lg:block">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
