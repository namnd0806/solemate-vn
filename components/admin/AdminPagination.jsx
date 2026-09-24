'use client'

export default function AdminPagination({ page, totalPages, totalItems, pageSize, onPageChange, label = 'bản ghi' }) {
  if (totalPages <= 1) return null
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter(value => value === 1 || value === totalPages || Math.abs(value - page) <= 1)

  return (
    <div className="admin-pagination flex flex-col gap-3 border-t border-gray-100 bg-gradient-to-r from-white via-white to-orange-50/35 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-2xl bg-[#17191c] text-white shadow-sm">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
        </span>
        <div>
          <p className="text-xs font-black text-sole-dark">Trang {page} / {totalPages}</p>
          <p className="text-[11px] font-bold text-gray-400">Hiển thị <b className="text-primary">{start}-{end}</b> / {totalItems} {label}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="grid size-10 place-items-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35" aria-label="Trang trước">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        {pages.map((value, index) => {
          const previous = pages[index - 1]
          const gap = previous && value - previous > 1
          return (
            <span key={value} className="flex items-center gap-2">
              {gap && <span className="px-1 text-xs font-black text-gray-300">...</span>}
              <button type="button" onClick={() => onPageChange(value)} className={`grid size-10 place-items-center rounded-2xl text-sm font-black transition active:scale-95 ${value === page ? 'bg-primary text-white shadow-[0_12px_26px_rgba(242,106,46,.28)]' : 'border border-gray-200 bg-white text-gray-500 hover:-translate-y-0.5 hover:border-primary hover:text-primary'}`}>
                {value}
              </button>
            </span>
          )
        })}
        <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="grid size-10 place-items-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35" aria-label="Trang sau">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  )
}
