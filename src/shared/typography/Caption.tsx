import { cn } from '@/shared/lib/cn'

interface CaptionProps {
  children: React.ReactNode
  className?: string
}

export default function Caption({ children, className }: CaptionProps) {
  return (
    <p className={cn('text-xs font-medium', className)} style={{ color: 'var(--am-text-3)' }}>
      {children}
    </p>
  )
}
