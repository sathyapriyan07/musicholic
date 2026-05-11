import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface CinematicCardProps {
  to: string
  image?: string | null
  title: string
  subtitle?: string
  badge?: string
  aspectRatio?: 'square' | 'portrait' | 'landscape'
  size?: 'sm' | 'md' | 'lg'
  index?: number
  fluid?: boolean
}

const sizeMap = {
  sm: { card: 'w-28 sm:w-36', img: 'aspect-square' },
  md: { card: 'w-36 sm:w-44', img: 'aspect-square' },
  lg: { card: 'w-40 sm:w-52', img: 'aspect-[3/4]' },
}

export default function CinematicCard({
  to,
  image,
  title,
  subtitle,
  badge,
  aspectRatio = 'square',
  size = 'md',
  index = 0,
  fluid,
}: CinematicCardProps) {
  const s = sizeMap[size]
  const ratioClass = aspectRatio === 'portrait' ? 'aspect-[3/4]' : aspectRatio === 'landscape' ? 'aspect-[4/3]' : 'aspect-square'
  const widthClass = fluid ? 'w-full min-w-0' : s.card

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className={`${widthClass} flex-shrink-0 group`}
    >
      <Link to={to} className="block">
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          style={{ background: 'var(--am-surface-2)' }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {image ? (
            <img
              src={image}
              alt={title}
              className={`w-full ${ratioClass} object-cover`}
              loading="lazy"
            />
          ) : (
            <div className={`w-full ${ratioClass} flex items-center justify-center`}>
              <svg viewBox="0 0 24 24" className="w-1/3 h-1/3" style={{ fill: 'var(--am-text-3)' }}>
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}

          {/* Hover glow */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: 'inset 0 0 30px rgba(252,60,68,0.15)' }}
          />

          {badge && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: 'var(--am-accent)' }}
            >
              {badge}
            </div>
          )}
        </motion.div>
        <div className="mt-2.5 px-1">
          <p className="text-[13px] font-semibold truncate leading-tight">{title}</p>
          {subtitle && (
            <p className="text-[12px] mt-0.5 truncate leading-tight" style={{ color: 'var(--am-text-2)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
