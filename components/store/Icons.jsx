const base = {
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function SearchIcon({ className = 'size-5' }) {
  return <svg {...base} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
}

export function CartIcon({ className = 'size-5' }) {
  return <svg {...base} className={className}><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 8H6" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>
}

export function HeartIcon({ className = 'size-5', filled = false }) {
  return <svg {...base} className={className} fill={filled ? 'currentColor' : 'none'}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
}

export function ArrowRightIcon({ className = 'size-4' }) {
  return <svg {...base} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
}

export function MenuIcon({ className = 'size-6' }) {
  return <svg {...base} className={className}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
}

export function CloseIcon({ className = 'size-6' }) {
  return <svg {...base} className={className}><path d="m6 6 12 12M18 6 6 18" /></svg>
}

export function UserIcon({ className = 'size-5' }) {
  return <svg {...base} className={className}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>
}

export function ChevronDownIcon({ className = 'size-4' }) {
  return <svg {...base} className={className}><path d="m6 9 6 6 6-6" /></svg>
}

export function TruckIcon({ className = 'size-6' }) {
  return <svg {...base} className={className}><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>
}

export function ShieldIcon({ className = 'size-6' }) {
  return <svg {...base} className={className}><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
}

export function RefreshIcon({ className = 'size-6' }) {
  return <svg {...base} className={className}><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.1 8a7 7 0 0 1 11.8-2L20 8M4 16l2.1 2a7 7 0 0 0 11.8-2" /></svg>
}

export function MailIcon({ className = 'size-4' }) {
  return <svg {...base} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
}

export function PhoneIcon({ className = 'size-4' }) {
  return <svg {...base} className={className}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c1 .4 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" /></svg>
}

export function PinIcon({ className = 'size-4' }) {
  return <svg {...base} className={className}><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
}

export function InstagramIcon({ className = 'size-5' }) {
  return <svg {...base} className={className}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>
}

export function FacebookIcon({ className = 'size-5' }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v2H6v4h3v7h4v-7h3.2l.8-4h-4V9c0-.7.3-1 1-1Z" /></svg>
}

export function YoutubeIcon({ className = 'size-5' }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M22 12c0-2.1-.2-4.1-.5-5.1a2.7 2.7 0 0 0-1.9-1.9C18 4.5 12 4.5 12 4.5S6 4.5 4.4 5a2.7 2.7 0 0 0-1.9 1.9C2.2 7.9 2 9.9 2 12s.2 4.1.5 5.1A2.7 2.7 0 0 0 4.4 19c1.6.5 7.6.5 7.6.5s6 0 7.6-.5a2.7 2.7 0 0 0 1.9-1.9c.3-1 .5-3 .5-5.1Zm-12 3.2V8.8l5.5 3.2-5.5 3.2Z" /></svg>
}

export function SparkIcon({ className = 'size-5' }) {
  return <svg {...base} className={className}><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" /></svg>
}

export function BoxIcon({ className = 'size-5' }) {
  return <svg {...base} className={className}><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></svg>
}

export function CheckIcon({ className = 'size-5' }) {
  return <svg {...base} className={className}><path d="m5 12 4 4L19 6" /></svg>
}

export function ClockIcon({ className = 'size-5' }) {
  return <svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
}
