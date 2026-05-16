import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { Home, Compass, Library, Search, Disc3 } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { icon: Home, label: 'Listen Now', href: '/' },
  { icon: Compass, label: 'Browse', href: '/browse' },
  { icon: Disc3, label: 'Albums', href: '/albums' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: Library, label: 'Library', href: '/playlists' },
]

export default function BottomNav() {
  const location = useLocation()

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden flex justify-center pb-2 pointer-events-none">
      <motion.div
        className="flex items-center justify-around px-3 py-1 rounded-2xl pointer-events-auto"
        style={{
          background: 'var(--am-glass-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--am-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center justify-center gap-0.5 px-4 py-2 transition-colors relative"
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(252,60,68,0.1)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                className={cn('w-[20px] h-[20px] relative z-10 transition-colors', active && 'stroke-none')}
                style={{
                  color: active ? 'var(--am-accent)' : 'var(--am-text-3)',
                  fill: active ? 'var(--am-accent)' : 'none',
                }}
              />
              <span
                className="text-[8px] font-semibold tracking-wide relative z-10"
                style={{ color: active ? 'var(--am-accent)' : 'var(--am-text-3)' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </motion.div>
    </nav>
  )
}
