import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search as SearchIcon, Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [query, setQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (location.pathname.startsWith('/search')) {
      const params = new URLSearchParams(location.search)
      setQuery(params.get('q') || '')
    }
  }, [location])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="flex items-center gap-4 px-4 lg:px-8 py-3">
        <button
          className="lg:hidden p-2 text-zinc-400 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, albums..."
              className="w-full bg-zinc-800 text-white text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-zinc-500"
            />
          </div>
        </form>

        <div className="relative">
          {user ? (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 bg-zinc-800 rounded-full p-1 pr-3 hover:bg-zinc-700 transition-colors"
            >
              <div className="w-7 h-7 bg-zinc-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium hidden sm:block">{user.email?.split('@')[0]}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-black text-sm font-bold px-6 py-2 rounded-full hover:scale-105 transition-transform"
            >
              Sign Up
            </button>
          )}

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 rounded-md shadow-xl py-1 z-50">
              <button
                onClick={() => { setUserMenuOpen(false); navigate('/playlists') }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700"
              >
                My Playlists
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 flex items-center gap-2 text-red-400"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-900 border-t border-zinc-800 px-4 py-4 space-y-2">
          <a href="/" className="block py-2 text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="/search" className="block py-2 text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Search</a>
          <a href="/browse" className="block py-2 text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Browse</a>
          <a href="/playlists" className="block py-2 text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Playlists</a>
          <a href="/admin" className="block py-2 text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Admin</a>
        </div>
      )}
    </header>
  )
}
