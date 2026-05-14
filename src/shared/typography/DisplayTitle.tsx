import { cn } from '@/shared/lib/cn'

interface DisplayTitleProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'span'
}

export default function DisplayTitle({ children, className, as: Tag = 'h1' }: DisplayTitleProps) {
  return (
    <Tag className={cn('editorial-title', className)}>
      {children}
    </Tag>
  )
}
