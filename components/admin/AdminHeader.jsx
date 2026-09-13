'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminHeader({ admin }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <header className="bg-sole-dark text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link href="/admin/dashboard" className="text-xl font-bold">
        <span className="text-primary">Sole</span>Mate VN <span className="text-xs font-normal text-gray-400 ml-1">Admin</span>
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-400">👤 {admin?.first_name || 'Admin'}</span>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors">
          Đăng xuất
        </button>
      </div>
    </header>
  )
}
