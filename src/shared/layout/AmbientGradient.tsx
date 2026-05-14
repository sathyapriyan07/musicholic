import { cn } from '@/shared/lib/cn'

interface AmbientGradientProps {
  className?: string
  colors?: string[]
}

export default function AmbientGradient({ className, colors }: AmbientGradientProps) {
  const defaultGradient = 'radial-gradient(ellipse at 30% 20%, rgba(252,60,68,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(99,102,241,0.04) 0%, transparent 50%)'

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        background: colors
          ? colors.map((c, i) => `radial-gradient(ellipse at ${i === 0 ? '30% 20%' : '70% 80%'}, ${c} 0%, transparent 50%)`).join(', ')
          : defaultGradient,
      }}
    />
  )
}
