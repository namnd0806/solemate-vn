'use client'

import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  if (!visible) return null

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-sole-dark',
  }

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg text-sm max-w-sm ${colors[type] || colors.info}`}
    >
      <span className="flex-1">{message}</span>
      <button onClick={() => { setVisible(false); onClose?.() }} aria-label="Đóng" className="text-white/70 hover:text-white">✕</button>
    </div>
  )
}
