'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'best_seller', label: 'Bán chạy' },
]

export default function ProductSort({ value = 'newest' }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(event) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', event.target.value)
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <label className="sort-control">
      <span>Sắp xếp</span>
      <select value={value} onChange={handleChange} aria-label="Sắp xếp sản phẩm">
        {OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  )
}
