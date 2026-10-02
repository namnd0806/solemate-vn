'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const RANGE_OPTIONS = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '12m', label: '12 tháng' },
]

export default function RevenueFilterPanel({ filters }) {
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
    <div className="relative mb-4 overflow-hidden rounded-[22px] border border-orange-100 bg-gradient-to-br from-white via-white to-orange-50/50 p-3 shadow-[0_14px_36px_rgba(242,106,46,.07)]">
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Khoảng thời gian</p>
        <div className="grid grid-cols-3 gap-1 rounded-[18px] bg-white p-1 shadow-sm ring-1 ring-gray-100 sm:min-w-[340px]">
          {RANGE_OPTIONS.map(option => {
            const active = activeRange === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => applyRange(option.value)}
                className={`rounded-2xl px-3 py-2.5 text-center text-xs font-black transition duration-200 sm:text-sm ${active ? 'bg-gradient-to-r from-primary to-[#ff4f24] text-white shadow-[0_12px_26px_rgba(242,106,46,.24)]' : 'text-gray-500 hover:bg-orange-50 hover:text-primary'}`}
                aria-pressed={active}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
