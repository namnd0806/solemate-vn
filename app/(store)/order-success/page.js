'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRightIcon, CheckIcon, ClockIcon, ShieldIcon } from '@/components/store/Icons'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

  return (
    <main className="relative min-h-[72vh] overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(242,106,46,.13),transparent_38%),#f7f7f8] px-4 py-14 sm:py-20">
      <div className="pointer-events-none absolute left-1/2 top-24 size-80 -translate-x-1/2 rounded-full border border-primary/10" />
      <div className="relative mx-auto w-full max-w-lg rounded-[28px] border border-white/70 bg-white/95 p-7 text-center shadow-[0_30px_80px_rgba(20,23,28,.12)] backdrop-blur sm:p-10" data-reveal>
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_14px_35px_rgba(16,185,129,.3)]"><CheckIcon className="size-10" /></div>
        <p className="section-kicker justify-center">Hoàn tất đơn hàng</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-sole-dark">Đặt hàng thành công!</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">Cảm ơn bạn đã mua sắm tại <span className="font-bold text-primary">SoleMate VN</span>.</p>

        {orderId && (
          <div className="my-7 rounded-2xl border border-dashed border-primary/30 bg-primary/[.055] px-5 py-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-[.14em] text-gray-400">Mã đơn hàng</p>
            <p className="break-all font-mono text-lg font-black text-sole-dark">{orderId}</p>
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-3 text-left text-xs text-gray-500">
          <div className="rounded-2xl bg-gray-50 p-4"><ClockIcon className="mb-2 size-5 text-primary" /><strong className="block text-sole-dark">Xác nhận sớm</strong><span>Liên hệ trong 24 giờ</span></div>
          <div className="rounded-2xl bg-gray-50 p-4"><ShieldIcon className="mb-2 size-5 text-primary" /><strong className="block text-sole-dark">Đơn hàng an toàn</strong><span>Thông tin được bảo mật</span></div>
        </div>

        <div className="flex flex-col gap-3">
          {orderId && (
            <Link href={`/order/${orderId}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-bold text-white shadow-[0_10px_24px_rgba(242,106,46,.24)] transition hover:-translate-y-0.5 hover:bg-primary-deep">
              Xem chi tiết đơn hàng <ArrowRightIcon />
            </Link>
          )}
          <Link href="/track-order"
            className="block w-full rounded-full border border-gray-200 py-3.5 font-bold text-gray-600 transition hover:border-primary/30 hover:bg-primary/[.04] hover:text-primary">
            Tra cứu đơn hàng
          </Link>
          <Link href="/"
            className="block w-full py-2 text-sm font-semibold text-gray-400 transition-colors hover:text-primary">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[72vh] items-center justify-center text-gray-400">Đang tải...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
