import { cn } from '@/shared/lib/cn'

interface HeroHeadlineProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'div'
}

export default function HeroHeadline({ children, className, as: Tag = 'h1' }: HeroHeadlineProps) {
  return (
    <Tag className={cn('hero-headline', className)}>
      {children}
    </Tag>
  )
}
