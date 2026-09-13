import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyJwt } from '@/lib/auth'
import { getOrders } from '@/lib/db/orders'
import { formatVND } from '@/lib/utils'
import Link from 'next/link'

const STATUS_LABELS = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', SHIPPING:'Đang giao', DELIVERED:'Đã giao', CANCELLED:'Đã hủy' }
const STATUS_COLORS = { PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700', SHIPPING:'bg-indigo-100 text-indigo-700', DELIVERED:'bg-green-100 text-green-700', CANCELLED:'bg-red-100 text-red-600' }

export const metadata = { title: 'Đơn hàng của tôi – SoleMate VN' }

export default async function MyOrdersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('smvn_customer_token')?.value
  const payload = token ? await verifyJwt(token) : null
  if (!payload) redirect('/login?returnUrl=/account/orders')

  const result = await getOrders({ customerId: payload.sub, limit: 50 })
  const orders = result.ok ? result.data.orders : []

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-sole-dark mb-8">Đơn hàng của tôi</h1>
      {orders.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">📦</p>
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link href="/products" className="mt-4 inline-block text-primary hover:underline">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <Link key={o.id} href={`/order/${o.id}`} className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sole-dark">#{o.id}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || ''}`}>{STATUS_LABELS[o.status]}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{new Date(o.created_at).toLocaleDateString('vi-VN')}</span>
                <span className="font-semibold text-primary">{formatVND(o.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
