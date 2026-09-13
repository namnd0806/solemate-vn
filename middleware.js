import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Allow /admin/login through without auth check
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get('smvn_admin_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
