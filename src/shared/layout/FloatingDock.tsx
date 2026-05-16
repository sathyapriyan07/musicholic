'use client'

import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

interface DockItem {
  id: string
  icon: React.ReactNode
  label: string
  onClick: () => void
  isActive?: boolean
}

interface FloatingDockProps {
  items: DockItem[]
  className?: string
}

export default function FloatingDock({ items, className }: FloatingDockProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-1 px-2 py-1.5',
        'rounded-full',
        className
      )}
      style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          className={cn(
            'relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300',
            item.isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
          )}
        >
          {item.isActive && (
            <motion.div
              layoutId="dock-active"
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(252,60,68,0.2)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 w-5 h-5 flex items-center justify-center">
            {item.icon}
          </span>
        </button>
      ))}
    </motion.div>
  )
}
