export default function ShoeSvg({ className = 'w-24 h-24', color = '#e8642a', brand = '' }) {
  const normalizedBrand = brand.toUpperCase()
  const mark = normalizedBrand.includes('ADIDAS') ? 'stripes' : normalizedBrand.includes('NEW BALANCE') ? 'panels' : 'swoop'

  return (
    <svg className={className} viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="shoeUpper" x1="48" y1="32" x2="194" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset=".55" stopColor="#f1f2f3" />
          <stop offset="1" stopColor="#d8dade" />
        </linearGradient>
        <linearGradient id="sole" x1="31" y1="104" x2="218" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#eceeef" />
          <stop offset=".62" stopColor="#fff" />
          <stop offset="1" stopColor="#cfd2d6" />
        </linearGradient>
        <filter id="shadow" x="0" y="0" width="240" height="150" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#111827" floodOpacity=".22" />
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M28 104c12-9 23-22 32-39 7-14 17-21 32-23l28-4c15-2 27 6 34 20l7 14c5 9 14 14 27 17l26 6c9 2 14 8 13 17l-2 11H42c-16 0-24-8-21-14l7-5Z" fill="url(#shoeUpper)" />
        <path d="M73 62c12-10 28-15 47-17 13-1 23 6 29 20l7 16-35 10-62-7 14-22Z" fill={color} opacity=".13" />
        <path d="M27 104c27 8 62 11 105 9 38-2 67-7 87-15 8 4 10 10 7 18-2 5-8 9-18 10l-158 6c-19 1-29-3-31-13-1-6 2-11 8-15Z" fill="url(#sole)" stroke="#c9ccd1" strokeWidth="2" />
        <path d="M35 118c46 5 105 3 177-9" stroke="#aeb2b8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="m68 66 59-8 19 27" stroke="#c8cbd0" strokeWidth="3" />
        <path d="M77 60 69 87M91 53l-6 35M106 48l-4 39M121 46l-2 37" stroke="#c5c8cd" strokeWidth="2" />
        <path d="m75 65 53-7M72 73l61-7M69 81l68-7" stroke="#8f949b" strokeWidth="3" strokeLinecap="round" />
        <path d="M150 61c9 14 14 29 14 44" stroke="#a7abb1" strokeWidth="3" />
        <path d="M176 83c10 4 21 7 34 9" stroke={color} strokeWidth="5" strokeLinecap="round" opacity=".75" />
        {mark === 'stripes' && <g stroke="#202327" strokeWidth="7" strokeLinecap="round"><path d="m118 69-17 23" /><path d="m133 72-17 22" /><path d="m147 77-15 18" /></g>}
        {mark === 'panels' && <path d="m112 66 28 17-25 15-24-13 21-19Z" fill="#858b93" opacity=".82" />}
        {mark === 'swoop' && <path d="M88 88c27 8 51 5 74-9-17 20-44 29-83 19l9-10Z" fill="#202327" />}
        <path d="M55 89c-8 5-15 10-20 17" stroke="#b9bdc2" strokeWidth="3" />
        <path d="M55 61c8-13 18-19 31-20l18-2-5 11-27 9-17 2Z" fill="#f7f7f8" stroke="#cfd2d6" strokeWidth="2" />
      </g>
    </svg>
  )
}
