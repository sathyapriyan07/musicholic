import { cn } from '@/shared/lib/cn'

interface GlassOverlayProps {
  children: React.ReactNode
  className?: string
  intensity?: 'light' | 'medium' | 'heavy'
  as?: 'div' | 'span'
}

const blurMap = {
  light: 'blur(12px)',
  medium: 'blur(24px)',
  heavy: 'blur(40px)',
}

const bgMap = {
  light: 'rgba(0,0,0,0.3)',
  medium: 'rgba(0,0,0,0.5)',
  heavy: 'rgba(0,0,0,0.7)',
}

export default function GlassOverlay({ children, className, intensity = 'medium', as: Tag = 'div' }: GlassOverlayProps) {
  return (
    <Tag
      className={cn('rounded-2xl', className)}
      style={{
        background: bgMap[intensity],
        backdropFilter: blurMap[intensity],
        WebkitBackdropFilter: blurMap[intensity],
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {children}
    </Tag>
  )
}
