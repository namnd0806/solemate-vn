'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function StoreEffects() {
  const pathname = usePathname()

  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      elements.forEach(element => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px' }
    )

    elements.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [pathname])

  return null
}
