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
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden flex justify-center pb-3 pointer-events-none">
      <motion.div
        className="flex items-center justify-around px-2 py-1 rounded-full pointer-events-auto"
        style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.1 }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 transition-colors relative"
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-active-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(252,60,68,0.15)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={cn('w-[18px] h-[18px] relative z-10 transition-all duration-300', active && 'stroke-none')}
                style={{
                  color: active ? 'var(--am-accent)' : 'rgba(255,255,255,0.3)',
                  fill: active ? 'var(--am-accent)' : 'none',
                }}
              />
              <span
                className="text-[7px] font-semibold tracking-wider relative z-10"
                style={{ color: active ? 'var(--am-accent)' : 'rgba(255,255,255,0.3)' }}
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
