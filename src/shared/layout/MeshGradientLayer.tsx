'use client'

import { useEffect, useRef } from 'react'

interface MeshGradientLayerProps {
  colors?: string[]
  speed?: number
}

export default function MeshGradientLayer({ colors, speed = 0.02 }: MeshGradientLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const defaultColors = [
      [252 / 255, 60 / 255, 68 / 255],
      [99 / 255, 102 / 255, 241 / 255],
      [0 / 255, 0 / 255, 0 / 255],
    ]

    const palette = colors
      ? colors.map(c => {
          const r = parseInt(c.slice(1, 3), 16) / 255
          const g = parseInt(c.slice(3, 5), 16) / 255
          const b = parseInt(c.slice(5, 7), 16) / 255
          return [r, g, b]
        })
      : defaultColors

    const animate = () => {
      timeRef.current += speed
      const t = timeRef.current

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < 3; i++) {
        const x = canvas.width * (0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t + i * 2.1)))
        const y = canvas.height * (0.2 + 0.6 * (0.5 + 0.5 * Math.cos(t * 0.7 + i * 1.8)))
        const radius = canvas.width * 0.6

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        const color = palette[i % palette.length]
        gradient.addColorStop(0, `rgba(${color[0] * 255},${color[1] * 255},${color[2] * 255},0.15)`)
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [colors, speed])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}
