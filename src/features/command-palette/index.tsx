import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Music2, Disc3, User, Compass, Command, ArrowRight } from 'lucide-react'
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut'
import { supabase } from '@/lib/supabase'

interface SearchItem {
  id: string
  title?: string
  name?: string
  cover?: string | null
  image?: string | null
}

interface Result {
  type: 'song' | 'artist' | 'album'
  id: string
  label: string
  sublabel?: string
  image?: string | null
  href: string
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useKeyboardShortcut('k', () => setOpen(true))

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const [songsRes, artistsRes, albumsRes] = await Promise.all([
          supabase.from('songs').select('id, title, cover').ilike('title', `%${query}%`).limit(5) as any,
          supabase.from('artists').select('id, name, image').ilike('name', `%${query}%`).limit(5) as any,
          supabase.from('albums').select('id, title, cover').ilike('title', `%${query}%`).limit(5) as any,
        ])

        const items: Result[] = [
          ...(songsRes.data || []).map((s: SearchItem) => ({
            type: 'song' as const, id: s.id, label: s.title || '', image: s.cover, href: `/song/${s.id}`,
          })),
          ...(artistsRes.data || []).map((a: SearchItem) => ({
            type: 'artist' as const, id: a.id, label: a.name || '', image: a.image, href: `/artist/${a.id}`,
          })),
          ...(albumsRes.data || []).map((a: SearchItem) => ({
            type: 'album' as const, id: a.id, label: a.title || '', image: a.cover, href: `/album/${a.id}`,
          })),
        ]
        setResults(items)
        setSelectedIndex(0)
      } catch { /* ignore */ }
      setLoading(false)
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  const handleSelect = useCallback((result: Result) => {
    setOpen(false)
    navigate(result.href)
  }, [navigate])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--am-divider)' }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--am-text-3)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search songs, artists, albums..."
                className="flex-1 text-[15px] bg-transparent outline-none placeholder-[var(--am-text-3)]"
                style={{ color: 'var(--am-text)' }}
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
                style={{ background: 'var(--am-surface-2)', color: 'var(--am-text-3)' }}>
                <Command className="w-3 h-3" />
                K
              </kbd>
            </div>

            <div className="max-h-[360px] overflow-y-auto py-2">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin"
                    style={{ borderTopColor: 'var(--am-accent)' }} />
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--am-text-2)' }}>No results found</p>
                  <p className="text-[12px]" style={{ color: 'var(--am-text-3)' }}>Try different keywords</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div>
                  {results.map((result, i) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 transition-colors group"
                      style={{
                        background: i === selectedIndex ? 'var(--am-surface-2)' : 'transparent',
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--am-surface-3)' }}>
                        {result.image ? (
                          <img src={result.image} alt="" className="w-full h-full rounded-lg object-cover" />
                        ) : result.type === 'song' ? (
                          <Music2 className="w-4 h-4" style={{ color: 'var(--am-text-3)' }} />
                        ) : result.type === 'artist' ? (
                          <User className="w-4 h-4" style={{ color: 'var(--am-text-3)' }} />
                        ) : (
                          <Disc3 className="w-4 h-4" style={{ color: 'var(--am-text-3)' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium truncate">{result.label}</p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--am-text-3)' }}>{result.type}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: 'var(--am-text-3)', opacity: i === selectedIndex ? 1 : 0 }} />
                    </button>
                  ))}
                </div>
              )}

              {!query && (
                <div className="px-4 py-8 text-center">
                  <Compass className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--am-text-3)' }} />
                  <p className="text-[13px]" style={{ color: 'var(--am-text-2)' }}>
                    Start typing to search across songs, artists, and albums
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 px-4 py-2.5" style={{ borderTop: '1px solid var(--am-divider)', background: 'var(--am-surface-2)' }}>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--am-surface-3)', color: 'var(--am-text-3)' }}>↑↓</kbd>
                <span className="text-[11px]" style={{ color: 'var(--am-text-3)' }}>Navigate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--am-surface-3)', color: 'var(--am-text-3)' }}>↵</kbd>
                <span className="text-[11px]" style={{ color: 'var(--am-text-3)' }}>Open</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--am-surface-3)', color: 'var(--am-text-3)' }}>Esc</kbd>
                <span className="text-[11px]" style={{ color: 'var(--am-text-3)' }}>Close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
