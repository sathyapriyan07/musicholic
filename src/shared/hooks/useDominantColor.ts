import { useState, useEffect } from 'react'

export function useDominantColor(imageUrl: string | null | undefined): string {
  const [color, setColor] = useState('rgba(252,60,68,0.06)')

  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0, 1, 1)
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
      setColor(`rgba(${r},${g},${b},0.06)`)
    }
  }, [imageUrl])

  return color
}
