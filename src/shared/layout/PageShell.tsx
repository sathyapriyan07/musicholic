import { cn } from '@/shared/lib/cn'

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export default function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn('relative min-h-screen', className)}>
      {children}
    </div>
  )
}
