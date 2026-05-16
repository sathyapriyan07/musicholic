'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

interface HeroPosterProps {
  to: string
  image?: string | null
  title: string
  subtitle?: string
  className?: string
  aspectRatio?: string
}

export default function HeroPoster({ to, image, title, subtitle, className, aspectRatio = 'aspect-[2/3]' }: HeroPosterProps) {
  return (
    <Link to={to} className={cn('group block flex-shrink-0 snap-rail-item', className)}>
      <motion.div
        whileHover={{ scale: 1.04, y: -6 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn('relative overflow-hidden rounded-2xl shadow-2xl', aspectRatio)}
        style={{ width: 'clamp(140px, 20vw, 220px)' }}
      >
        {image && (
          <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        )}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 40%)',
        }} />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[14px] font-bold text-white drop-shadow-lg truncate">{title}</p>
          {subtitle && (
            <p className="text-[12px] text-white/60 truncate mt-1 drop-shadow-lg">{subtitle}</p>
          )}
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(252,60,68,0.15) 0%, transparent 70%)',
        }} />
      </motion.div>
    </Link>
  )
}
