import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// Pure search filter logic (mirrors getProducts search behavior)
function searchProducts(products, query) {
  if (!query) return products
  const q = query.toLowerCase()
  return products.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.brand?.toLowerCase().includes(q) ||
    p.category?.toLowerCase().includes(q)
  )
}

function sortProducts(products, sort) {
  const clone = [...products]
  if (sort === 'price_asc') clone.sort((a, b) => a.price - b.price)
  else if (sort === 'price_desc') clone.sort((a, b) => b.price - a.price)
  return clone
}

const productArb = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1, maxLength: 40 }),
  brand: fc.string({ minLength: 1, maxLength: 20 }),
  category: fc.constantFrom('LIFESTYLE', 'RUNNING', 'KIDS'),
  price: fc.integer({ min: 100000, max: 10000000 }),
  sale_price: fc.option(fc.integer({ min: 50000, max: 9000000 }), { nil: null }),
  status: fc.constantFrom('ACTIVE', 'INACTIVE'),
})

describe('Property 1: Search returns only matching products', () => {
  it('all results contain query in name, brand, or category', () => {
    fc.assert(fc.property(
      fc.array(productArb, { minLength: 0, maxLength: 30 }),
      fc.string({ minLength: 1, maxLength: 10 }),
      (products, query) => {
        const results = searchProducts(products, query)
        return results.every(p => {
          const q = query.toLowerCase()
          return (
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          )
        })
      }
    ))
  })

  it('empty query returns all products', () => {
    fc.assert(fc.property(
      fc.array(productArb, { minLength: 0, maxLength: 20 }),
      (products) => {
        const results = searchProducts(products, '')
        return results.length === products.length
      }
    ))
  })
})

describe('Property 2: Sort ordering invariant', () => {
  it('price_asc: each product price <= next product price', () => {
    fc.assert(fc.property(
      fc.array(productArb, { minLength: 2, maxLength: 20 }),
      (products) => {
        const sorted = sortProducts(products, 'price_asc')
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i].price > sorted[i + 1].price) return false
        }
        return true
      }
    ))
  })

  it('price_desc: each product price >= next product price', () => {
    fc.assert(fc.property(
      fc.array(productArb, { minLength: 2, maxLength: 20 }),
      (products) => {
        const sorted = sortProducts(products, 'price_desc')
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i].price < sorted[i + 1].price) return false
        }
        return true
      }
    ))
  })
})
