'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const MODE_OPTIONS = [
  { value: 'day', label: 'Ngày', hint: '7 ngày gần nhất đến ngày chọn' },
  { value: 'month', label: 'Tháng', hint: 'Từng ngày trong tháng' },
  { value: 'year', label: 'Năm', hint: '12 tháng trong năm' },
]

export default function RevenueFilterPanel({ filters }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState(filters.mode || 'day')
  const [date, setDate] = useState(filters.date || '')
  const [month, setMonth] = useState(filters.month || '')
  const [year, setYear] = useState(filters.year || '')

  const activeHint = useMemo(() => MODE_OPTIONS.find(option => option.value === mode)?.hint, [mode])

  function applyFilter() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('revenueMode', mode)
    if (mode === 'day') params.set('date', date)
    if (mode === 'month') params.set('month', month)
    if (mode === 'year') params.set('year', year || new Date().getFullYear().toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative mb-4 overflow-hidden rounded-[26px] border border-orange-100 bg-gradient-to-br from-white via-white to-orange-50/65 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.75),0_18px_48px_rgba(242,106,46,.08)] sm:p-4">
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1 rounded-[20px] bg-white p-1 shadow-sm ring-1 ring-gray-100">
            {MODE_OPTIONS.map(option => {
              const active = mode === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className={`rounded-2xl px-3 py-2.5 text-xs font-black transition duration-200 sm:text-sm ${active ? 'bg-gradient-to-r from-primary to-[#ff4f24] text-white shadow-[0_12px_26px_rgba(242,106,46,.24)]' : 'text-gray-500 hover:bg-orange-50 hover:text-primary'}`}
                  aria-pressed={active}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-black uppercase tracking-[.16em] text-gray-400">
                {mode === 'day' ? 'Chọn ngày kết thúc' : mode === 'month' ? 'Chọn tháng' : 'Chọn năm'}
              </span>
              {mode === 'day' && (
                <input
                  value={date}
                  onChange={event => setDate(event.target.value)}
                  type="date"
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-sole-dark shadow-inner outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              )}
              {mode === 'month' && (
                <input
                  value={month}
                  onChange={event => setMonth(event.target.value)}
                  type="month"
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-sole-dark shadow-inner outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              )}
              {mode === 'year' && (
                <input
                  value={year}
                  onChange={event => setYear(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  inputMode="numeric"
                  placeholder="VD: 2026"
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-sole-dark shadow-inner outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              )}
            </label>
            <div className="rounded-2xl border border-orange-100 bg-white/80 px-4 py-3 text-xs font-bold leading-5 text-gray-500 shadow-sm">
              {activeHint}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={applyFilter}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sole-dark px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(15,23,42,.18)] transition hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_18px_38px_rgba(242,106,46,.24)]"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 5h18M7 12h10M10 19h4" /></svg>
          Lọc doanh thu
        </button>
      </div>
    </div>
  )
}
