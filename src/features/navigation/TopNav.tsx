import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Search, User, X, Music2, Sun, Moon, Menu } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/shared/lib/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollHide } from '@/shared/hooks/useScrollHide'

const navLinks = [
  { label: 'Listen Now', href: '/' },
  { label: 'Browse', href: '/browse' },
  { label: 'Albums', href: '/albums' },
  { label: 'Library', href: '/playlists' },
]

export default function TopNav() {
  const [query, setQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const searchRef = useRef<HTMLInputElement>(null)
  const navVisible = useScrollHide(80)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (location.pathname.startsWith('/search')) {
      const params = new URLSearchParams(location.search)
      setQuery(params.get('q') || '')
    } else {
      setQuery('')
    }
  }, [location])

  useEffect(() => {
    if (mobileSearchOpen && searchRef.current) searchRef.current.focus()
  }, [mobileSearchOpen])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setMobileSearchOpen(false)
    }
  }, [query, navigate])

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: navVisible ? 0 : -80 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50 h-[52px] transition-colors duration-300"
        style={{
          background: scrolled ? 'var(--am-glass-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--am-border)' : '1px solid transparent',
        }}
      >
        <div className="flex items-center h-full px-4 gap-3 max-w-[1800px] mx-auto">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-1">
            <motion.div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--am-accent)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Music2 className="w-4 h-4 text-white" />
            </motion.div>
            <span
              className="text-lg font-bold tracking-tight hidden sm:block"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Musicholic
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'relative px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-white'
                    : 'text-[var(--am-text-2)] hover:text-white hover:bg-white/5'
                )}
              >
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
          </nav>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--am-text-3)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full text-[13px] rounded-full pl-9 pr-4 py-1.5 focus:outline-none transition-all placeholder-[var(--am-text-3)]"
                style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--am-accent)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--am-border)' }}
              />
            </div>
          </form>

          <div className="flex-1 lg:flex-none" />

          <button
            className="md:hidden p-1.5 rounded-full text-[var(--am-text-2)] hover:text-white transition-colors"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <motion.button
            onClick={toggleTheme}
            className="p-1.5 rounded-full text-[var(--am-text-2)] hover:text-white transition-colors"
            aria-label="Toggle theme"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>

          {user ? (
            <div className="relative group flex-shrink-0">
              <motion.button
                className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold text-white"
                style={{ background: 'var(--am-accent)' }}
                whileHover={{ scale: 1.05 }}
              >
                {user.email?.[0].toUpperCase()}
              </motion.button>
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                  style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
                >
                  <p className="px-4 py-2 text-[11px] uppercase tracking-wider text-[var(--am-text-3)] font-medium">{user.email}</p>
                  <div style={{ borderTop: '1px solid var(--am-divider)' }} />
                  <button
                    onClick={() => navigate('/playlists')}
                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-white/5 transition-colors"
                  >
                    Your Library
                  </button>
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-white/5 transition-colors"
                  >
                    Admin Panel
                  </button>
                  <div style={{ borderTop: '1px solid var(--am-divider)' }} />
                  <button
                    onClick={async () => { await signOut(); navigate('/') }}
                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-white/5 transition-colors text-[var(--am-text-2)]"
                  >
                    Sign out
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              onClick={() => navigate('/login')}
              className="flex-shrink-0 flex items-center gap-1.5 text-white text-[13px] font-medium px-3.5 py-1.5 rounded-full"
              style={{ background: 'var(--am-accent)' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <User className="w-3.5 h-3.5" />
              Sign in
            </motion.button>
          )}

          <motion.button
            className="lg:hidden p-1.5 rounded-full text-[var(--am-text-2)] hover:text-white transition-colors ml-1"
            onClick={() => setMobileMenuOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] md:hidden flex items-start pt-2 px-3"
            style={{ background: 'var(--am-overlay)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setMobileSearchOpen(false) }}
          >
            <form onSubmit={handleSearch} className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--am-text-3)]" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Songs, artists, albums"
                  className="w-full text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none"
                  style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
                />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="px-3 text-[var(--am-text-2)] text-sm font-medium"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-72 p-5 overflow-y-auto"
              style={{ background: 'var(--am-glass-bg)', backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--am-accent)' }}>
                    <Music2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>Musicholic</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-[var(--am-text-2)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {[
                  { label: 'Listen Now', href: '/' },
                  { label: 'Browse', href: '/browse' },
                  { label: 'Albums', href: '/albums' },
                  { label: 'Search', href: '/search' },
                  { label: 'Library', href: '/playlists' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block px-4 py-2.5 text-[15px] font-medium rounded-xl transition-colors',
                      isActive(item.href)
                        ? 'text-white bg-white/8'
                        : 'text-[var(--am-text-2)] hover:text-white hover:bg-white/5'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--am-divider)', margin: '8px 0' }} />
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-[15px] font-medium rounded-xl text-[var(--am-text-2)] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Admin Panel
                </Link>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
