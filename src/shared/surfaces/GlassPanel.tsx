import { cn } from '@/shared/lib/cn'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section' | 'article'
  hover?: boolean
}

export default function GlassPanel({ children, className, as: Tag = 'div', hover }: GlassPanelProps) {
  return (
    <Tag
      className={cn(
        'glass-panel rounded-2xl transition-all duration-300',
        hover && 'hover:bg-white/[0.08]',
        className
      )}
    >
      {children}
    </Tag>
  )
}
