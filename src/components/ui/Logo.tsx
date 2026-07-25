export function Logo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Encore Super"
      className={className}
    >
      <rect x="18" y="80" width="13" height="24" rx="2" fill="var(--color-plum-400)" />
      <rect x="38" y="65" width="13" height="39" rx="2" fill="var(--color-copper-500)" />
      <rect x="58" y="48" width="13" height="56" rx="2" fill="var(--color-copper-400)" />
      <rect x="78" y="30" width="13" height="74" rx="2" fill="var(--color-copper-300)" />
      <rect x="98" y="14" width="13" height="90" rx="2" fill="var(--color-plum-200)" />
    </svg>
  )
}
