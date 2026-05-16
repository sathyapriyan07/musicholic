import { cn } from '@/shared/lib/cn'

interface CinematicHeroLayerProps {
  children: React.ReactNode
  className?: string
  fullScreen?: boolean
  aspectRatio?: string
}

export default function CinematicHeroLayer({ children, className, fullScreen, aspectRatio }: CinematicHeroLayerProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        fullScreen ? 'min-h-screen' : aspectRatio || 'aspect-video',
        className
      )}
    >
      {children}
    </div>
  )
}
