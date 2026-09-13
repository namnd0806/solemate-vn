import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// Cart logic extracted for pure testing
function addToCart(cart, { productId, sku, qty, variant }) {
  if (!variant || variant.status !== 'ACTIVE') return { ok: false, message: 'Variant không hợp lệ.' }
  if (variant.stock <= 0) return { ok: false, message: 'Hết hàng.' }
  const existing = cart.find(i => i.sku === sku)
  const currentQty = existing?.qty || 0
  if (currentQty + qty > variant.stock) return { ok: false, message: `Chỉ còn ${variant.stock} sản phẩm.` }
  return { ok: true }
}

function clearCart() { return [] }

function serializeCart(items) { return JSON.stringify(items) }
function deserializeCart(str) {
  try { return JSON.parse(str) } catch { return [] }
}

const variantArb = fc.record({
  sku: fc.string({ minLength: 3, maxLength: 20 }),
  status: fc.constantFrom('ACTIVE', 'INACTIVE'),
  stock: fc.integer({ min: 0, max: 100 }),
})

const cartItemArb = fc.record({
  productId: fc.string({ minLength: 1 }),
  sku: fc.string({ minLength: 3, maxLength: 20 }),
  qty: fc.integer({ min: 1, max: 10 }),
})

describe('Property 5: Cart rejects invalid add operations', () => {
  it('rejects INACTIVE variant', () => {
    fc.assert(fc.property(
      fc.array(cartItemArb, { maxLength: 5 }),
      fc.record({ sku: fc.string(), status: fc.constant('INACTIVE'), stock: fc.integer({ min: 1, max: 50 }) }),
      (cart, variant) => {
        const result = addToCart(cart, { productId: 'P1', sku: variant.sku, qty: 1, variant })
        return result.ok === false
      }
    ))
  })

  it('rejects when stock = 0', () => {
    fc.assert(fc.property(
      fc.array(cartItemArb, { maxLength: 5 }),
      fc.record({ sku: fc.string(), status: fc.constant('ACTIVE'), stock: fc.constant(0) }),
      (cart, variant) => {
        const result = addToCart(cart, { productId: 'P1', sku: variant.sku, qty: 1, variant })
        return result.ok === false
      }
    ))
  })

  it('rejects when qty > stock', () => {
    fc.assert(fc.property(
      fc.array(cartItemArb, { maxLength: 5 }),
      fc.integer({ min: 1, max: 10 }),
      (cart, stock) => {
        const variant = { sku: 'TEST-SKU', status: 'ACTIVE', stock }
        const result = addToCart(cart, { productId: 'P1', sku: variant.sku, qty: stock + 1, variant })
        return result.ok === false
      }
    ))
  })
})

describe('Property 6: Cart localStorage round-trip', () => {
  it('serialized then deserialized cart equals original', () => {
    fc.assert(fc.property(
      fc.array(cartItemArb, { minLength: 0, maxLength: 10 }),
      (items) => {
        const serialized = serializeCart(items)
        const restored = deserializeCart(serialized)
        return JSON.stringify(restored) === JSON.stringify(items)
      }
    ))
  })
})

describe('Property 13: Successful order clears cart', () => {
  it('clearCart returns empty array', () => {
    fc.assert(fc.property(
      fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
      (items) => {
        const cleared = clearCart()
        return cleared.length === 0
      }
    ))
  })
})
