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
