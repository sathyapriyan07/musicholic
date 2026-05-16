import { cn } from '@/shared/lib/cn'

interface CinematicDescriptionProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'text-[13px] lg:text-[14px]',
  md: 'text-[14px] lg:text-[16px]',
  lg: 'text-[16px] lg:text-[18px]',
}

export default function CinematicDescription({ children, className, size = 'md' }: CinematicDescriptionProps) {
  return (
    <p
      className={cn('leading-relaxed max-w-2xl', sizeStyles[size], className)}
      style={{ color: 'var(--am-text-2)' }}
    >
      {children}
    </p>
  )
}
