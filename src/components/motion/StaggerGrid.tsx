import { motion } from 'framer-motion'

interface StaggerGridProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export default function StaggerGrid({ children, className = '', staggerDelay = 0.05 }: StaggerGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  }

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
  }

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  )
}
