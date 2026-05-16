import { cn } from '@/shared/lib/cn'

interface EditorialHeadingProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}

export default function EditorialHeading({ children, className, as: Tag = 'h2' }: EditorialHeadingProps) {
  return (
    <Tag
      className={cn(
        'text-[28px] lg:text-[42px] font-bold tracking-tight leading-[1.1]',
        className
      )}
      style={{ color: 'var(--am-text)' }}
    >
      {children}
    </Tag>
  )
}
