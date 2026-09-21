'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự.')
    if (form.password !== form.confirm) return setError('Mật khẩu xác nhận không khớp.')
    setLoading(true)
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (!data.ok) { setError(data.message); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(242,106,46,.13),transparent_35%),#f5f6f7] px-4 py-16">
      <div className="pointer-events-none absolute -right-32 -top-32 size-80 rounded-full border-[45px] border-primary/8" />
      <div className="surface-card w-full max-w-md p-7 sm:p-9" data-reveal>
        <span className="section-kicker">Join SoleMate</span>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-sole-dark">Đăng ký tài khoản</h1>
        <p className="mb-7 mt-2 text-sm text-gray-400">Lưu wishlist và theo dõi mọi đơn hàng dễ dàng.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Họ *</label>
              <input required value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))} className="form-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tên *</label>
              <input required value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))} className="form-field" />
            </div>
          </div>
          {[['email','Email *','email',true],['phone','Số điện thoại','tel',false],['password','Mật khẩu *','password',true],['confirm','Xác nhận mật khẩu *','password',true]].map(([k,l,t,r]) => (
            <div key={k}>
              <label className="block text-sm text-gray-600 mb-1">{l}</label>
              <input type={t} required={r} value={form[k]} onChange={e => setForm(p => ({...p,[k]:e.target.value}))} className="form-field" />
            </div>
          ))}
          {error && <p className="text-red-600 text-sm">{error}</p>}
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
