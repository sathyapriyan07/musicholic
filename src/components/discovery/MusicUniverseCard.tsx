import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

interface MusicUniverseCardProps {
  title: string
  subtitle?: string
  cover?: string | null
  metadata?: string
  themeColor?: string
  href: string
}

export default function MusicUniverseCard({
  title,
  subtitle,
  cover,
  metadata,
  themeColor = '0 0% 30%',
  href,
}: MusicUniverseCardProps) {
  return (
    <Link to={href} className="block group">
      <motion.div
        className="relative overflow-hidden rounded-3xl cursor-pointer"
        style={{ background: 'var(--am-surface-2)' }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Cover image */}
        <div className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden">
          {cover ? (
            <motion.img
              src={cover}
              alt={title}
              className="w-full h-full object-cover transform-gpu will-change-transform"
              style={{ transformOrigin: 'center' }}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--am-surface-2)' }}>
              <svg viewBox="0 0 24 24" className="w-12 h-12" style={{ fill: 'var(--am-text-3)' }}>
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}

          {/* Gradient overlays */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)`,
            }}
          />

          {/* Ambient hover glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              background: `radial-gradient(ellipse at center, hsl(${themeColor} / 0.2) 0%, transparent 70%)`,
            }}
          />

          {/* Top-right arrow on hover */}
          <motion.div
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            initial={{ opacity: 0, y: -10 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
          </motion.div>

          {/* Bottom metadata */}
          <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
            <p className="text-[17px] lg:text-[21px] font-bold leading-tight mb-1 text-white">{title}</p>
            {subtitle && (
              <p className="text-[13px] lg:text-[14px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {subtitle}
              </p>
            )}
            {metadata && (
              <p className="text-[11px] lg:text-[12px] font-medium mt-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {metadata}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
