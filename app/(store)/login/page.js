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
    <div className="surface-card w-full max-w-md p-7 sm:p-9" data-reveal>
      <span className="section-kicker">Welcome back</span>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-sole-dark">Đăng nhập</h1>
      <p className="mb-7 mt-2 text-sm text-gray-400">Tiếp tục hành trình cùng SoleMate VN.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email" required value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="form-field"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Mật khẩu</label>
          <input
            type="password" required value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            className="form-field"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="btn-primary mt-2 w-full disabled:opacity-50"
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
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_80%_10%,rgba(242,106,46,.12),transparent_34%),#f5f6f7] px-4 py-16">
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-80 rounded-full border-[45px] border-primary/8" />
      <Suspense fallback={<div className="text-gray-400">Đang tải...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
