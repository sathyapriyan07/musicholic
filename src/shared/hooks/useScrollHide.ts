import { useState, useEffect, useRef } from 'react'

export function useScrollHide(threshold = 50) {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const diff = currentScrollY - lastScrollY.current

      if (diff > 10 && currentScrollY > threshold) {
        setVisible(false)
      } else if (diff < -10 || currentScrollY < threshold) {
        setVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return visible
}
