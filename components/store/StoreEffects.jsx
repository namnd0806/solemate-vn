'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function StoreEffects() {
  const pathname = usePathname()

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach(element => element.classList.add('is-visible'))
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

    const observeRevealElements = root => {
      if (root instanceof Element && root.matches('[data-reveal]')) observer.observe(root)
      root.querySelectorAll?.('[data-reveal]').forEach(element => observer.observe(element))
    }

    observeRevealElements(document)

    // Product and account screens render their content after client-side data loads.
    // Observe newly inserted reveal elements so they cannot remain permanently hidden.
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) observeRevealElements(node)
        })
      })
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutationObserver.disconnect()
      observer.disconnect()
    }
  }, [pathname])

  return null
}
