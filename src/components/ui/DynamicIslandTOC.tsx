import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List } from 'lucide-react'

interface TOCItem {
  id: string
  label: string
}

interface DynamicIslandTOCProps {
  items: TOCItem[]
}

export default function DynamicIslandTOC({ items }: DynamicIslandTOCProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || '')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIsOpen(false)
    }
  }

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <motion.div
        className="relative"
        onHoverStart={() => setIsOpen(true)}
        onHoverEnd={() => setIsOpen(false)}
      >
        <motion.button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <List className="w-4 h-4" style={{ color: 'var(--am-text-2)' }} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-14 top-1/2 -translate-y-1/2 py-2 px-1 rounded-2xl min-w-[180px]"
              style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
            >
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="block w-full text-left px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
                  style={{
                    color: activeId === item.id ? '#fff' : 'var(--am-text-2)',
                    background: activeId === item.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
