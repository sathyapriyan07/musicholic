import { cn } from '@/shared/lib/cn'

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  accent?: boolean
}

export default function GlowCard({ children, className, accent }: GlowCardProps) {
  return (
    <div
      className={cn('relative rounded-2xl overflow-hidden', className)}
      style={{
        background: 'var(--am-surface)',
        boxShadow: accent ? 'var(--cinematic-glow)' : undefined,
      }}
    >
      {children}
    </div>
  )
}
