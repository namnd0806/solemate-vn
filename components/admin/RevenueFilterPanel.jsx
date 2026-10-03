'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const RANGE_OPTIONS = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '3m', label: '3 tháng' },
  { value: '6m', label: '6 tháng' },
  { value: '12m', label: '12 tháng' },
]

export default function RevenueFilterPanel({ filters, dateRangeLabel }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeRange = filters.range || '30d'

  function applyRange(range) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('revenueRange', range)
    params.delete('revenueMode')
    params.delete('date')
    params.delete('month')
    params.delete('year')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-5 xl:w-auto">
        {RANGE_OPTIONS.map(option => {
          const active = activeRange === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => applyRange(option.value)}
              className={`h-12 rounded-[16px] border px-4 text-center text-sm font-black transition duration-200 sm:min-w-28 ${active ? 'border-primary bg-gradient-to-r from-primary to-[#ff4f24] text-white shadow-[0_14px_28px_rgba(242,106,46,.28)]' : 'border-gray-100 bg-white text-gray-500 shadow-sm hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50 hover:text-primary'}`}
              aria-pressed={active}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <div className="inline-flex h-12 w-full items-center justify-between gap-3 rounded-[16px] border border-gray-100 bg-white px-4 text-sm font-black text-slate-600 shadow-sm sm:w-auto sm:min-w-[320px]">
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /></svg>
        <span className="min-w-0 truncate">{dateRangeLabel}</span>
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
      </div>
    </div>
  )
}
