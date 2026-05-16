'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

interface GlassMediaCardProps {
  to: string
  image?: string | null
  title: string
  subtitle?: string
  className?: string
  aspectRatio?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-32',
  md: 'w-40',
  lg: 'w-52',
}

export default function GlassMediaCard({ to, image, title, subtitle, className, aspectRatio = 'aspect-[3/4]', size = 'md' }: GlassMediaCardProps) {
  return (
    <Link to={to} className={cn('group flex-shrink-0 snap-rail-item', sizeClasses[size], className)}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn('relative overflow-hidden rounded-xl', aspectRatio)}
        style={{
          background: 'var(--glass-medium)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {image && (
          <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        )}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 40%)',
        }} />
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-[12px] font-semibold text-white truncate drop-shadow-md">{title}</p>
          {subtitle && (
            <p className="text-[10px] text-white/60 truncate mt-0.5 drop-shadow-md">{subtitle}</p>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
