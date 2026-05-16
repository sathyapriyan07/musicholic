'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

interface ImmersiveRailCardProps {
  to: string
  image?: string | null
  title: string
  subtitle?: string
  className?: string
}

export default function ImmersiveRailCard({ to, image, title, subtitle, className }: ImmersiveRailCardProps) {
  return (
    <Link to={to} className={cn('group flex-shrink-0 snap-rail-item', className)}>
      <motion.div
        whileHover={{ scale: 1.05, y: -8 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden"
        style={{ background: 'var(--am-surface-2)' }}
      >
        {image && (
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        )}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 50%)',
          }}
        />
      </motion.div>
      <p className="text-[12px] font-semibold text-center mt-2 truncate max-w-[140px]" style={{ color: 'var(--am-text-2)' }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-[10px] text-center truncate max-w-[140px] -mt-0.5" style={{ color: 'var(--am-text-3)' }}>
          {subtitle}
        </p>
      )}
    </Link>
  )
}
