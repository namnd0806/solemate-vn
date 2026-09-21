'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckIcon } from './Icons'

export default function Toast({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(true)

  const close = useCallback(() => {
    setVisible(false)
    setTimeout(() => onClose?.(), 220)
  }, [onClose])

  useEffect(() => {
    const t = setTimeout(close, 3600)
    return () => clearTimeout(t)
  }, [close])

  if (!visible) return null

  const styles = {
    success: { shell: 'border-emerald-200/80', icon: 'bg-emerald-500 text-white', title: 'Thành công' },
    error: { shell: 'border-red-200/80', icon: 'bg-red-500 text-white', title: 'Có lỗi xảy ra' },
    info: { shell: 'border-gray-200', icon: 'bg-sole-dark text-white', title: 'Thông báo' },
  }
  const style = styles[type] || styles.info

  return (
    <div
      role="alert"
      className={`fixed bottom-5 left-1/2 z-[80] flex w-[min(420px,calc(100%-24px))] -translate-x-1/2 items-center gap-3 rounded-2xl border bg-white/95 p-3.5 text-sole-dark shadow-[0_22px_70px_rgba(15,18,21,.22)] backdrop-blur-xl transition duration-200 sm:bottom-7 sm:left-auto sm:right-7 sm:translate-x-0 ${style.shell} ${visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl shadow-sm ${style.icon}`}>
        {type === 'success' ? <CheckIcon className="size-5" /> : <span className="text-base font-black">{type === 'error' ? '!' : 'i'}</span>}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-[13px]">{style.title}</strong>
        <span className="mt-0.5 block text-xs leading-5 text-gray-500">{message}</span>
      </span>
      <button onClick={close} aria-label="Đóng" className="grid size-8 place-items-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-sole-dark">✕</button>
      <span className="absolute inset-x-3 bottom-0 h-0.5 origin-left animate-[toast-progress_3.6s_linear_forwards] rounded-full bg-primary" />
    </div>
  )
}
