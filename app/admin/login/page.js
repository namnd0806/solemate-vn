'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FieldError from '@/components/FieldError'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Vui lòng nhập email hoặc tài khoản.'
    if (!form.password.trim()) nextErrors.password = 'Vui lòng nhập mật khẩu.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setLoading(true)
    const res = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!data.ok) { setError(data.message); return }
    router.push('/admin/dashboard')
  }

  function updateField(key, value) {
    setForm(p => ({ ...p, [key]: value }))
    setFieldErrors(p => ({ ...p, [key]: '' }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sole-gray px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-2xl font-bold"><span className="text-primary">Sole</span>Mate VN</span>
          <p className="text-sm text-gray-400 mt-1">Trang quản trị</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email hoặc tài khoản</label>
            <input type="text" value={form.email}
              onChange={e => updateField('email', e.target.value)}
              autoComplete="username"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby="admin-login-email-error"
              data-testid="admin-login-email-input"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            <FieldError id="admin-login-email">{fieldErrors.email}</FieldError>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mật khẩu</label>
            <input type="password" value={form.password}
              onChange={e => updateField('password', e.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby="admin-login-password-error"
              data-testid="admin-login-password-input"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            <FieldError id="admin-login-password">{fieldErrors.password}</FieldError>
          </div>
          {error && <p role="alert" data-testid="admin-login-form-error" className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white rounded-full py-3 font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
