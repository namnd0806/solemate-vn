'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { formatVND } from '@/lib/utils'
import ShoeSvg from '@/components/store/ShoeSvg'
import Toast from '@/components/store/Toast'

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
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(({ ok, data }) => {
        if (ok) {
          setProduct(data)
          const colors = [...new Set(data.variants.filter(v => v.status === 'ACTIVE').map(v => v.color))]
          if (colors[0]) setSelectedColor(colors[0])
        }
        setLoading(false)
      })
  }, [slug])

  useEffect(() => {
    if (product && selectedColor) {
      const variants = product.variants.filter(v => v.color === selectedColor && v.status === 'ACTIVE')
      setSelectedVariant(variants[0] || null)
    }
  }, [product, selectedColor])

  if (loading) return <div className="flex items-center justify-center py-32"><div className="text-gray-400">Đang tải...</div></div>
  if (!product) return <div className="text-center py-32 text-gray-400">Không tìm thấy sản phẩm.</div>

  const activeVariants = product.variants.filter(v => v.status === 'ACTIVE')
  const colors = [...new Set(activeVariants.map(v => v.color))]
  const sizesForColor = activeVariants.filter(v => v.color === selectedColor)
  const displayPrice = selectedVariant?.sale_price || selectedVariant?.price || product.sale_price || product.price
  const originalPrice = selectedVariant?.price || product.price
  const hasSale = displayPrice < originalPrice
  const outOfStock = !selectedVariant || selectedVariant.stock === 0

  async function handleAddToCart() {
    if (!selectedVariant) return
    setAdding(true)
    const result = await addItem({ productId: product.id, sku: selectedVariant.sku, qty: 1 })
    setAdding(false)
    if (result.ok) {
      setToast({ message: 'Đã thêm vào giỏ hàng!', type: 'success' })
    } else {
      setToast({ message: result.message, type: 'error' })
    }
  }

  async function handleWishlist() {
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    })
    const data = await res.json()
    if (res.status === 401) { router.push('/login'); return }
    setToast({ message: data.ok ? (data.data.action === 'added' ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích') : data.message, type: data.ok ? 'success' : 'error' })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="flex items-center justify-center rounded-2xl p-10" style={{ backgroundColor: `${product.accent}18` }}>
          <ShoeSvg className="w-64 h-64" color={product.accent || '#e8642a'} />
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">{product.brand}</p>
          <h1 className="text-2xl font-bold text-sole-dark mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold text-primary">{formatVND(displayPrice)}</span>
            {hasSale && <span className="text-gray-400 line-through">{formatVND(originalPrice)}</span>}
          </div>

          {/* Color */}
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Màu: <span className="text-sole-dark">{selectedColor}</span></p>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${selectedColor === c ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-gray-300 hover:border-primary text-gray-700'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Size:</p>
            <div className="flex gap-2 flex-wrap">
              {sizesForColor.map(v => (
                <button
                  key={v.sku}
                  onClick={() => setSelectedVariant(v)}
                  disabled={v.stock === 0}
                  className={`w-12 h-12 rounded-lg border text-sm font-medium transition-colors ${v.stock === 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through' : selectedVariant?.sku === v.sku ? 'border-primary bg-primary text-white' : 'border-gray-300 hover:border-primary text-gray-700'}`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock status */}
          {outOfStock && (
            <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
              Hết hàng
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
              className="flex-1 bg-primary hover:bg-orange-600 text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Đang thêm...' : outOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
            </button>
            <button onClick={handleWishlist} className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:border-primary transition-colors text-xl" aria-label="Thêm vào yêu thích">
              🤍
            </button>
          </div>

          {product.description && (
            <p className="mt-6 text-sm text-gray-500 leading-relaxed">{product.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
