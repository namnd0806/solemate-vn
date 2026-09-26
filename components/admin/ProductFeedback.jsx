'use client'

function StatusIcon({ type }) {
  if (type === 'error') return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 8v5m0 3h.01"/><circle cx="12" cy="12" r="9"/></svg>
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m7.5 12.5 3 3 6-7"/><circle cx="12" cy="12" r="9"/></svg>
}

export function ProductToast({ toast, onClose }) {
  if (!toast) return null
  const isError = toast.type === 'error'
  const message = toast.message || toast.msg
  return (
    <div className="fixed right-4 top-4 z-[80] w-[min(390px,calc(100vw-32px))] animate-[admin-toast-in_.35s_cubic-bezier(.2,.8,.2,1)] overflow-hidden rounded-2xl border border-white/10 bg-[#17191c] text-white shadow-[0_24px_70px_rgba(0,0,0,.32)]">
      <div className="flex gap-3 p-4">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${isError ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}><StatusIcon type={toast.type} /></span>
        <div className="min-w-0 flex-1"><p className="text-sm font-black">{isError ? 'Thao tác chưa hoàn tất' : 'Đã cập nhật thành công'}</p><p className="mt-1 text-xs leading-5 text-white/60">{message}</p></div>
        <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white" aria-label="Đóng thông báo">×</button>
      </div>
      <div className={`h-1 origin-left animate-[toast-progress_3.4s_linear_forwards] ${isError ? 'bg-red-500' : 'bg-emerald-500'}`} />
    </div>
  )
}

export function ProductConfirm({ product, onCancel, onConfirm, busy }) {
  if (!product) return null
  const hiding = product.status === 'ACTIVE'
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#090a0b]/60 p-4 backdrop-blur-sm" onMouseDown={onCancel}>
      <div className="w-full max-w-md animate-[admin-dialog-in_.28s_cubic-bezier(.2,.8,.2,1)] rounded-[26px] bg-white p-6 shadow-[0_30px_100px_rgba(0,0,0,.3)]" onMouseDown={event => event.stopPropagation()}>
        <div className={`grid size-12 place-items-center rounded-2xl ${hiding ? 'bg-orange-50 text-primary' : 'bg-emerald-50 text-emerald-600'}`}>
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.5"/>{hiding && <path d="m4 4 16 16"/>}</svg>
        </div>
        <h3 className="mt-5 text-xl font-black text-sole-dark">{hiding ? 'Ẩn sản phẩm này?' : 'Đưa sản phẩm trở lại?'}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">{hiding ? `“${product.name}” sẽ biến mất khỏi cửa hàng nhưng dữ liệu và lịch sử đơn hàng vẫn được giữ nguyên.` : `“${product.name}” sẽ hiển thị lại trên cửa hàng ngay sau khi xác nhận.`}</p>
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50">Để sau</button><button type="button" disabled={busy} onClick={onConfirm} className={`rounded-xl px-5 py-2.5 text-sm font-black text-white shadow-lg transition disabled:opacity-50 ${hiding ? 'bg-primary hover:bg-primary-deep' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{busy ? 'Đang xử lý...' : hiding ? 'Xác nhận ẩn' : 'Hiển thị lại'}</button></div>
      </div>
    </div>
  )
}

