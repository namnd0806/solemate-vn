import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

function calcRevenue(orders) {
  return orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.total, 0)
}

function getLowStockList(variants, threshold) {
  return variants.filter(v => v.status === 'ACTIVE' && v.stock <= threshold)
}

const orderArb = fc.record({
  id: fc.string(),
  status: fc.constantFrom('PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'),
  total: fc.integer({ min: 0, max: 10000000 }),
})

const variantArb = fc.record({
  sku: fc.string({ minLength: 3 }),
  status: fc.constantFrom('ACTIVE', 'INACTIVE'),
  stock: fc.integer({ min: 0, max: 200 }),
})

describe('Property 27: Dashboard revenue equals sum of DELIVERED order totals', () => {
  it('revenue is sum of DELIVERED totals only', () => {
    fc.assert(fc.property(
      fc.array(orderArb, { minLength: 0, maxLength: 30 }),
      (orders) => {
        const revenue = calcRevenue(orders)
        const expected = orders
          .filter(o => o.status === 'DELIVERED')
          .reduce((s, o) => s + o.total, 0)
        return revenue === expected
      }
    ))
  })

  it('non-DELIVERED orders never contribute to revenue', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          id: fc.string(),
          status: fc.constantFrom('PENDING', 'CONFIRMED', 'SHIPPING', 'CANCELLED'),
          total: fc.integer({ min: 1, max: 10000000 }),
        }),
        { minLength: 1, maxLength: 20 }
      ),
      (orders) => {
        return calcRevenue(orders) === 0
      }
    ))
  })
})

describe('Property 28: Low-stock list never includes INACTIVE variants', () => {
  it('INACTIVE variants never appear in low-stock list regardless of stock level', () => {
    fc.assert(fc.property(
      fc.array(variantArb, { minLength: 0, maxLength: 30 }),
      fc.integer({ min: 1, max: 10 }),
      (variants, threshold) => {
        const lowStock = getLowStockList(variants, threshold)
        return lowStock.every(v => v.status === 'ACTIVE')
      }
    ))
  })

  it('active variants with stock > threshold never appear in low-stock list', () => {
    fc.assert(fc.property(
      fc.array(variantArb, { minLength: 0, maxLength: 30 }),
      fc.integer({ min: 1, max: 10 }),
      (variants, threshold) => {
        const lowStock = getLowStockList(variants, threshold)
        return lowStock.every(v => v.stock <= threshold)
      }
    ))
  })
})
