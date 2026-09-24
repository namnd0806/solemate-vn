'use client'

function StatusIcon({ type }) {
  if (type === 'error') return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 8v5m0 3h.01"/><circle cx="12" cy="12" r="9"/></svg>
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m7.5 12.5 3 3 6-7"/><circle cx="12" cy="12" r="9"/></svg>
}

export function ProductToast({ toast, onClose }) {
  if (!toast) return null
  const isError = toast.type === 'error'
  return (
    <div className="fixed right-4 top-4 z-[80] w-[min(390px,calc(100vw-32px))] animate-[admin-toast-in_.35s_cubic-bezier(.2,.8,.2,1)] overflow-hidden rounded-2xl border border-white/10 bg-[#17191c] text-white shadow-[0_24px_70px_rgba(0,0,0,.32)]">
      <div className="flex gap-3 p-4">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${isError ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}><StatusIcon type={toast.type} /></span>
        <div className="min-w-0 flex-1"><p className="text-sm font-black">{isError ? 'Thao tác chưa hoàn tất' : 'Đã cập nhật thành công'}</p><p className="mt-1 text-xs leading-5 text-white/60">{toast.message}</p></div>
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
