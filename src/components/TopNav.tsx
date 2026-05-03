import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Search, User, X, Music2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Listen Now', href: '/' },
  { label: 'Browse', href: '/browse' },
  { label: 'Library', href: '/playlists' },
]

export default function TopNav() {
  const [query, setQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (location.pathname.startsWith('/search')) {
      const params = new URLSearchParams(location.search)
      setQuery(params.get('q') || '')
    } else {
      setQuery('')
    }
  }, [location])

  useEffect(() => {
    if (mobileSearchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [mobileSearchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-[52px]"
        style={{ background: 'var(--am-nav-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--am-border)' }}>
        <div className="flex items-center h-full px-4 gap-3 max-w-[1800px] mx-auto">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--am-accent)' }}>
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight hidden sm:block">Musicholic</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-white bg-white/10'
                    : 'text-[var(--am-text-2)] hover:text-white hover:bg-white/5'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--am-text-3)]" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full text-[13px] rounded-full pl-9 pr-4 py-1.5 focus:outline-none transition-all placeholder-[var(--am-text-3)]"
                style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
              />
            </div>
          </form>

          <div className="flex-1 lg:flex-none" />

          {/* Mobile search toggle */}
          <button
            className="md:hidden p-1.5 rounded-full text-[var(--am-text-2)] hover:text-white transition-colors"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User menu */}
          {user ? (
            <div className="relative group flex-shrink-0">
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold text-white transition-opacity hover:opacity-80"
                style={{ background: 'var(--am-accent)' }}
              >
                {user.email?.[0].toUpperCase()}
              </button>
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
                style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
              >
                <p className="px-4 py-2 text-[11px] uppercase tracking-wider text-[var(--am-text-3)] font-medium">{user.email}</p>
                <div style={{ borderTop: '1px solid var(--am-divider)' }} />
                <button onClick={() => navigate('/playlists')} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-white/5 transition-colors">
                  Your Library
                </button>
                <button onClick={() => navigate('/admin')} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-white/5 transition-colors">
                  Admin Panel
                </button>
                <div style={{ borderTop: '1px solid var(--am-divider)' }} />
                <button
                  onClick={async () => { await signOut(); navigate('/') }}
                  className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-white/5 transition-colors text-[var(--am-text-2)]"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex-shrink-0 flex items-center gap-1.5 text-white text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-colors hover:opacity-90"
              style={{ background: 'var(--am-accent)' }}
            >
              <User className="w-3.5 h-3.5" />
              Sign in
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded-full text-[var(--am-text-2)] hover:text-white transition-colors ml-1"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2]">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[70] md:hidden flex items-start pt-2 px-3"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
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
            <button type="button" onClick={() => setMobileSearchOpen(false)}
              className="px-3 text-[var(--am-text-2)] text-sm font-medium">
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 p-5 overflow-y-auto"
            style={{ background: 'var(--am-surface)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--am-accent)' }}>
                  <Music2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-[15px] font-semibold">Musicholic</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-[var(--am-text-2)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {[
                { label: 'Listen Now', href: '/' },
                { label: 'Browse', href: '/browse' },
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
          </div>
        </div>
      )}
    </>
  )
}
