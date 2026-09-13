'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'smvn_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const total = items.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0)

  async function addItem({ productId, sku, qty = 1 }) {
    try {
      // Fetch product to validate variant
      const res = await fetch(`/api/products/${productId}`)
      const { ok, data } = await res.json()
      if (!ok || !data) return { ok: false, message: 'Không tìm thấy sản phẩm.' }

      const variant = data.variants?.find(v => v.sku === sku)
      if (!variant) return { ok: false, message: 'Không tìm thấy phiên bản sản phẩm.' }
      if (variant.status !== 'ACTIVE') return { ok: false, message: 'Sản phẩm này hiện không còn bán.' }

      const existing = items.find(i => i.sku === sku)
      const currentQty = existing?.qty || 0
      const totalQty = currentQty + qty

      if (totalQty > variant.stock) {
        return { ok: false, message: `Chỉ còn ${variant.stock} sản phẩm trong kho.` }
      }

      const unitPrice = variant.sale_price || variant.price || data.sale_price || data.price

      setItems(prev => {
        const idx = prev.findIndex(i => i.sku === sku)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...updated[idx], qty: updated[idx].qty + qty }
          return updated
        }
        return [...prev, {
          productId,
          sku,
          qty,
          price: unitPrice,
          name: data.name,
          brand: data.brand,
          slug: data.slug,
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
        }]
      })
      return { ok: true }
    } catch {
      return { ok: false, message: 'Lỗi khi thêm vào giỏ hàng.' }
    }
  }

  function removeItem(sku) {
    setItems(prev => prev.filter(i => i.sku !== sku))
  }

  async function updateQty(sku, newQty) {
    if (newQty <= 0) { removeItem(sku); return { ok: true } }
    const item = items.find(i => i.sku === sku)
    if (!item) return { ok: false, message: 'Không tìm thấy sản phẩm trong giỏ.' }

    // Validate against current stock
    try {
      const res = await fetch(`/api/products/${item.productId}`)
      const { ok, data } = await res.json()
      if (ok && data) {
        const variant = data.variants?.find(v => v.sku === sku)
        if (variant && newQty > variant.stock) {
          return { ok: false, message: `Chỉ còn ${variant.stock} sản phẩm trong kho.` }
        }
      }
    } catch {}

    setItems(prev => prev.map(i => i.sku === sku ? { ...i, qty: newQty } : i))
    return { ok: true }
  }

  function clearCart() {
    setItems([])
    localStorage.removeItem(CART_KEY)
  }

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
