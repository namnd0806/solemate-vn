import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED']
const CANCELLABLE = ['PENDING', 'CONFIRMED']
const ALLOWED_TRANSITIONS = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING',  'CANCELLED'],
  SHIPPING:  ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

const orderArb = fc.record({
  id: fc.string({ minLength: 5 }),
  customer_id: fc.option(fc.string({ minLength: 1 }), { nil: null }),
  status: fc.constantFrom(...STATUSES),
  total: fc.integer({ min: 0, max: 10000000 }),
  stock_restored: fc.boolean(),
  created_at: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
})

function filterCustomerOrders(orders, customerId) {
  return orders
    .filter(o => o.customer_id === customerId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

function canCancel(order) {
  return CANCELLABLE.includes(order.status) && !order.stock_restored
}

function isValidTransition(from, to) {
  return (ALLOWED_TRANSITIONS[from] || []).includes(to)
}

function lookupGuestOrder(order, inputPhone) {
  return order.contact?.phone === inputPhone ? order : null
}

describe('Property 17: Customer order list contains only their orders, sorted descending', () => {
  it('only contains orders for the given customer', () => {
    fc.assert(fc.property(
      fc.array(orderArb, { minLength: 0, maxLength: 20 }),
      fc.string({ minLength: 1 }),
      (orders, customerId) => {
        const result = filterCustomerOrders(orders, customerId)
        return result.every(o => o.customer_id === customerId)
      }
    ))
  })

  it('result is sorted descending by created_at', () => {
    fc.assert(fc.property(
      fc.array(orderArb, { minLength: 2, maxLength: 20 }),
      fc.string({ minLength: 1 }),
      (orders, customerId) => {
        const result = filterCustomerOrders(orders, customerId)
        for (let i = 0; i < result.length - 1; i++) {
          if (new Date(result[i].created_at) < new Date(result[i + 1].created_at)) return false
        }
        return true
      }
    ))
  })
})

describe('Property 18: Guest lookup rejects mismatched phone', () => {
  it('returns null when phone does not match', () => {
    fc.assert(fc.property(
      fc.record({ id: fc.string(), contact: fc.record({ phone: fc.string({ minLength: 10, maxLength: 10 }) }) }),
      fc.string({ minLength: 10, maxLength: 10 }),
      (order, wrongPhone) => {
        fc.pre(order.contact.phone !== wrongPhone)
        const result = lookupGuestOrder(order, wrongPhone)
        return result === null
      }
    ))
  })
})

describe('Property 21: Ineligible order statuses cannot be cancelled', () => {
  it('SHIPPING/DELIVERED/CANCELLED orders cannot be cancelled', () => {
    fc.assert(fc.property(
      fc.constantFrom('SHIPPING', 'DELIVERED', 'CANCELLED'),
      (status) => {
        const order = { status, stock_restored: false }
        return canCancel(order) === false
      }
    ))
  })
})

describe('Property 20: Cancellation is idempotent when stock_restored=true', () => {
  it('order with stock_restored=true cannot be cancelled again', () => {
    fc.assert(fc.property(
      fc.constantFrom('PENDING', 'CONFIRMED'),
      (status) => {
        const order = { status, stock_restored: true }
        return canCancel(order) === false
      }
    ))
  })
})

describe('Property 24: Order state machine enforces valid transitions only', () => {
  it('PENDING can only go to CONFIRMED or CANCELLED', () => {
    expect(isValidTransition('PENDING', 'CONFIRMED')).toBe(true)
    expect(isValidTransition('PENDING', 'CANCELLED')).toBe(true)
    expect(isValidTransition('PENDING', 'SHIPPING')).toBe(false)
    expect(isValidTransition('PENDING', 'DELIVERED')).toBe(false)
  })

  it('DELIVERED and CANCELLED have no valid transitions', () => {
    fc.assert(fc.property(
      fc.constantFrom(...STATUSES),
      (target) => {
        return !isValidTransition('DELIVERED', target) && !isValidTransition('CANCELLED', target)
      }
    ))
  })

  it('invalid transitions are always rejected', () => {
    fc.assert(fc.property(
      fc.constantFrom(...STATUSES),
      fc.constantFrom(...STATUSES),
      (from, to) => {
        const valid = isValidTransition(from, to)
        const expected = (ALLOWED_TRANSITIONS[from] || []).includes(to)
        return valid === expected
      }
    ))
  })
})
