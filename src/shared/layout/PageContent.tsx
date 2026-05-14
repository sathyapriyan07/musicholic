import { cn } from '@/shared/lib/cn'

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

export default function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn('relative z-10', className)}>
      {children}
    </div>
  )
}
