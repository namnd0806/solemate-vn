import { getSupabaseServerClient } from '@/lib/supabase/server'
import { formatVND } from '@/lib/utils'
import Link from 'next/link'

export const metadata = { title: 'Dashboard – Admin SoleMate VN' }

async function getDashboardData() {
  const supabase = getSupabaseServerClient()
  const [ordersRes, settingsRes] = await Promise.all([
    supabase.from('orders').select('id, status, total, created_at, contact, payment_method, payment_status').order('created_at', { ascending: false }),
    supabase.from('settings').select('*').single(),
  ])

  const orders = ordersRes.data || []
  const settings = settingsRes.data || { low_stock_threshold: 3 }

  const revenue = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.total, 0)
  const pending = orders.filter(o => ['PENDING', 'CONFIRMED', 'PACKING'].includes(o.status)).length
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayOrders = orders.filter(o => o.created_at?.slice(0, 10) === todayStr).length
  const todayRevenue = orders
    .filter(o => o.status === 'DELIVERED' && o.created_at?.slice(0, 10) === todayStr)
    .reduce((s, o) => s + o.total, 0)

  const statusBreakdown = { PENDING: 0, CONFIRMED: 0, PACKING: 0, SHIPPING: 0, DELIVERED: 0, CANCELLED: 0 }
  orders.forEach(o => { if (statusBreakdown[o.status] !== undefined) statusBreakdown[o.status]++ })

  // 7-day revenue
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const dayRevenue = orders
      .filter(o => o.status === 'DELIVERED' && o.created_at?.slice(0, 10) === dateStr)
      .reduce((s, o) => s + o.total, 0)
    days.push({ date: dateStr.slice(5), revenue: dayRevenue })
  }

  // Low stock
  const { data: lowStock } = await supabase
    .from('variants')
    .select('sku, stock, product_id, products(name)')
    .eq('status', 'ACTIVE')
    .lte('stock', settings.low_stock_threshold)
    .order('stock', { ascending: true })

  return { revenue, pending, statusBreakdown, days, lowStock: lowStock || [], recentOrders: orders.slice(0, 6), todayOrders, todayRevenue }
}

const STATUS_VN = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PACKING: 'Đang đóng gói', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy' }
const STATUS_TONE = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  CONFIRMED: 'bg-sky-50 text-sky-700 border-sky-100',
  PACKING: 'bg-orange-50 text-primary border-orange-100',
  SHIPPING: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  CANCELLED: 'bg-red-50 text-red-600 border-red-100',
}

