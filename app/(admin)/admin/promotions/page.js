'use client'

import { useEffect, useState } from 'react'
import { formatVND } from '@/lib/utils'
import AdminPagination from '@/components/admin/AdminPagination'
import { AdminConfirm, ProductToast } from '@/components/admin/ProductFeedback'

const EMPTY = {
  code: '', name: '', type: 'PERCENT', value: '', max_discount: '',
  min_spend: '0', start_at: '', end_at: '', usage_limit: '999999', enabled: true
}
const PROMO_PAGE_SIZE = 9

function Badge({ children, color }) {
  const colors = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    red: 'bg-red-50 text-red-600 border border-red-200',
    gray: 'bg-gray-50 text-gray-500 border border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    orange: 'bg-orange-50 text-orange-600 border border-orange-200',
  }
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>{children}</span>
}

function StatusBadge({ promo }) {
  const now = new Date()
  if (!promo.enabled) return <Badge color="gray">Tắt</Badge>
  if (new Date(promo.end_at) < now) return <Badge color="red">Hết hạn</Badge>
  if (new Date(promo.start_at) > now) return <Badge color="blue">Chưa đến</Badge>
  if (promo.usage_count >= promo.usage_limit) return <Badge color="red">Hết lượt</Badge>
  return <Badge color="green">Đang chạy</Badge>
}

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toggleTarget, setToggleTarget] = useState(null)
  const [saveTarget, setSaveTarget] = useState(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [page, setPage] = useState(1)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/promotions')
    const data = await res.json()
    if (data.ok) setPromos(data.data || [])
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ message: msg, type, id: Date.now() })
    setTimeout(() => setToast(null), 3000)
  }

  function openNew() {
    setForm(EMPTY); setEditing(null); setFormError(''); setShowForm(true)
  }

  function openEdit(p) {
    setForm({
      ...p,
      start_at: p.start_at?.slice(0, 16),
      end_at: p.end_at?.slice(0, 16),
      max_discount: p.max_discount ?? '',
      value: p.value, min_spend: p.min_spend, usage_limit: p.usage_limit,
    })
    setEditing(p.id); setFormError(''); setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    const payload = {
      ...form,
      value: Number(form.value),
      min_spend: Number(form.min_spend) || 0,
      usage_limit: Number(form.usage_limit) || 999999,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
    }
    setSaveTarget({ payload, editingId: editing, code: form.code, isEditing: Boolean(editing) })
  }

  async function confirmSave() {
    if (!saveTarget) return
    setSaving(true)
    const res = saveTarget.isEditing
      ? await fetch(`/api/promotions/${saveTarget.editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saveTarget.payload) })
      : await fetch('/api/promotions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saveTarget.payload) })
    const data = await res.json()
    setSaving(false)
    if (!data.ok) { setFormError(data.message); return }
    showToast(saveTarget.isEditing ? 'Đã cập nhật mã khuyến mãi!' : 'Đã tạo mã mới!')
    setSaveTarget(null)
    setShowForm(false); load()
  }

  async function toggleEnabled(p) {
    setActionBusy(true)
    const res = await fetch(`/api/promotions/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !p.enabled })
    })
    const data = await res.json()
    if (data.ok) { showToast(p.enabled ? 'Đã tắt mã' : 'Đã bật mã'); load() }
    else showToast(data.message || 'Không thể cập nhật mã.', 'error')
    setToggleTarget(null)
    setActionBusy(false)
  }

  async function handleDelete(p) {
    setActionBusy(true)
    const res = await fetch(`/api/promotions/${p.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.ok) showToast(data.disabled ? 'Đã tắt mã (có lịch sử dùng)' : 'Đã xóa mã!')
    else showToast(data.message, 'error')
    setDeleteTarget(null); setActionBusy(false); load()
  }

  const promoTotalPages = Math.max(1, Math.ceil(promos.length / PROMO_PAGE_SIZE))
  const currentPage = Math.min(page, promoTotalPages)
  const pagedPromos = promos.slice((currentPage - 1) * PROMO_PAGE_SIZE, currentPage * PROMO_PAGE_SIZE)

  return (
    <div className="space-y-6">
      <ProductToast key={toast?.id} toast={toast} onClose={() => setToast(null)} />
      <AdminConfirm
        open={saveTarget}
        title={saveTarget?.isEditing ? 'Cập nhật mã khuyến mãi?' : 'Tạo mã khuyến mãi?'}
        message={saveTarget ? `Xác nhận lưu mã ${saveTarget.code}. Mã này sẽ ảnh hưởng trực tiếp tới bước áp dụng khuyến mãi ở checkout.` : ''}
        tone="orange"
        confirmText={saveTarget?.isEditing ? 'Cập nhật mã' : 'Tạo mã'}
        busy={saving}
        onCancel={() => setSaveTarget(null)}
        onConfirm={confirmSave}
      />
      <AdminConfirm
        open={deleteTarget}
        title="Xóa mã khuyến mãi?"
        message={deleteTarget ? `Mã ${deleteTarget.code} sẽ bị xóa vĩnh viễn nếu chưa dùng, hoặc tự động tắt nếu đã có lịch sử sử dụng.` : ''}
        tone="red"
        confirmText="Xác nhận xóa"
        busy={actionBusy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
      />
      <AdminConfirm
        open={toggleTarget}
        title={toggleTarget?.enabled ? 'Tắt mã khuyến mãi?' : 'Bật mã khuyến mãi?'}
        message={toggleTarget ? `Mã ${toggleTarget.code} sẽ ${toggleTarget.enabled ? 'ngừng áp dụng trên checkout' : 'được áp dụng lại nếu còn hạn và còn lượt dùng'}.` : ''}
        tone={toggleTarget?.enabled ? 'orange' : 'emerald'}
        confirmText={toggleTarget?.enabled ? 'Tắt mã' : 'Bật mã'}
        busy={actionBusy}
        onCancel={() => setToggleTarget(null)}
        onConfirm={() => toggleEnabled(toggleTarget)}
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Promotion center</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-sole-dark">Quản lý khuyến mãi</h1>
          <p className="mt-2 text-sm text-gray-400">{promos.length} mã giảm giá đang được quản lý.</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
          <span className="text-lg">+</span> Tạo mã mới
        </button>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-40 animate-pulse" />)}
        </div>
      ) : promos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🏷️</div>
          <p>Chưa có mã nào. Tạo mã đầu tiên!</p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-[26px] border border-gray-100 bg-white/55 shadow-[0_12px_36px_rgba(20,23,28,.04)]">
          <div className="grid grid-cols-1 gap-4 p-1 md:grid-cols-2 lg:grid-cols-3">
          {pagedPromos.map(p => (
            <div key={p.id} className="group rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_10px_30px_rgba(20,23,28,.05)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_20px_48px_rgba(20,23,28,.11)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sole-dark text-lg tracking-wider">{p.code}</span>
                    <StatusBadge promo={p} />
                  </div>
                  <p className="text-sm text-gray-500">{p.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-lg">
                    {p.type === 'PERCENT' ? `${p.value}%` : formatVND(p.value)}
                  </p>
                  {p.max_discount && <p className="text-xs text-gray-400">tối đa {formatVND(p.max_discount)}</p>}
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span>Đơn tối thiểu</span>
                  <span className="font-medium">{formatVND(p.min_spend)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lượt dùng</span>
                  <span className="font-medium">{p.usage_count}/{p.usage_limit === 999999 ? '∞' : p.usage_limit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hết hạn</span>
                  <span className="font-medium">{new Date(p.end_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Usage bar */}
              {p.usage_limit < 999999 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min((p.usage_count / p.usage_limit) * 100, 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setToggleTarget(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${p.enabled ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                  {p.enabled ? 'Tắt mã' : 'Bật mã'}
                </button>
                <button onClick={() => openEdit(p)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                  Sửa
                </button>
                <button onClick={() => setDeleteTarget(p)}
                  className="grid size-9 place-items-center rounded-xl border border-red-200 text-red-500 transition-all hover:bg-red-50"
                  aria-label="Xóa mã">
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></svg>
                </button>
              </div>
            </div>
          ))}
          </div>
          <AdminPagination page={currentPage} totalPages={promoTotalPages} totalItems={promos.length} pageSize={PROMO_PAGE_SIZE} label="mã" onPageChange={setPage} />
        </section>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-sole-dark">{editing ? 'Chỉnh sửa mã' : 'Tạo mã mới'}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Mã code *</label>
                  <input required value={form.code} onChange={e => setForm(p => ({...p, code: e.target.value.toUpperCase()}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Loại</label>
                  <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all">
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Cố định (VND)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tên mã *</label>
                  <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Giá trị *</label>
                  <input required type="number" min="1" value={form.value} onChange={e => setForm(p => ({...p, value: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Giảm tối đa (VND)</label>
                  <input type="number" value={form.max_discount} onChange={e => setForm(p => ({...p, max_discount: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Đơn tối thiểu</label>
                  <input type="number" min="0" value={form.min_spend} onChange={e => setForm(p => ({...p, min_spend: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Giới hạn lượt dùng</label>
                  <input type="number" min="1" value={form.usage_limit} onChange={e => setForm(p => ({...p, usage_limit: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Bắt đầu *</label>
                  <input required type="datetime-local" value={form.start_at} onChange={e => setForm(p => ({...p, start_at: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Kết thúc *</label>
                  <input required type="datetime-local" value={form.end_at} onChange={e => setForm(p => ({...p, end_at: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all" />
                </div>
              </div>
              {formError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{formError}</div>}
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Huỷ</button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all shadow-md disabled:opacity-50">
                  {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mã'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
