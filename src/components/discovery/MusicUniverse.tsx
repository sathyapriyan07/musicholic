import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { cn } from '@/lib/utils'
import './MusicUniverse.css'

export interface MusicUniverseImage {
  src: string | null
  alt: string
  title?: string
  subtitle?: string
  year?: string
  genre?: string
  linkTo?: string
  id?: string
}

interface MusicUniverseProps {
  images: MusicUniverseImage[]
  title?: string
  subtitle?: string
  fit?: number
  segments?: number
  grayscale?: boolean
  openedImageWidth?: string
  openedImageHeight?: string
  overlayBlurColor?: string
  className?: string
  hero?: boolean
  onImageClick?: (image: MusicUniverseImage) => void
}

function extractDominantColor(imgSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 50
        canvas.height = 50
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve('#0a0a0a'); return }
        ctx.drawImage(img, 0, 0, 50, 50)
        const data = ctx.getImageData(0, 0, 50, 50).data
        let r = 0, g = 0, b = 0, count = 0
        for (let i = 0; i < data.length; i += 16) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          count++
        }
        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)
        resolve(`rgb(${r},${g},${b})`)
      } catch {
        resolve('#0a0a0a')
      }
    }
    img.onerror = () => resolve('#0a0a0a')
    img.src = imgSrc
  })
}

