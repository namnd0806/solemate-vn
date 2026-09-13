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
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-sole-gray">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-sole-dark mb-6">Đăng ký tài khoản</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Họ *</label>
              <input required value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tên *</label>
              <input required value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          {[['email','Email *','email',true],['phone','Số điện thoại','tel',false],['password','Mật khẩu *','password',true],['confirm','Xác nhận mật khẩu *','password',true]].map(([k,l,t,r]) => (
            <div key={k}>
              <label className="block text-sm text-gray-600 mb-1">{l}</label>
              <input type={t} required={r} value={form[k]} onChange={e => setForm(p => ({...p,[k]:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          ))}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-full py-3 font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">
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
