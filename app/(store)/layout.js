import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'
import { getUserById } from '@/lib/db/users'
import { CartProvider } from '@/contexts/CartContext'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'

export default async function StoreLayout({ children }) {
  let user = null
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('smvn_customer_token')?.value
    if (token) {
      const payload = await verifyJwt(token)
      if (payload?.sub) {
        const result = await getUserById(payload.sub)
        if (result.ok) user = result.data
      }
    }
  } catch {}

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  )
}
