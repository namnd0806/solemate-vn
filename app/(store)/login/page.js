'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!data.ok) { setError(data.message); return }
    router.push(returnUrl)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
      <h1 className="text-2xl font-bold text-sole-dark mb-6">Đăng nhập</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email" required value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Mật khẩu</label>
          <input
            type="password" required value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-primary text-white rounded-full py-3 font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-6">
        Chưa có tài khoản? <Link href="/register" className="text-primary hover:underline">Đăng ký</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-sole-gray">
      <Suspense fallback={<div className="text-gray-400">Đang tải...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
