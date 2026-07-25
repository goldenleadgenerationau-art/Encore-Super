export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-copper-400/40 bg-copper-400/10 px-2.5 py-0.5 text-xs font-medium tracking-wide text-copper-300">
      Premium
    </span>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-plum-700 bg-plum-900/60 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] ${className}`}
    >
      {children}
    </div>
  )
}
