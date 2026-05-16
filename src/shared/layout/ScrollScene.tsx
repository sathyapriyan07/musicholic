'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

interface ScrollSceneProps {
  children: React.ReactNode
  className?: string
  translateY?: [number, number]
  scale?: [number, number]
  opacity?: [number, number]
  blur?: [number, number]
}

export default function ScrollScene({
  children,
  className,
  translateY = [0, 100],
  scale = [1, 0.95],
  opacity = [1, 0.8],
  blur: blurRange,
}: ScrollSceneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], translateY)
  const s = useTransform(scrollYProgress, [0, 1], scale)
  const o = useTransform(scrollYProgress, [0, 1], opacity)

  return (
    <div ref={ref} className={cn('relative', className)}>
      <motion.div
        style={{
          y,
          scale: s,
          opacity: o,
          filter: blurRange ? `blur(${scrollYProgress.get() * blurRange[1]}px)` : undefined,
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
