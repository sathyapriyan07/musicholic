'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

interface EditorialCardProps {
  to: string
  image?: string | null
  title: string
  subtitle?: string
  badge?: string
  className?: string
  aspectRatio?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-36',
  md: 'w-44',
  lg: 'w-56',
}

export default function EditorialCard({ to, image, title, subtitle, badge, className, aspectRatio = 'aspect-[3/4]', size = 'md' }: EditorialCardProps) {
  return (
    <Link to={to} className={cn('group flex-shrink-0 snap-rail-item', sizeClasses[size], className)}>
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn('relative overflow-hidden rounded-2xl', aspectRatio)}
        style={{ background: 'var(--am-surface-2)' }}
      >
        {image && (
          <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        )}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 50%)',
        }} />
        {badge && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded-full text-[9px] font-semibold uppercase tracking-wider" style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              color: 'rgba(255,255,255,0.9)',
            }}>
              {badge}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[13px] font-semibold text-white truncate drop-shadow-lg">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-white/60 truncate mt-0.5 drop-shadow-lg">{subtitle}</p>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
