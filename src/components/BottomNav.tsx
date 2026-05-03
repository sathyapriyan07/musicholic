import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Home, Compass, Library, Search } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Listen Now', href: '/' },
  { icon: Compass, label: 'Browse', href: '/browse' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: Library, label: 'Library', href: '/playlists' },
]

export default function BottomNav() {
  const location = useLocation()

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: 'rgba(10, 10, 10, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--am-border)',
      }}
    >
      <div className="flex items-center justify-around h-[56px] max-w-sm mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                active ? 'text-[var(--am-accent)]' : 'text-[var(--am-text-3)]'
              )}
            >
              <item.icon className={cn('w-[22px] h-[22px]', active && 'fill-current stroke-none')} style={active ? { color: 'var(--am-accent)' } : {}} />
              <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
