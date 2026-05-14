import { cn } from '@/shared/lib/cn'

interface MetaTextProps {
  children: React.ReactNode
  className?: string
}

export default function MetaText({ children, className }: MetaTextProps) {
  return (
    <p className={cn('text-[11px] uppercase tracking-[0.15em] font-semibold', className)} style={{ color: 'var(--am-text-3)' }}>
      {children}
    </p>
  )
}
