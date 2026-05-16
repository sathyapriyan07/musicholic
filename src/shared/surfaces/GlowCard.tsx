import { cn } from '@/shared/lib/cn'

interface GlowCardProps {
  children: React.ReactNode
  className?: string
}

export default function GlowCard({ children, className }: GlowCardProps) {
  return (
    <div
      className={cn('rounded-2xl relative', className)}
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
