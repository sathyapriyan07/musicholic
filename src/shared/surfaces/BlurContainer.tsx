import { cn } from '@/shared/lib/cn'

interface BlurContainerProps {
  children: React.ReactNode
  className?: string
  intensity?: 'light' | 'medium' | 'heavy'
}

const blurMap = {
  light: 'backdrop-blur-sm',
  medium: 'backdrop-blur-lg',
  heavy: 'backdrop-blur-2xl',
}

export default function BlurContainer({ children, className, intensity = 'medium' }: BlurContainerProps) {
  return (
    <div className={cn(blurMap[intensity], className)} style={{ background: 'var(--am-glass-bg)' }}>
      {children}
    </div>
  )
}
