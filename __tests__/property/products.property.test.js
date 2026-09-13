import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

function canAddToCart(variant, qty) {
  if (!variant || variant.status !== 'ACTIVE') return { ok: false, message: 'Variant không hợp lệ.' }
  if (variant.stock === 0) return { ok: false, message: 'Hết hàng.' }
  if (qty > variant.stock) return { ok: false, message: `Chỉ còn ${variant.stock} sản phẩm.` }
  return { ok: true }
}

function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

const variantArb = fc.record({
  sku: fc.string({ minLength: 3, maxLength: 20 }),
  status: fc.constantFrom('ACTIVE', 'INACTIVE'),
  stock: fc.integer({ min: 0, max: 100 }),
})

describe('Property 3: Out-of-stock variant disables add-to-cart', () => {
  it('stock=0 ACTIVE variant rejects add', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 10 }),
      (qty) => {
        const variant = { sku: 'TEST', status: 'ACTIVE', stock: 0 }
        return canAddToCart(variant, qty).ok === false
      }
    ))
  })

  it('INACTIVE variant rejects add regardless of stock', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 100 }),
      fc.integer({ min: 1, max: 10 }),
      (stock, qty) => {
        const variant = { sku: 'TEST', status: 'INACTIVE', stock }
        return canAddToCart(variant, qty).ok === false
      }
    ))
  })

  it('qty > stock rejects add', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 50 }),
      (stock) => {
        const variant = { sku: 'TEST', status: 'ACTIVE', stock }
        return canAddToCart(variant, stock + 1).ok === false
      }
    ))
  })

  it('valid variant with sufficient stock allows add', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 100 }),
      fc.integer({ min: 1, max: 100 }),
      (stock, qty) => {
        fc.pre(qty <= stock)
        const variant = { sku: 'TEST', status: 'ACTIVE', stock }
        return canAddToCart(variant, qty).ok === true
      }
    ))
  })
})

describe('Property 4: Pagination completeness and boundary invariant', () => {
  it('all pages together contain exactly N items', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 50 }),
      fc.integer({ min: 1, max: 20 }),
      (N, pageSize) => {
        const items = Array.from({ length: N }, (_, i) => i)
        const totalPages = Math.ceil(N / pageSize) || 1
        const collected = []
        for (let p = 1; p <= totalPages; p++) {
          collected.push(...paginate(items, p, pageSize))
        }
        return collected.length === N
      }
    ))
  })

  it('each page has at most pageSize items', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 50 }),
      fc.integer({ min: 1, max: 20 }),
      fc.integer({ min: 1, max: 10 }),
      (N, pageSize, page) => {
        const items = Array.from({ length: N }, (_, i) => i)
        const result = paginate(items, page, pageSize)
        return result.length <= pageSize
      }
    ))
  })
})
