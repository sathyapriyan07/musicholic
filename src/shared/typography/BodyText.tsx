import { cn } from '@/shared/lib/cn'

interface BodyTextProps {
  children: React.ReactNode
  muted?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function BodyText({ children, muted, size = 'md', className }: BodyTextProps) {
  const sizeClasses = { sm: 'text-[13px]', md: 'text-[14px]', lg: 'text-[15px]' }
  return (
    <p className={cn(sizeClasses[size], className)} style={{ color: muted ? 'var(--am-text-2)' : 'var(--am-text)' }}>
      {children}
    </p>
  )
}
