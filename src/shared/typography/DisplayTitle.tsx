import { cn } from '@/shared/lib/cn'

interface DisplayTitleProps {
  children: React.ReactNode
  className?: string
}

export default function DisplayTitle({ children, className }: DisplayTitleProps) {
  return (
    <h1 className={cn('text-[32px] lg:text-[42px] font-bold tracking-tight leading-tight', className)}
      style={{ color: 'var(--am-text)', fontFamily: 'var(--font-display)' }}>
      {children}
    </h1>
  )
}
