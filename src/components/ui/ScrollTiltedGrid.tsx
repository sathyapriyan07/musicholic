import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ScrollTiltedGridProps {
  images: { src: string; alt: string; id: string }[]
  className?: string
}

export default function ScrollTiltedGrid({ images, className = '' }: ScrollTiltedGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const rows = [
    images.slice(0, Math.ceil(images.length / 3)),
    images.slice(Math.ceil(images.length / 3), Math.ceil(2 * images.length / 3)),
    images.slice(Math.ceil(2 * images.length / 3)),
  ]

  return (
    <div ref={containerRef} className={`relative py-12 lg:py-20 overflow-hidden ${className}`}>
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.3) 50%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {rows.map((row, rowIndex) => (
        <TiltedRow key={rowIndex} images={row} rowIndex={rowIndex} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  )
}

function TiltedRow({
  images,
  rowIndex,
  scrollYProgress,
}: {
  images: { src: string; alt: string; id: string }[]
  rowIndex: number
  scrollYProgress: any
}) {
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    rowIndex % 2 === 0 ? ['-5%', '5%'] : ['5%', '-5%']
  )

  const rotate = rowIndex === 1 ? -2 : rowIndex === 2 ? 2 : 0
  const isLarge = rowIndex === 1

  return (
    <motion.div
      className="flex gap-3 lg:gap-4 px-4 lg:px-8 mb-3 lg:mb-4"
      style={{ x, rotate }}
    >
          {images.map((img) => (
        <motion.div
          key={img.id}
          className="relative flex-shrink-0 overflow-hidden rounded-xl lg:rounded-2xl"
          style={{
            width: isLarge ? 'clamp(100px, 20vw, 220px)' : 'clamp(90px, 16vw, 180px)',
            height: isLarge ? 'clamp(100px, 20vw, 220px)' : 'clamp(90px, 16vw, 180px)',
            aspectRatio: '1',
          }}
          whileHover={{ scale: 1.05, zIndex: 10 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <img
            src={img.src}
            alt={img.alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
