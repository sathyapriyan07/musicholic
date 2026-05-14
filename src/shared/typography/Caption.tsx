import { cn } from '@/shared/lib/cn'

interface CaptionProps {
  children: React.ReactNode
  className?: string
}

export default function Caption({ children, className }: CaptionProps) {
  return (
    <p className={cn('text-[12px] leading-tight', className)} style={{ color: 'var(--am-text-2)' }}>
      {children}
    </p>
  )
}
