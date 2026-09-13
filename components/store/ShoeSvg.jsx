export default function ShoeSvg({ className = 'w-24 h-24', color = '#e8642a' }) {
  return (
    <svg className={className} viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 60 Q20 30 50 28 Q70 26 90 35 L110 42 Q115 45 112 52 L108 58 Q80 65 40 65 Z" fill={color} opacity="0.15" />
      <path d="M10 60 Q20 30 50 28 Q70 26 90 35 L110 42 Q115 45 112 52 L108 58 Q80 65 40 65 Z" stroke={color} strokeWidth="2" fill="none" />
      <path d="M50 28 L55 18 Q58 14 63 16 L70 22 Q65 25 60 27 Z" fill={color} opacity="0.4" />
      <path d="M40 65 Q20 65 12 62 L10 60" stroke={color} strokeWidth="2" />
      <ellipse cx="25" cy="63" rx="4" ry="2" fill={color} opacity="0.3" />
      <ellipse cx="55" cy="29" rx="3" ry="1.5" fill={color} opacity="0.5" />
    </svg>
  )
}
