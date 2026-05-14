import { cn } from '@/shared/lib/cn'

interface SectionTitleProps {
  children: React.ReactNode
  className?: string
  as?: 'h2' | 'h3' | 'h4'
}

export default function SectionTitle({ children, className, as: Tag = 'h2' }: SectionTitleProps) {
  return (
    <Tag className={cn('text-[22px] lg:text-[28px] font-bold tracking-tight', className)}>
      {children}
    </Tag>
  )
}
