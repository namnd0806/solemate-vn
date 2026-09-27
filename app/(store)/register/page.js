'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FieldError from '@/components/FieldError'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const nextErrors = {}
    if (!form.lastName.trim()) nextErrors.lastName = 'Vui lòng nhập họ.'
    if (!form.firstName.trim()) nextErrors.firstName = 'Vui lòng nhập tên.'
    if (!form.email.trim()) nextErrors.email = 'Vui lòng nhập email.'
    if (!form.password.trim()) nextErrors.password = 'Vui lòng nhập mật khẩu.'
    else if (form.password.length < 6) nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.'
    if (!form.confirm.trim()) nextErrors.confirm = 'Vui lòng nhập xác nhận mật khẩu.'
    else if (form.password !== form.confirm) nextErrors.confirm = 'Mật khẩu xác nhận không khớp.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setLoading(true)
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (!data.ok) { setError(data.message); return }
    router.push('/')
    router.refresh()
  }

  function updateField(key, value) {
    setForm(p => ({ ...p, [key]: value }))
    setFieldErrors(p => ({ ...p, [key]: '' }))
  }

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(242,106,46,.13),transparent_35%),#f5f6f7] px-4 py-16">
      <div className="pointer-events-none absolute -right-32 -top-32 size-80 rounded-full border-[45px] border-primary/8" />
      <div className="surface-card w-full max-w-md p-7 sm:p-9" data-reveal>
        <span className="section-kicker">Join SoleMate</span>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-sole-dark">Đăng ký tài khoản</h1>
        <p className="mb-7 mt-2 text-sm text-gray-400">Lưu wishlist và theo dõi mọi đơn hàng dễ dàng.</p>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Họ *</label>
              <input value={form.lastName} onChange={e => updateField('lastName', e.target.value)} className="form-field" aria-invalid={Boolean(fieldErrors.lastName)} aria-describedby="register-lastName-error" data-testid="register-lastName-input" />
              <FieldError id="register-lastName">{fieldErrors.lastName}</FieldError>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tên *</label>
              <input value={form.firstName} onChange={e => updateField('firstName', e.target.value)} className="form-field" aria-invalid={Boolean(fieldErrors.firstName)} aria-describedby="register-firstName-error" data-testid="register-firstName-input" />
              <FieldError id="register-firstName">{fieldErrors.firstName}</FieldError>
            </div>
          </div>
          {[['email','Email *','email'],['phone','Số điện thoại','tel'],['password','Mật khẩu *','password'],['confirm','Xác nhận mật khẩu *','password']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-sm text-gray-600 mb-1">{l}</label>
              <input type={t} value={form[k]} onChange={e => updateField(k, e.target.value)} className="form-field" aria-invalid={Boolean(fieldErrors[k])} aria-describedby={`register-${k}-error`} data-testid={`register-${k}-input`} />
              <FieldError id={`register-${k}`}>{fieldErrors[k]}</FieldError>
            </div>
          ))}
          {error && <p role="alert" data-testid="register-form-error" className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:opacity-50">
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
          Đã có tài khoản? <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
