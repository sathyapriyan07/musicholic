import { cn } from '@/shared/lib/cn'

interface BodyTextProps {
  children: React.ReactNode
  className?: string
  muted?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'text-[14px]',
  md: 'text-[15px] lg:text-[16px]',
  lg: 'text-[16px] lg:text-[18px]',
}

export default function BodyText({ children, className, muted, size = 'md' }: BodyTextProps) {
  return (
    <p
      className={cn(sizes[size], 'leading-relaxed', className)}
      style={{ color: muted ? 'var(--am-text-2)' : 'var(--am-text)' }}
    >
      {children}
    </p>
  )
}
