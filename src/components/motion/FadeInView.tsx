import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface FadeInViewProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  distance?: number
  once?: boolean
  threshold?: number
}

export default function FadeInView({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.6,
  distance = 40,
  once = true,
  threshold = 0.1,
}: FadeInViewProps) {
  const [ref, inView] = useInView({ triggerOnce: once, threshold })

  const getInitial = () => {
    switch (direction) {
      case 'up': return { opacity: 0, y: distance }
      case 'down': return { opacity: 0, y: -distance }
      case 'left': return { opacity: 0, x: distance }
      case 'right': return { opacity: 0, x: -distance }
      case 'none': return { opacity: 0 }
    }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitial()}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : getInitial()}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
