import { motion } from 'framer-motion'

interface FloatingMotionProps {
  children: React.ReactNode
  className?: string
  amplitude?: number
  duration?: number
  delay?: number
}

export default function FloatingMotion({
  children,
  className = '',
  amplitude = 6,
  duration = 4,
  delay = 0,
}: FloatingMotionProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -amplitude, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
