import { getSupabaseServerClient } from '@/lib/supabase/server'
import { formatVND } from '@/lib/utils'

export const metadata = { title: 'Dashboard – Admin SoleMate VN' }

async function getDashboardData() {
  const supabase = getSupabaseServerClient()
  const [ordersRes, settingsRes] = await Promise.all([
    supabase.from('orders').select('id, status, total, created_at'),
    supabase.from('settings').select('*').single(),
  ])

  const orders = ordersRes.data || []
  const settings = settingsRes.data || { low_stock_threshold: 3 }

  const revenue = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.total, 0)
  const pending = orders.filter(o => ['PENDING', 'CONFIRMED', 'PACKING'].includes(o.status)).length

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

  return { revenue, pending, statusBreakdown, days, lowStock: lowStock || [] }
}

const STATUS_VN = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PACKING: 'Đang đóng gói', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy' }

export default async function DashboardPage() {
  const { revenue, pending, statusBreakdown, days, lowStock } = await getDashboardData()
  const maxRevenue = Math.max(...days.map(d => d.revenue), 1)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[.18em] text-primary">Business cockpit</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-sole-dark">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-400">Tổng quan vận hành, doanh thu và các điểm cần xử lý nhanh.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng doanh thu', value: formatVND(revenue), tone: 'bg-emerald-50 text-emerald-600', path: 'M5 12h14M12 5v14' },
          { label: 'Đơn chờ xử lý', value: pending, tone: 'bg-orange-50 text-primary', path: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
          { label: 'Sản phẩm tồn kho thấp', value: lowStock.length, tone: 'bg-red-50 text-red-500', path: 'M12 9v4m0 4h.01M10.3 4.3 2.8 17.5A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.5L13.7 4.3a2 2 0 0 0-3.4 0Z' },
          { label: 'Tổng đơn hàng', value: Object.values(statusBreakdown).reduce((a, b) => a + b, 0), tone: 'bg-sky-50 text-sky-600', path: 'M4 7 12 3l8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10' },
        ].map(card => (
          <div key={card.label} className="group rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_35px_rgba(20,23,28,.055)] transition hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(20,23,28,.11)]">
            <span className={`mb-4 grid size-11 place-items-center rounded-2xl ${card.tone}`}>
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d={card.path} /></svg>
            </span>
            <p className="text-2xl font-black text-sole-dark">{card.value}</p>
            <p className="mt-1 text-sm font-bold text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 7-day chart */}
        <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_12px_35px_rgba(20,23,28,.055)]">
          <h2 className="mb-4 font-black text-sole-dark">Doanh thu 7 ngày qua</h2>
          <div className="flex items-end gap-2 h-32">
            {days.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-primary to-orange-300 min-h-[4px] transition-all hover:opacity-80"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  title={formatVND(d.revenue)}
                />
                <span className="text-xs text-gray-400">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order breakdown */}
        <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_12px_35px_rgba(20,23,28,.055)]">
          <h2 className="mb-4 font-black text-sole-dark">Trạng thái đơn hàng</h2>
          <div className="space-y-2">
            {Object.entries(statusBreakdown).map(([s, count]) => (
              <div key={s} className="flex justify-between rounded-2xl bg-[#f7f8f9] px-4 py-3 text-sm">
                <span className="text-gray-600">{STATUS_VN[s]}</span>
                <span className="font-black text-sole-dark">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock */}
      {lowStock.length > 0 && (
        <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_12px_35px_rgba(20,23,28,.055)]">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-black text-sole-dark">Tồn kho thấp</h2>
            <p className="mt-1 text-xs text-gray-400">Các SKU cần nhập bổ sung hoặc kiểm tra lại trạng thái bán.</p>
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f7f8f9] text-left text-[10px] uppercase tracking-[.12em] text-gray-400">
                <th className="px-5 py-3">SKU</th><th className="px-5 py-3">Sản phẩm</th><th className="px-5 py-3 text-right">Tồn kho</th>
              </tr></thead>
              <tbody>
                {lowStock.map(v => (
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
            {lowStock.map(v => (
              <div key={v.sku} className="p-4">
                <p className="font-mono text-[11px] font-black text-primary">{v.sku}</p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="line-clamp-2 text-sm font-bold text-sole-dark">{v.products?.name}</p>
                  <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-black text-primary">Còn {v.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