export default function MusicUniverse({
  images,
  title,
  subtitle,
  fit = 0.7,
  segments = 24,
  grayscale: enableGrayscale = true,
  openedImageWidth = '360px',
  openedImageHeight = '460px',
  overlayBlurColor = '#0a0a0a',
  className,
  hero = false,
  onImageClick,
}: MusicUniverseProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [dominantColors, setDominantColors] = useState<Record<number, string>>({})
  const [autoRotate, setAutoRotate] = useState(true)
  const autoRotateRef = useRef<number | null>(null)
  const rotationRef = useRef(rotation)
  const velocityRef = useRef(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const effectiveSegments = isMobile ? Math.min(segments, 12) : segments
  const displayImages = images.slice(0, effectiveSegments)
  const itemCount = displayImages.length

  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  useEffect(() => {
    displayImages.forEach((img, i) => {
      if (img.src && !dominantColors[i]) {
        extractDominantColor(img.src).then((color) => {
          setDominantColors((prev) => ({ ...prev, [i]: color }))
        })
      }
    })
  }, [displayImages])

  useEffect(() => {
    if (!autoRotate || isDragging || focusedIndex !== null) {
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current)
        autoRotateRef.current = null
      }
      return
    }
    let lastTime = performance.now()
    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000
      lastTime = time
      setRotation((prev) => prev + delta * 4)
      autoRotateRef.current = requestAnimationFrame(animate)
    }
    autoRotateRef.current = requestAnimationFrame(animate)
    return () => {
      if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current)
    }
  }, [autoRotate, isDragging, focusedIndex])

  const bind = useDrag(
    ({ movement: [mx], velocity: [vx], dragging, swipe: [swipeX] }) => {
      setIsDragging(!!dragging)
      setAutoRotate(false)
      if (dragging) {
        const sensitivity = isMobile ? 0.3 : 0.5
        setRotation((prev) => prev + mx * sensitivity * 0.1)
        velocityRef.current = vx
      } else {
        if (Math.abs(swipeX) > 0) {
          setRotation((prev) => prev + swipeX * 30)
        }
        const timeout = setTimeout(() => {
          if (!isDragging) setAutoRotate(true)
        }, 3000)
        return () => clearTimeout(timeout)
      }
    },
    { axis: 'x', preventDefault: true, pointer: { touch: true } }
  )

  const handleImageClick = useCallback(
    (index: number) => {
      if (isDragging) return
      if (focusedIndex === index) {
        setFocusedIndex(null)
        setAutoRotate(true)
      } else {
        setFocusedIndex(index)
        setAutoRotate(false)
        onImageClick?.(displayImages[index])
      }
    },
    [focusedIndex, isDragging, onImageClick, displayImages]
  )

  const handleClose = useCallback(() => {
    setFocusedIndex(null)
    setAutoRotate(true)
  }, [])

  const radius = isMobile ? Math.round(160 * fit) : Math.round(280 * fit)

  const getItemTransform = (index: number) => {
    const angle = (index / itemCount) * 360
    return `rotateY(${angle}deg) translateZ(${radius}px)`
  }

  const getItemContentTransform = (index: number) => {
    const angle = (index / itemCount) * 360
    return `rotateY(${-angle}deg)`
  }

  const focusedImage = focusedIndex !== null ? displayImages[focusedIndex] : null
  const focusedColor = focusedIndex !== null ? dominantColors[focusedIndex] : null

  if (displayImages.length === 0) return null

  return (
    <div
      className={cn(
        'music-universe',
        hero && 'music-universe--hero',
        isDragging && 'music-universe--dragging',
        className
      )}
      ref={containerRef}
    >
      {title && (
        <div className="music-universe__header">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="music-universe__label"
          >
            Explore
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="music-universe__title"
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="music-universe__subtitle"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}

      <div className="music-universe__viewport" {...bind()}>
        <div
          className="music-universe__stage"
          style={{
            transform: `rotateY(${rotation}deg)`,
            width: radius * 2,
            height: radius * 2,
            marginLeft: -radius,
            marginTop: -radius,
          }}
        >
          {displayImages.map((img, i) => {
            const isFocused = focusedIndex === i
            return (
              <div
                key={i}
                className={cn(
                  'music-universe__item',
                  isFocused && 'music-universe__item--focused',
                  enableGrayscale && !isFocused && 'music-universe__item--grayscale'
                )}
                style={{
                  transform: getItemTransform(i),
                  width: isFocused ? openedImageWidth : isMobile ? '120px' : '180px',
                  height: isFocused ? openedImageHeight : isMobile ? '120px' : '180px',
                }}
                onClick={() => handleImageClick(i)}
              >
                <div
                  className="music-universe__item-inner"
                  style={{ transform: getItemContentTransform(i) }}
                >
                  {img.src ? (
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="music-universe__item-image"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <div className="music-universe__item-placeholder">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                  )}

                  <div className="music-universe__item-overlay">
                    <div className="music-universe__item-info">
                      {img.title && (
                        <p className="music-universe__item-title">{img.title}</p>
                      )}
                      {img.subtitle && (
                        <p className="music-universe__item-subtitle">{img.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {dominantColors[i] && (
                    <div
                      className="music-universe__item-glow"
                      style={{ background: dominantColors[i] }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {focusedImage && focusedIndex !== null && (
          <motion.div
            className="music-universe__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleClose}
          >
            <motion.div
              className="music-universe__overlay-backdrop"
              style={{
                background: focusedColor
                  ? `radial-gradient(ellipse at center, ${focusedColor}22 0%, ${overlayBlurColor} 70%)`
                  : overlayBlurColor,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.button
              className="music-universe__close"
              onClick={handleClose}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>

            <motion.div
              className="music-universe__expanded"
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="music-universe__expanded-cover"
                style={
                  {
                    width: openedImageWidth,
                    height: openedImageHeight,
                    '--glow-color': focusedColor || overlayBlurColor,
                  } as React.CSSProperties
                }
              >
                {focusedImage.src ? (
                  <img
                    src={focusedImage.src}
                    alt={focusedImage.alt}
                    className="music-universe__expanded-image"
                  />
                ) : (
                  <div className="music-universe__item-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="music-universe__expanded-meta">
                {focusedImage.title && (
                  <motion.h3
                    className="music-universe__expanded-title"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {focusedImage.title}
                  </motion.h3>
                )}
                {focusedImage.subtitle && (
                  <motion.p
                    className="music-universe__expanded-artist"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    {focusedImage.subtitle}
                  </motion.p>
                )}
                <motion.div
                  className="music-universe__expanded-tags"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {focusedImage.year && (
                    <span className="music-universe__expanded-tag">{focusedImage.year}</span>
                  )}
                  {focusedImage.genre && (
                    <span className="music-universe__expanded-tag">{focusedImage.genre}</span>
                  )}
                </motion.div>
                {focusedImage.linkTo && (
                  <motion.a
                    href={focusedImage.linkTo}
                    className="music-universe__expanded-link"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Explore Album
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="music-universe__expanded-link-icon">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
