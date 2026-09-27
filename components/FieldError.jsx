'use client'

export default function FieldError({ id, children }) {
  if (!children) return null

  return (
    <p
      id={`${id}-error`}
      role="alert"
      data-testid={`${id}-error`}
      className="mt-1.5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold leading-5 text-red-600"
    >
      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-red-500 text-[10px] text-white">!</span>
      <span>{children}</span>
    </p>
  )
}
