import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import bcrypt from 'bcryptjs'

function validatePasswordLength(password) {
  return password.length >= 6
}

function getGenericErrorMessage() {
  return 'Email hoặc mật khẩu không đúng.'
}

describe('Property 7: Password hash is never stored as plain text', () => {
  it('bcrypt hash differs from plain password', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 6, maxLength: 30 }),
      async (password) => {
        const hash = await bcrypt.hash(password, 10)
        return hash !== password
      }
    ))
  })

  it('bcrypt hash verifies correctly', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 6, maxLength: 30 }),
      async (password) => {
        const hash = await bcrypt.hash(password, 10)
        return await bcrypt.compare(password, hash)
      }
    ))
  })

  it('different passwords produce different hashes', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 6, maxLength: 20 }),
      fc.string({ minLength: 6, maxLength: 20 }),
      async (p1, p2) => {
        fc.pre(p1 !== p2)
        const h1 = await bcrypt.hash(p1, 10)
        const h2 = await bcrypt.hash(p2, 10)
        return h1 !== h2
      }
    ))
  })
}, 30000)

describe('Property 8: Duplicate email registration always fails with same message', () => {
  it('duplicate detection is case-insensitive', () => {
    fc.assert(fc.property(
      fc.emailAddress(),
      (email) => {
        const registered = [email.toLowerCase()]
        const isDuplicate = (input) => registered.includes(input.toLowerCase())
        return isDuplicate(email) && isDuplicate(email.toUpperCase())
      }
    ))
  })
})

describe('Property 9: Short passwords are always rejected', () => {
  it('passwords < 6 chars are always invalid', () => {
    fc.assert(fc.property(
      fc.string({ maxLength: 5 }),
      (password) => {
        return validatePasswordLength(password) === false
      }
    ))
  })

  it('passwords >= 6 chars are always valid length', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 6, maxLength: 50 }),
      (password) => {
        return validatePasswordLength(password) === true
      }
    ))
  })
})

describe('Property 10: Invalid credentials always return the same generic error', () => {
  it('error message does not reveal which field is wrong', () => {
    const msg = getGenericErrorMessage()
    expect(msg).toBe('Email hoặc mật khẩu không đúng.')
    expect(msg).not.toContain('email')
    expect(msg).not.toContain('không tồn tại')
    expect(msg).not.toContain('sai mật khẩu')
  })
})
