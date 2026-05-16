import { cn } from '@/shared/lib/cn'

interface SectionTitleProps {
  children: React.ReactNode
  className?: string
}

export default function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h2 className={cn('text-[22px] font-bold tracking-tight', className)} style={{ color: 'var(--am-text)' }}>
      {children}
    </h2>
  )
}
