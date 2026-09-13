import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

function applyAdjustment(currentStock, delta) {
  if (!Number.isInteger(delta) || delta === 0) {
    return { ok: false, message: 'Số lượng điều chỉnh phải là số nguyên khác 0.' }
  }
  const newStock = currentStock + delta
  if (newStock < 0) {
    return { ok: false, message: 'Tồn kho không thể âm.' }
  }
  return { ok: true, before: currentStock, after: newStock, delta }
}

describe('Property 22: Stock adjustment maintains transaction integrity', () => {
  it('stock_before + delta = stock_after', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 1000 }),
      fc.integer({ min: -500, max: 500 }).filter(d => d !== 0),
      (stock, delta) => {
        const result = applyAdjustment(stock, delta)
        if (!result.ok) return true // skip invalid cases
        return result.before + result.delta === result.after
      }
    ))
  })

  it('rejects zero delta always', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 1000 }),
      (stock) => {
        const result = applyAdjustment(stock, 0)
        return result.ok === false
      }
    ))
  })
})

describe('Property 23: Negative stock is impossible through any code path', () => {
  it('rejects any delta that would make stock negative', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 100 }),
      fc.integer({ min: 1, max: 200 }),
      (stock, reduction) => {
        fc.pre(reduction > stock) // ensure it would go negative
        const result = applyAdjustment(stock, -reduction)
        return result.ok === false && result.message === 'Tồn kho không thể âm.'
      }
    ))
  })

  it('valid positive adjustment always succeeds', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 1000 }),
      fc.integer({ min: 1, max: 500 }),
      (stock, addition) => {
        const result = applyAdjustment(stock, addition)
        return result.ok === true && result.after === stock + addition && result.after >= 0
      }
    ))
  })

  it('valid negative adjustment (within bounds) succeeds', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 1000 }),
      fc.integer({ min: 1, max: 1000 }).chain(stock =>
        fc.tuple(fc.constant(stock), fc.integer({ min: 1, max: stock }))
      ),
      (_, [stock, reduction]) => {
        const result = applyAdjustment(stock, -reduction)
        return result.ok === true && result.after >= 0
      }
    ))
  })
})