export function AdminConfirm({ open, title, message, tone = 'orange', confirmText = 'Xác nhận', cancelText = 'Để sau', busy = false, onCancel, onConfirm }) {
  if (!open) return null
  const toneMap = {
    orange: { icon: 'bg-orange-50 text-primary', button: 'bg-primary hover:bg-primary-deep', glow: 'bg-primary/20' },
    red: { icon: 'bg-red-50 text-red-500', button: 'bg-red-500 hover:bg-red-600', glow: 'bg-red-400/20' },
    emerald: { icon: 'bg-emerald-50 text-emerald-600', button: 'bg-emerald-600 hover:bg-emerald-700', glow: 'bg-emerald-400/20' },
    blue: { icon: 'bg-sky-50 text-sky-600', button: 'bg-sky-600 hover:bg-sky-700', glow: 'bg-sky-400/20' },
    dark: { icon: 'bg-gray-100 text-sole-dark', button: 'bg-sole-dark hover:bg-gray-800', glow: 'bg-gray-400/20' },
  }
  const style = toneMap[tone] || toneMap.orange

  return (
    <div className="fixed inset-0 z-[75] grid place-items-center bg-[#090a0b]/60 p-4 backdrop-blur-sm" onMouseDown={onCancel}>
      <div className="relative w-full max-w-md animate-[admin-dialog-in_.28s_cubic-bezier(.2,.8,.2,1)] overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_30px_100px_rgba(0,0,0,.3)]" onMouseDown={event => event.stopPropagation()}>
        <div className={`absolute -right-12 -top-12 size-32 rounded-full ${style.glow} blur-3xl`} />
        <div className={`relative grid size-12 place-items-center rounded-2xl ${style.icon} shadow-inner`}>
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 9v4m0 4h.01" /><path d="M10.3 4.3 2.8 17.5A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.5L13.7 4.3a2 2 0 0 0-3.4 0Z" /></svg>
        </div>
        <h3 className="relative mt-5 text-xl font-black text-sole-dark">{title}</h3>
        <p className="relative mt-2 text-sm leading-6 text-gray-500">{message}</p>
        <div className="relative mt-7 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={busy} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50">{cancelText}</button>
          <button type="button" onClick={onConfirm} disabled={busy} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-white shadow-lg transition disabled:opacity-50 ${style.button}`}>
            {busy && <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />}
            {busy ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminMetricCard({ title, value, subtitle, tone = 'orange', trend, children }) {
  const toneMap = {
    orange: { gradient: 'from-orange-50 via-white to-white', icon: 'bg-orange-100 text-primary', bar: 'bg-orange-300', border: 'border-orange-100', trend: 'bg-emerald-50 text-emerald-600' },
    blue: { gradient: 'from-blue-50 via-white to-white', icon: 'bg-blue-100 text-blue-600', bar: 'bg-blue-300', border: 'border-blue-100', trend: 'bg-red-50 text-red-500' },
    emerald: { gradient: 'from-emerald-50 via-white to-white', icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-300', border: 'border-emerald-100', trend: 'bg-emerald-50 text-emerald-600' },
    violet: { gradient: 'from-violet-50 via-white to-white', icon: 'bg-violet-100 text-violet-600', bar: 'bg-violet-300', border: 'border-violet-100', trend: 'bg-violet-50 text-violet-600' },
    red: { gradient: 'from-rose-50 via-white to-white', icon: 'bg-rose-100 text-rose-600', bar: 'bg-rose-300', border: 'border-rose-100', trend: 'bg-red-50 text-red-500' },
  }
  const style = toneMap[tone] || toneMap.orange
  return (
    <div className={`group relative min-h-[112px] overflow-hidden rounded-[1.35rem] border ${style.border} bg-gradient-to-br ${style.gradient} p-4 shadow-[0_18px_50px_rgba(15,23,42,.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,.11)]`}>
      <div className="absolute -right-8 -top-10 size-24 rounded-full bg-white/65 blur-2xl transition group-hover:scale-125" />
      <div className="relative flex h-full items-center gap-4">
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${style.icon} shadow-inner transition group-hover:scale-105`}>{children}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 whitespace-nowrap text-2xl font-black leading-none tracking-tight text-sole-dark">{value}</p>
            {trend && <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black shadow-sm ${style.trend}`}>{trend}</span>}
          </div>
          <p className="mt-2 line-clamp-1 text-sm font-black text-sole-dark">{title}</p>
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-gray-400">{subtitle}</p>
        </div>
        <div className="hidden h-12 shrink-0 items-end gap-1 self-end sm:flex">
          {[28, 46, 34, 58].map((height, index) => <span key={index} className={`w-2 rounded-full ${style.bar} opacity-70 transition group-hover:opacity-95`} style={{ height: `${height}%` }} />)}
        </div>
      </div>
    </div>
  )
}
