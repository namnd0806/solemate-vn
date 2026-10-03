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
    <div className="mb-4 flex justify-end">
      <div className="grid w-full grid-cols-3 gap-1 rounded-[20px] border border-gray-100 bg-white p-1 shadow-[0_14px_34px_rgba(15,23,42,.06)] sm:w-auto sm:min-w-[330px]">
        {RANGE_OPTIONS.map(option => {
          const active = activeRange === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => applyRange(option.value)}
              className={`rounded-[16px] px-3 py-2.5 text-center text-xs font-black transition duration-200 sm:text-sm ${active ? 'bg-gradient-to-r from-primary to-[#ff4f24] text-white shadow-[0_12px_26px_rgba(242,106,46,.24)]' : 'text-gray-500 hover:bg-orange-50 hover:text-primary'}`}
              aria-pressed={active}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
