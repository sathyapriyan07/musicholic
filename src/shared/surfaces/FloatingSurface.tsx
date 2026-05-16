import { cn } from '@/shared/lib/cn'

interface FloatingSurfaceProps {
  children: React.ReactNode
  className?: string
}

export default function FloatingSurface({ children, className }: FloatingSurfaceProps) {
  return (
    <div
      className={cn('rounded-xl', className)}
      style={{
        background: 'var(--am-glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--am-border)',
      }}
    >
      {children}
    </div>
  )
}
