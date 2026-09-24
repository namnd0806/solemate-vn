import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyJwt } from '@/lib/auth'
import { getOrders } from '@/lib/db/orders'
import { formatVND } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRightIcon, BoxIcon } from '@/components/store/Icons'

const STATUS_LABELS = { PENDING:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', PACKING:'Đang chuẩn bị hàng', SHIPPING:'Đang giao', DELIVERED:'Đã giao', CANCELLED:'Đã hủy' }
const STATUS_COLORS = { PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700', PACKING:'bg-orange-100 text-orange-700', SHIPPING:'bg-indigo-100 text-indigo-700', DELIVERED:'bg-green-100 text-green-700', CANCELLED:'bg-red-100 text-red-600' }

export const metadata = { title: 'Đơn hàng của tôi – SoleMate VN' }

export default async function MyOrdersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('smvn_customer_token')?.value
  const payload = token ? await verifyJwt(token) : null
  if (!payload) redirect('/login?returnUrl=/account/orders')

  const result = await getOrders({ customerId: payload.sub, limit: 50 })
  const orders = result.ok ? result.data.orders : []

  return (
    <main className="mx-auto min-h-[62vh] max-w-4xl px-4 py-10 sm:py-14">
      <div className="mb-8" data-reveal>
        <p className="section-kicker">Tài khoản</p>
        <h1 className="section-title mt-1.5">Đơn hàng của tôi</h1>
        <p className="mt-2 text-sm text-gray-500">Theo dõi lịch sử mua sắm và trạng thái giao hàng.</p>
      </div>
      {orders.length === 0 ? (
        <div className="surface-card flex flex-col items-center px-6 py-20 text-center" data-reveal>
          <div className="mb-5 grid size-20 place-items-center rounded-full bg-primary/8 text-primary"><BoxIcon className="size-9" /></div>
          <h2 className="text-xl font-black text-sole-dark">Bạn chưa có đơn hàng nào</h2>
          <p className="mt-2 text-sm text-gray-500">Bắt đầu chọn một đôi giày phù hợp với phong cách của bạn.</p>
          <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-deep">Mua sắm ngay <ArrowRightIcon /></Link>
        </div>
      ) : (
        <div className="space-y-4" data-reveal>
          {orders.map(o => (
            <Link key={o.id} href={`/order/${o.id}`} className="group block rounded-[18px] border border-gray-200 bg-white p-5 shadow-[0_8px_28px_rgba(20,23,28,.05)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_16px_36px_rgba(20,23,28,.1)] sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-sole-dark text-white"><BoxIcon /></span><span className="font-bold text-sole-dark">#{o.id}</span></div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[o.status] || o.status}</span>
              </div>
              <div className="flex items-end justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
                <span>{new Date(o.created_at).toLocaleDateString('vi-VN')}</span>
                <span className="flex items-center gap-3"><strong className="text-base text-primary">{formatVND(o.total)}</strong><ArrowRightIcon className="size-4 transition group-hover:translate-x-1" /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
