/**
 * Format a number as Vietnamese Dong currency.
 * e.g. 1299000 → "1.299.000 ₫"
 * @param {number} amount
 * @returns {string}
 */
export function formatVND(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 ₫'
  return amount.toLocaleString('vi-VN') + ' ₫'
}

export const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'

function toDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatVNDate(value, options = {}) {
  const date = toDate(value)
  if (!date) return '-'
  return date.toLocaleDateString('vi-VN', { timeZone: VN_TIME_ZONE, ...options })
}

export function formatVNDateTime(value, options = {}) {
  const date = toDate(value)
  if (!date) return '-'
  return date.toLocaleString('vi-VN', {
    timeZone: VN_TIME_ZONE,
    hour12: false,
    ...options,
  })
}

function getVNParts(value) {
  const date = toDate(value)
  if (!date) return null
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: VN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = type => parts.find(part => part.type === type)?.value
  return { year: get('year'), month: get('month'), day: get('day') }
}

export function formatVNDateTimeInput(value) {
  const date = toDate(value)
  if (!date) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: VN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = type => parts.find(part => part.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

export function getVNDateKey(value = new Date()) {
  const parts = getVNParts(value)
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : ''
}

export function getVNMonthKey(value = new Date()) {
  const parts = getVNParts(value)
  return parts ? `${parts.year}-${parts.month}` : ''
}

export function getVNYearKey(value = new Date()) {
  const parts = getVNParts(value)
  return parts ? parts.year : ''
}

export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/**
 * Validate Vietnamese phone number format.
 * Accepts: 10-digit numbers starting with 0, or +84/84 prefix followed by 9 digits.
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePhone(phone) {
  if (!phone) return false
  const cleaned = phone.replace(/\s/g, '')
  return /^(0[3-9]\d{8}|(\+84|84)[3-9]\d{8})$/.test(cleaned)
}

/**
 * Validate email address format.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Generate a unique order ID in format SMVN-{timestamp}{random4digits}.
 * e.g. "SMVN-17094823451234"
 * @returns {string}
 */
export function generateOrderId() {
  const ts = Date.now().toString()
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `SMVN-${ts}${rand}`
}
