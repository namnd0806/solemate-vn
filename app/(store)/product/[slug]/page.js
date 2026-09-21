'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { formatVND } from '@/lib/utils'
import ShoeSvg from '@/components/store/ShoeSvg'
import Toast from '@/components/store/Toast'
import { ArrowRightIcon, HeartIcon, RefreshIcon, ShieldIcon, TruckIcon } from '@/components/store/Icons'

export default function PDPPage() {
  const { slug } = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [toast, setToast] = useState(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let active = true
    fetch(`/api/products/${slug}`)
      .then(response => response.json())
      .then(({ ok, data }) => {
        if (!active) return
        if (ok) {
          const firstVariant = data.variants.find(variant => variant.status === 'ACTIVE') || null
          setProduct(data)
          setSelectedColor(firstVariant?.color || null)
          setSelectedVariant(firstVariant)
        }
        setLoading(false)
      })
      .catch(() => active && setLoading(false))
    return () => { active = false }
  }, [slug])

  if (loading) return <ProductLoading />
  if (!product) return <div className="store-container py-32 text-center text-gray-400">Không tìm thấy sản phẩm.</div>

  const activeVariants = product.variants.filter(variant => variant.status === 'ACTIVE')
  const colors = [...new Set(activeVariants.map(variant => variant.color))]
  const sizesForColor = activeVariants.filter(variant => variant.color === selectedColor)
  const displayPrice = selectedVariant?.sale_price || selectedVariant?.price || product.sale_price || product.price
  const originalPrice = selectedVariant?.price || product.price
  const hasSale = displayPrice < originalPrice
  const outOfStock = !selectedVariant || selectedVariant.stock === 0

  function selectColor(color) {
    setSelectedColor(color)
    setSelectedVariant(activeVariants.find(variant => variant.color === color) || null)
  }

  async function handleAddToCart() {
    if (!selectedVariant) return
    setAdding(true)
    const result = await addItem({ productId: product.id, sku: selectedVariant.sku, qty: 1 })
    setAdding(false)
    setToast({ message: result.ok ? 'Đã thêm sản phẩm vào giỏ hàng!' : result.message, type: result.ok ? 'success' : 'error' })
  }

  async function handleWishlist() {
    const response = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    })
    const data = await response.json()
    if (response.status === 401) { router.push('/login'); return }
    setToast({ message: data.ok ? (data.data.action === 'added' ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích') : data.message, type: data.ok ? 'success' : 'error' })
  }

  return (
    <div className="bg-[#f7f8f9] py-8 lg:py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="store-container">
        <nav className="mb-7 flex items-center gap-2 text-xs text-gray-400" aria-label="Đường dẫn">
          <Link href="/" className="hover:text-primary">Trang chủ</Link><span>/</span><Link href="/products" className="hover:text-primary">Sản phẩm</Link><span>/</span><span className="text-gray-600">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
          <div className="relative min-h-[390px] overflow-hidden rounded-[26px] border border-gray-200 bg-[radial-gradient(circle_at_72%_20%,#fff_0%,#f1f3f4_58%,#e7e9eb_100%)] shadow-sm sm:min-h-[520px]" data-reveal>
            <span className="absolute left-5 top-5 z-10 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-gray-500 shadow-sm backdrop-blur">{product.brand}</span>
            <div className="absolute inset-x-[15%] bottom-[14%] h-5 rounded-full bg-black/10 blur-xl" />
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 52vw" className="object-contain p-[8%]" />
            ) : (
              <ShoeSvg className="absolute inset-[7%] h-[86%] w-[86%] drop-shadow-2xl" color={product.accent || '#e8642a'} brand={product.brand} />
            )}
          </div>

          <div className="py-2 lg:py-5" data-reveal>
            <p className="section-kicker">Authentic footwear</p>
            <h1 className="mt-3 font-[family-name:var(--font-inter)] text-3xl font-black tracking-[-.04em] text-sole-dark sm:text-[40px] sm:leading-tight">{product.name}</h1>
            <div className="mt-5 flex items-center gap-3">
              <span className="text-2xl font-black text-[#ff4b24]">{formatVND(displayPrice)}</span>
              {hasSale && <span className="text-sm text-gray-400 line-through">{formatVND(originalPrice)}</span>}
              {hasSale && <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-500">Tiết kiệm {Math.round((1 - displayPrice / originalPrice) * 100)}%</span>}
            </div>

            {product.description && <p className="mt-5 text-sm leading-7 text-gray-500">{product.description}</p>}

            <div className="mt-7 border-t border-gray-200 pt-6">
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between"><p className="text-sm font-bold text-gray-700">Màu sắc</p><span className="text-xs text-gray-400">{selectedColor}</span></div>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => <button key={color} onClick={() => selectColor(color)} className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${selectedColor === color ? 'border-primary bg-primary/8 text-primary shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-primary/60'}`}>{color}</button>)}
                </div>
              </div>

              <div className="mb-7">
                <div className="mb-3 flex items-center justify-between"><p className="text-sm font-bold text-gray-700">Chọn kích cỡ</p><span className="text-xs text-gray-400">Kho: {selectedVariant?.stock || 0}</span></div>
                <div className="flex flex-wrap gap-2">
                  {sizesForColor.map(variant => (
                    <button key={variant.sku} onClick={() => setSelectedVariant(variant)} disabled={variant.stock === 0} className={`grid size-12 place-items-center rounded-xl border text-sm font-bold transition ${variant.stock === 0 ? 'cursor-not-allowed border-gray-100 bg-gray-100 text-gray-300 line-through' : selectedVariant?.sku === variant.sku ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-gray-200 bg-white text-gray-600 hover:border-primary'}`}>{variant.size}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={outOfStock || adding} className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-45">
                  {adding ? 'Đang thêm...' : outOfStock ? 'Hết hàng' : 'Thêm vào giỏ'} {!adding && !outOfStock && <ArrowRightIcon />}
                </button>
                <button onClick={handleWishlist} className="grid size-[48px] shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:-translate-y-0.5 hover:border-primary hover:text-primary" aria-label="Thêm vào yêu thích"><HeartIcon /></button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2 border-t border-gray-200 pt-6">
              {[[TruckIcon,'Giao nhanh'],[ShieldIcon,'Chính hãng'],[RefreshIcon,'Đổi 7 ngày']].map(([Icon, label]) => <div key={label} className="flex flex-col items-center gap-2 text-center text-[10px] font-bold text-gray-500 sm:flex-row sm:text-left"><Icon className="size-5 text-primary" /><span>{label}</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductLoading() {
  return (
    <div className="store-container grid animate-pulse gap-8 py-12 lg:grid-cols-2">
      <div className="h-[480px] rounded-[26px] bg-gray-200" />
      <div className="space-y-5 py-8"><div className="h-3 w-32 rounded bg-gray-200" /><div className="h-10 w-3/4 rounded bg-gray-200" /><div className="h-7 w-44 rounded bg-gray-200" /><div className="h-24 rounded bg-gray-200" /></div>
    </div>
  )
}
