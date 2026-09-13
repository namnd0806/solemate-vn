'use client'

import { useEffect, useState } from 'react'
import { formatVND } from '@/lib/utils'
import ConfirmModal from '@/components/store/ConfirmModal'
import Toast from '@/components/store/Toast'

const EMPTY = { code:'', name:'', type:'PERCENT', value:'', max_discount:'', min_spend:'0', start_at:'', end_at:'', usage_limit:'999999', enabled:true }

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [formError, setFormError] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/promotions')
    const data = await res.json()
    if (data.ok) setPromos(data.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY); setEditing(null); setFormError(''); setShowForm(true) }
  function openEdit(p) {
    setForm({ ...p, start_at: p.start_at?.slice(0,16), end_at: p.end_at?.slice(0,16), max_discount: p.max_discount ?? '' })
    setEditing(p.id); setFormError(''); setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setFormError('')
    const payload = { ...form, value: Number(form.value), min_spend: Number(form.min_spend) || 0, usage_limit: Number(form.usage_limit) || 999999, max_discount: form.max_discount ? Number(form.max_discount) : null }
    const res = editing
      ? await fetch(`/api/promotions/${editing}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      : await fetch('/api/promotions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    const data = await res.json()
    setSaving(false)
    if (!data.ok) { setFormError(data.message); return }
    setToast({ message: editing ? 'Đã cập nhật mã khuyến mãi.' : 'Đã tạo mã khuyến mãi.', type: 'success' })
    setShowForm(false); load()
  }

  async function toggleEnabled(p) {
    const res = await fetch(`/api/promotions/${p.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ enabled: !p.enabled }) })
    const data = await res.json()
    if (data.ok) load()
    else setToast({ message: data.message, type: 'error' })
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/promotions/${deleteTarget.id}`, { method: 'DELETE' })
    const data = await res.json()
    setDeleting(false); setDeleteTarget(null)
    if (data.ok) { setToast({ message: data.disabled ? 'Đã tắt mã (có lịch sử dùng).' : 'Đã xóa mã.', type: 'success' }); load() }
    else setToast({ message: data.message, type: 'error' })
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <ConfirmModal title="Xóa mã khuyến mãi" message={`Xóa mã "${deleteTarget.code}"?`}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sole-dark">Quản lý khuyến mãi</h1>
        <button onClick={openNew} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600">+ Thêm mã</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-sole-dark mb-4">{editing ? 'Chỉnh sửa mã' : 'Tạo mã mới'}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
            {[['code','Mã code *','text',true],['name','Tên mã *','text',true],['value','Giá trị *','number',true],['max_discount','Giảm tối đa','number',false],['min_spend','Đơn tối thiểu','number',false],['usage_limit','Giới hạn lượt','number',false]].map(([k,l,t,r]) => (
              <div key={k}>
                <label className="block text-xs text-gray-500 mb-1">{l}</label>
                <input type={t} required={r} value={form[k]} onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Loại</label>
              <select value={form.type} onChange={e => setForm(p => ({...p,type:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="PERCENT">Phần trăm (%)</option>
                <option value="FIXED">Cố định (VND)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bắt đầu *</label>
              <input type="datetime-local" required value={form.start_at} onChange={e => setForm(p => ({...p,start_at:e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Kết thúc *</label>
              <input type="datetime-local" required value={form.end_at} onChange={e => setForm(p => ({...p,end_at:e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            {formError && <div className="col-span-2 text-red-600 text-sm">{formError}</div>}
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Huỷ</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-sole-gray border-b text-left text-gray-500">
            <th className="px-4 py-3">Mã</th><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Loại / Giá trị</th>
            <th className="px-4 py-3">Lượt dùng</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Thao tác</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">Đang tải...</td></tr>
            : promos.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-semibold text-xs">{p.code}</td>
                <td className="px-4 py-3 text-gray-700">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.type === 'PERCENT' ? `${p.value}%` : formatVND(p.value)}</td>
                <td className="px-4 py-3 text-gray-500">{p.usage_count}/{p.usage_limit}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleEnabled(p)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${p.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.enabled ? 'Bật' : 'Tắt'}
                  </button>
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-xs">Sửa</button>
                  <button onClick={() => setDeleteTarget(p)} className="text-red-500 hover:underline text-xs">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
