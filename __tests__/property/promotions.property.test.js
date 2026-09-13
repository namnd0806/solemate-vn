import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

function calcDiscount(promo, subtotal) {
  if (promo.type === 'PERCENT') {
    let d = Math.floor(subtotal * promo.value / 100)
    if (promo.max_discount) d = Math.min(d, promo.max_discount)
    return Math.min(d, subtotal)
  }
  return Math.min(promo.value, subtotal)
}

function isPromoCodeMatch(storedCode, inputCode) {
  return storedCode.toUpperCase() === inputCode.toUpperCase()
}

function validatePromoDate(promo, now = new Date()) {
  return new Date(promo.start_at) <= now && new Date(promo.end_at) >= now
}

function isDuplicateCode(existing, newCode) {
  return existing.some(c => c.toUpperCase() === newCode.toUpperCase())
}

describe('Property 14: Promotion code lookup is case-insensitive', () => {
  it('matches regardless of case', () => {
    fc.assert(fc.property(
      fc.stringMatching(/^[A-Z0-9]{3,10}$/),
      fc.constantFrom('lower', 'upper', 'mixed'),
      (code, variant) => {
        const input = variant === 'lower' ? code.toLowerCase()
          : variant === 'upper' ? code.toUpperCase()
          : code.split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join('')
        return isPromoCodeMatch(code, input)
      }
    ))
  })
})

describe('Property 15: PERCENT discount never exceeds max_discount or subtotal', () => {
  it('discount <= max_discount when set', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 100 }),      // value (percent)
      fc.integer({ min: 10000, max: 500000 }), // max_discount
      fc.integer({ min: 100000, max: 5000000 }), // subtotal
      (value, max_discount, subtotal) => {
        const promo = { type: 'PERCENT', value, max_discount }
        const discount = calcDiscount(promo, subtotal)
        return discount <= max_discount && discount <= subtotal
      }
    ))
  })
})

describe('Property 16: FIXED discount never exceeds subtotal', () => {
  it('discount <= subtotal always', () => {
    fc.assert(fc.property(
      fc.integer({ min: 10000, max: 2000000 }), // value
      fc.integer({ min: 0, max: 5000000 }),      // subtotal
      (value, subtotal) => {
        const promo = { type: 'FIXED', value }
        const discount = calcDiscount(promo, subtotal)
        return discount <= subtotal && discount >= 0
      }
    ))
  })
})

describe('Property 25: Duplicate promotion code is always rejected (case-insensitive)', () => {
  it('isDuplicateCode returns true for any case variant', () => {
    fc.assert(fc.property(
      fc.array(fc.stringMatching(/^[A-Z0-9]{3,10}$/), { minLength: 1, maxLength: 5 }),
      fc.nat({ max: 4 }),
      (codes, idx) => {
        const pickedCode = codes[idx % codes.length]
        const lower = pickedCode.toLowerCase()
        return isDuplicateCode(codes, lower) === true
      }
    ))
  })
})

describe('Property 26: Promotion date range is always enforced', () => {
  it('expired promo (end_at in past) fails validation', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 30 }),
      (daysAgo) => {
        const now = new Date()
        const promo = {
          start_at: new Date(now.getTime() - (daysAgo + 10) * 86400000).toISOString(),
          end_at: new Date(now.getTime() - daysAgo * 86400000).toISOString(),
        }
        return validatePromoDate(promo, now) === false
      }
    ))
  })

  it('future promo (start_at in future) fails validation', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 30 }),
      (daysAhead) => {
        const now = new Date()
        const promo = {
          start_at: new Date(now.getTime() + daysAhead * 86400000).toISOString(),
          end_at: new Date(now.getTime() + (daysAhead + 10) * 86400000).toISOString(),
        }
        return validatePromoDate(promo, now) === false
      }
    ))
  })
})
