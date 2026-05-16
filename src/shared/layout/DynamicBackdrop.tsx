'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface DynamicBackdropProps {
  image?: string | null
  blur?: number
  children?: React.ReactNode
}

export default function DynamicBackdrop({ image, blur = 60, children }: DynamicBackdropProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!image) return
    const img = new Image()
    img.onload = () => setLoaded(true)
    img.src = image
  }, [image])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(${blur}px)`,
            transform: 'scale(1.1)',
          }}
        />
      )}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, var(--am-bg) 100%)',
      }} />
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
