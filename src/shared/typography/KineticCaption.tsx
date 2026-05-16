import { cn } from '@/shared/lib/cn'

interface KineticCaptionProps {
  children: React.ReactNode
  className?: string
}

export default function KineticCaption({ children, className }: KineticCaptionProps) {
  return (
    <p
      className={cn('text-[11px] font-medium tracking-widest uppercase', className)}
      style={{ color: 'var(--am-text-3)' }}
    >
      {children}
    </p>
  )
}
