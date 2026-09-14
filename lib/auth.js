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

// Get token from request cookies OR next/headers cookies() — tries both
async function getTokenFromRequest(req, cookieName) {
  // 1. Try from Request object directly (most reliable for API routes)
  if (req) {
    const fromReq = req.cookies?.get?.(cookieName)?.value
    if (fromReq) return fromReq

    // Parse from cookie header string
    const cookieHeader = req.headers?.get?.('cookie') || ''
    const match = cookieHeader.match(new RegExp(`${cookieName}=([^;\\s]+)`))
    if (match?.[1]) return match[1]
  }

  // 2. Fallback to next/headers (works in Server Components and some Route Handlers)
  try {
    const cookieStore = await cookies()
    const val = cookieStore.get(cookieName)?.value
    if (val) return val
  } catch {
    // not in Next.js async context
  }

  return null
}

export async function getCustomerFromRequest(req) {
  const token = await getTokenFromRequest(req, 'smvn_customer_token')
  if (!token) return null
  const payload = await verifyJwt(token)
  if (!payload || payload.role !== 'CUSTOMER') return null
  return payload
}

export async function getAdminFromRequest(req) {
  const token = await getTokenFromRequest(req, 'smvn_admin_token')
  if (!token) return null
  const payload = await verifyJwt(token)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}
