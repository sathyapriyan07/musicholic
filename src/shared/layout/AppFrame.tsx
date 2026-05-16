import { cn } from '@/shared/lib/cn'

interface AppFrameProps {
  children: React.ReactNode
  className?: string
}

export default function AppFrame({ children, className }: AppFrameProps) {
  return (
    <div className={cn('relative min-h-screen overflow-x-hidden', className)} style={{ background: 'var(--am-bg)' }}>
      {children}
    </div>
  )
}
