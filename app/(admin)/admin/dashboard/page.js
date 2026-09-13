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
  const pending = orders.filter(o => ['PENDING', 'CONFIRMED'].includes(o.status)).length

  const statusBreakdown = { PENDING: 0, CONFIRMED: 0, SHIPPING: 0, DELIVERED: 0, CANCELLED: 0 }
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

const STATUS_VN = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy' }

export default async function DashboardPage() {
  const { revenue, pending, statusBreakdown, days, lowStock } = await getDashboardData()
  const maxRevenue = Math.max(...days.map(d => d.revenue), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sole-dark">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng doanh thu', value: formatVND(revenue), icon: '💰' },
          { label: 'Đơn chờ xử lý', value: pending, icon: '⏳' },
          { label: 'Sản phẩm tồn kho thấp', value: lowStock.length, icon: '⚠️' },
          { label: 'Tổng đơn hàng', value: Object.values(statusBreakdown).reduce((a, b) => a + b, 0), icon: '📦' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl mb-2">{card.icon}</p>
            <p className="text-2xl font-bold text-sole-dark">{card.value}</p>
            <p className="text-sm text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 7-day chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-sole-dark mb-4">Doanh thu 7 ngày qua</h2>
          <div className="flex items-end gap-2 h-32">
            {days.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary rounded-t-sm min-h-[4px] transition-all"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  title={formatVND(d.revenue)}
                />
                <span className="text-xs text-gray-400">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-sole-dark mb-4">Trạng thái đơn hàng</h2>
          <div className="space-y-2">
            {Object.entries(statusBreakdown).map(([s, count]) => (
              <div key={s} className="flex justify-between text-sm">
                <span className="text-gray-600">{STATUS_VN[s]}</span>
                <span className="font-semibold text-sole-dark">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-sole-dark mb-4">⚠️ Tồn kho thấp</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-400">
                <th className="pb-2">SKU</th><th className="pb-2">Sản phẩm</th><th className="pb-2 text-right">Tồn kho</th>
              </tr></thead>
              <tbody>
                {lowStock.map(v => (
                  <tr key={v.sku} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{v.sku}</td>
                    <td className="py-2 text-gray-600">{v.products?.name}</td>
                    <td className="py-2 text-right font-bold text-red-600">{v.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
