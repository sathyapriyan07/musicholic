import { cn } from '@/shared/lib/cn'
import { motion } from 'framer-motion'

interface FloatingMetadataProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
}

export default function FloatingMetadata({ children, className, animate = true }: FloatingMetadataProps) {
  const content = (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider',
        className
      )}
      style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: 'rgba(255,255,255,0.8)',
      }}
    >
      {children}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {content}
      </motion.div>
    )
  }

  return content
}
