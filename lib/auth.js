import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET)

export async function signJwt(payload, expiresIn) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret())
}

export async function verifyJwt(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload
  } catch {
    return null
  }
}

export async function getCustomerFromRequest(req) {
  let token
  if (req) {
    token = req.cookies?.get?.('smvn_customer_token')?.value
      || req.headers?.get?.('cookie')?.match(/smvn_customer_token=([^;]+)/)?.[1]
  }
  if (!token) {
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('smvn_customer_token')?.value
    } catch {
      // not in Next.js context
    }
  }
  if (!token) return null
  const payload = await verifyJwt(token)
  if (!payload || payload.role !== 'CUSTOMER') return null
  return payload
}

export async function getAdminFromRequest(req) {
  let token
  if (req) {
    token = req.cookies?.get?.('smvn_admin_token')?.value
      || req.headers?.get?.('cookie')?.match(/smvn_admin_token=([^;]+)/)?.[1]
  }
  if (!token) {
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('smvn_admin_token')?.value
    } catch {
      // not in Next.js context
    }
  }
  if (!token) return null
  const payload = await verifyJwt(token)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}
