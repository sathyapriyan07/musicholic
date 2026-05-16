import { cn } from '@/shared/lib/cn'

interface GradientTitleProps {
  children: React.ReactNode
  className?: string
  from?: string
  to?: string
}

export default function GradientTitle({ children, className, from = '#fc3c44', to = '#ff6b70' }: GradientTitleProps) {
  return (
    <h2
      className={cn('text-[28px] lg:text-[36px] font-bold tracking-tight leading-tight', className)}
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </h2>
  )
}