function DashboardMetric({ label, value, hint, tone, path, trend }) {
  const glow = {
    green: 'from-emerald-50 to-white',
    orange: 'from-orange-50 to-white',
    red: 'from-red-50 to-white',
    blue: 'from-sky-50 to-white',
  }
  const iconTone = {
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-primary',
    red: 'bg-red-50 text-red-500',
    blue: 'bg-sky-50 text-sky-600',
  }
  const barTone = {
    green: 'bg-emerald-200',
    orange: 'bg-orange-200',
    red: 'bg-red-200',
    blue: 'bg-sky-200',
  }
  return (
    <div className={`group relative overflow-hidden rounded-[26px] border border-gray-200 bg-gradient-to-br ${glow[tone]} p-5 shadow-[0_18px_50px_rgba(20,23,28,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(20,23,28,.12)]`}>
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/70 blur-2xl" />
      <div className="relative flex items-center gap-5">
        <span className={`grid size-14 shrink-0 place-items-center rounded-full shadow-inner ${iconTone[tone]}`}>
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2"><path d={path} /></svg>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-3xl font-black leading-none tracking-tight text-sole-dark">{value}</p>
            <span className={`rounded-full px-3 py-1 text-xs font-black shadow-sm ${iconTone[tone]}`}>{trend}</span>
          </div>
          <p className="mt-3 text-base font-black text-sole-dark">{label}</p>
          <p className="mt-1 text-xs font-bold text-gray-400">{hint}</p>
        </div>
        <div className="hidden items-end gap-1 self-end sm:flex">
          {[16, 28, 20, 38].map((height, index) => <span key={index} className={`w-2 rounded-full ${barTone[tone]}`} style={{ height }} />)}
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const { revenue, pending, statusBreakdown, days, lowStock, recentOrders, todayOrders, todayRevenue } = await getDashboardData()
  const maxRevenue = Math.max(...days.map(d => d.revenue), 1)
  const totalOrders = Object.values(statusBreakdown).reduce((a, b) => a + b, 0)
  const visibleLowStock = lowStock.slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
        <p className="text-xs font-black uppercase tracking-[.24em] text-primary">Admin workspace</p>
        <h1 className="mt-1 text-4xl font-black tracking-[-.04em] text-sole-dark">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-400">Tổng quan vận hành, doanh thu và các điểm cần xử lý nhanh.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/orders" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-black text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary">
            Xử lý đơn
          </Link>
          <Link href="/admin/inventory" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-[#ff4f24] px-5 text-sm font-black text-white shadow-[0_12px_26px_rgba(242,106,46,.25)] transition hover:-translate-y-0.5">
            Kiểm tra kho
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {[
          { label: 'Doanh thu đã giao', value: formatVND(revenue), hint: `Hôm nay ${formatVND(todayRevenue)}`, tone: 'green', trend: '+12%', path: 'M5 12h14M12 5v14' },
          { label: 'Đơn cần xử lý', value: pending, hint: 'Chờ xác nhận, đóng gói', tone: 'orange', trend: pending ? `+${pending}` : '0', path: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
          { label: 'SKU tồn thấp', value: lowStock.length, hint: 'Cần kiểm tra nhập hàng', tone: 'red', trend: lowStock.length ? `+${lowStock.length}` : '0%', path: 'M12 9v4m0 4h.01M10.3 4.3 2.8 17.5A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.5L13.7 4.3a2 2 0 0 0-3.4 0Z' },
          { label: 'Tổng đơn hàng', value: totalOrders, hint: `Hôm nay ${todayOrders} đơn`, tone: 'blue', trend: '+18%', path: 'M4 7 12 3l8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10' },
        ].map(card => <DashboardMetric key={card.label} {...card} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
        <section className="relative overflow-hidden rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_18px_55px_rgba(20,23,28,.07)]">
          <div className="absolute right-8 top-0 h-24 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-black text-sole-dark">Doanh thu 7 ngày qua</h2>
              <p className="mt-1 text-xs text-gray-400">Chỉ tính các đơn đã giao, giúp xem nhịp vận hành thực tế.</p>
            </div>
            <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black text-primary">7 ngày</span>
          </div>
          <div className="relative flex h-52 items-end gap-3 rounded-[24px] bg-gradient-to-b from-[#f7f8f9] to-white p-4">
            {days.map(d => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-2xl bg-gradient-to-t from-primary to-orange-300 shadow-[0_10px_22px_rgba(242,106,46,.18)] transition-all hover:opacity-80"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  title={formatVND(d.revenue)}
                />
                <span className="text-[11px] font-bold text-gray-400">{d.date}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_18px_55px_rgba(20,23,28,.07)]">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-black text-sole-dark">Trạng thái đơn hàng</h2>
            <p className="mt-1 text-xs text-gray-400">Nhìn nhanh số lượng đơn theo từng bước xử lý.</p>
          </div>
          <div className="space-y-2 p-5">
            {Object.entries(statusBreakdown).map(([s, count]) => (
              <div key={s} className="rounded-2xl bg-[#f7f8f9] px-4 py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="font-bold text-gray-600">{STATUS_VN[s]}</span>
                  <span className="font-black text-sole-dark">{count}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${totalOrders ? Math.max(4, (count / totalOrders) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,.75fr)]">
        <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_18px_55px_rgba(20,23,28,.07)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5">
            <div>
              <h2 className="font-black text-sole-dark">Đơn mới gần đây</h2>
              <p className="mt-1 text-xs text-gray-400">Hiển thị 6 đơn mới nhất, xem đầy đủ tại màn Đơn hàng.</p>
            </div>
            <Link href="/admin/orders" className="rounded-2xl border border-gray-200 px-4 py-2 text-xs font-black text-gray-600 transition hover:border-primary hover:text-primary">Xem tất cả</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.length === 0 ? (
              <div className="p-10 text-center text-sm font-bold text-gray-400">Chưa có đơn hàng.</div>
            ) : recentOrders.map(order => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-orange-50/25">
                <div>
                  <p className="font-mono text-xs font-black text-sole-dark">#{order.id}</p>
                  <p className="mt-1 text-xs text-gray-400">{order.contact?.fullName || 'Khách'} · {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${STATUS_TONE[order.status] || 'border-gray-100 bg-gray-50 text-gray-500'}`}>{STATUS_VN[order.status] || order.status}</span>
                  <span className="text-sm font-black text-primary">{formatVND(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_18px_55px_rgba(20,23,28,.07)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5">
            <div>
            <h2 className="font-black text-sole-dark">Tồn kho thấp</h2>
            <p className="mt-1 text-xs text-gray-400">Các SKU cần nhập bổ sung hoặc kiểm tra lại trạng thái bán.</p>
            </div>
            <Link href="/admin/inventory" className="rounded-2xl border border-gray-200 px-4 py-2 text-xs font-black text-gray-600 transition hover:border-primary hover:text-primary">Xem kho</Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="p-10 text-center text-sm font-bold text-gray-400">Kho đang ổn, chưa có SKU tồn thấp.</div>
          ) : (
            <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f7f8f9] text-left text-[10px] uppercase tracking-[.12em] text-gray-400">
                <th className="px-5 py-3">SKU</th><th className="px-5 py-3">Sản phẩm</th><th className="px-5 py-3 text-right">Tồn kho</th>
              </tr></thead>
              <tbody>
                {visibleLowStock.map(v => (
                  <tr key={v.sku} className="border-b border-gray-100 last:border-0 hover:bg-orange-50/30">
                    <td className="px-5 py-4 font-mono text-xs font-black text-gray-600">{v.sku}</td>
                    <td className="px-5 py-4 font-bold text-gray-600">{v.products?.name}</td>
                    <td className="px-5 py-4 text-right text-lg font-black text-red-500">{v.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-gray-100 md:hidden">
            {visibleLowStock.map(v => (
              <div key={v.sku} className="p-4">
                <p className="font-mono text-[11px] font-black text-primary">{v.sku}</p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="line-clamp-2 text-sm font-bold text-sole-dark">{v.products?.name}</p>
                  <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-black text-primary">Còn {v.stock}</span>
                </div>
              </div>
            ))}
          </div>
          {lowStock.length > visibleLowStock.length && (
            <div className="border-t border-gray-100 bg-orange-50/45 px-5 py-3 text-xs font-black text-primary">
              Còn {lowStock.length - visibleLowStock.length} SKU tồn thấp khác. Vào màn Kho hàng để xử lý đầy đủ.
            </div>
          )}
          </>
          )}
        </section>
      </div>
    </div>
  )
}
