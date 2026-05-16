'use client'

import { motion } from 'framer-motion'

interface AmbientArtworkLayerProps {
  image?: string | null
}

export default function AmbientArtworkLayer({ image }: AmbientArtworkLayerProps) {
  if (!image) return null

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1.1 }}
        transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(80px) saturate(1.5)',
          transform: 'scale(1.2)',
          opacity: 0.3,
        }}
      />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, transparent 0%, var(--am-bg) 80%)',
      }} />
    </div>
  )
}
