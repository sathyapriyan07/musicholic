import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import CinematicCard from '@/components/ui/CinematicCard'
import FadeInView from '@/components/motion/FadeInView'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Song, Artist, Album } from '@/types'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [input, setInput] = useState(query)
  const inputRef = useRef<HTMLInputElement>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(false)
  const [bgCovers, setBgCovers] = useState<string[]>([])

  useEffect(() => {
    setInput(query)
  }, [query])

  useEffect(() => {
    if (!query.trim()) {
      fetchSongsWithArtists({ limit: 20 }).then((allSongs) => {
        const covers = allSongs
          .map((s) => s.cover)
          .filter((c): c is string => !!c)
        setBgCovers(covers)
      })
    }
  }, [query])

  useEffect(() => {
    async function search() {
      if (!query.trim()) {
        setSongs([])
        setArtists([])
        setAlbums([])
        return
      }
      setLoading(true)
      try {
        const songsData = await fetchSongsWithArtists({
          filter: (q: any) => q.ilike('title', `%${query}%`).limit(20),
        })
        const [artistsRes, albumsRes] = await Promise.all([
          supabase.from('artists').select('*').ilike('name', `%${query}%`).limit(15),
          supabase.from('albums').select('*, artist:artists(id, name, image)').ilike('title', `%${query}%`).limit(15),
        ])
        setSongs(songsData)
        if (artistsRes.data) setArtists(artistsRes.data as unknown as Artist[])
        if (albumsRes.data) setAlbums(albumsRes.data as unknown as Album[])
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }

    const timeout = setTimeout(search, 300)
    return () => clearTimeout(timeout)
  }, [query])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim()) {
      setSearchParams({ q: input.trim() })
    }
  }

  if (!query) {
    return (
      <div className="relative h-screen overflow-hidden">
        {/* Collage Background */}
        {bgCovers.length > 0 && (
          <div className="absolute inset-0 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1 overflow-hidden">
            {bgCovers.slice(0, 24).map((cover, i) => (
              <div
                key={i}
                className="relative overflow-hidden"
                style={{ aspectRatio: i % 3 === 0 ? '2/3' : '1' }}
              >
                <img
                  src={cover}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
        {/* Dark overlays */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.95) 100%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,10,0.4) 100%)',
        }} />

        {/* Content */}
        <FadeInView>
          <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'rgba(252,60,68,0.15)', backdropFilter: 'blur(12px)' }}>
              <Search className="w-7 h-7" style={{ color: 'var(--am-accent)' }} />
            </div>
            <h1 className="editorial-title mb-6 text-glow">Search</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--am-text-3)' }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Search songs, artists, albums..."
                  className="w-full h-12 pl-12 pr-4 rounded-full text-[15px] outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--am-accent)]"
                  style={{ background: 'rgba(28,28,30,0.8)', backdropFilter: 'blur(12px)', color: 'var(--am-text)', border: '1px solid var(--am-border)' }}
                />
              </div>
            </form>
            <p className="text-[13px] mt-6" style={{ color: 'var(--am-text-2)' }}>
              {bgCovers.length} songs in your library
            </p>
          </div>
        </FadeInView>
      </div>
    )
  }

  if (loading) return <LoadingSpinner />

  const totalResults = songs.length + artists.length + albums.length

  return (
    <div className="py-8 pb-20 lg:pb-24">
      <FadeInView>
        <div className="px-5 lg:px-8 mb-8">
          <form onSubmit={handleSubmit} className="w-full max-w-md mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--am-text-3)' }} />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search songs, artists, albums..."
                className="w-full h-12 pl-12 pr-4 rounded-full text-[15px] outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--am-accent)]"
                style={{ background: 'var(--am-surface-2)', color: 'var(--am-text)' }}
              />
            </div>
          </form>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="editorial-title"
          >
            Results for{' '}
            <span style={{ color: 'var(--am-accent)' }}>"{query}"</span>
          </motion.h1>
          {totalResults > 0 && (
            <p className="text-[13px] mt-2" style={{ color: 'var(--am-text-2)' }}>
              {totalResults} result{totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </FadeInView>

      {totalResults === 0 && (
        <FadeInView>
          <div className="text-center py-20 px-6">
            <p className="text-lg font-semibold mb-1">No results found</p>
            <p className="text-[14px]" style={{ color: 'var(--am-text-2)' }}>Try different keywords</p>
          </div>
        </FadeInView>
      )}

      {artists.length > 0 && (
        <FadeInView>
          <section className="px-5 lg:px-8 mb-10">
            <h2 className="text-[22px] lg:text-[28px] font-bold tracking-tight mb-4">Artists</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {artists.map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.03 }}
                  className="flex-shrink-0 w-28 group"
                >
                  <a href={`/artist/${artist.id}`} className="block">
                    <div className="w-28 h-28 rounded-full overflow-hidden mb-2" style={{ background: 'var(--am-surface-2)' }}>
                      {artist.image ? (
                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-8 h-8" style={{ fill: 'var(--am-text-3)' }}>
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-[13px] font-semibold truncate text-center">{artist.name}</p>
                  </a>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeInView>
      )}

      {albums.length > 0 && (
        <FadeInView>
          <section className="px-5 lg:px-8 mb-10">
            <h2 className="text-[22px] lg:text-[28px] font-bold tracking-tight mb-4">Albums</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {albums.map((album, i) => (
                <CinematicCard
                  key={album.id}
                  to={`/album/${album.id}`}
                  image={album.cover}
                  title={album.title}
                  subtitle={album.artist?.name}
                  index={i}
                />
              ))}
            </div>
          </section>
        </FadeInView>
      )}

      {songs.length > 0 && (
        <FadeInView>
          <section className="px-5 lg:px-8">
            <h2 className="text-[22px] lg:text-[28px] font-bold tracking-tight mb-4">Songs</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {songs.map((song, i) => (
                <CinematicCard
                  key={song.id}
                  to={`/song/${song.id}`}
                  image={song.cover}
                  title={song.title}
                  subtitle={song.artists?.map(a => a.name).join(', ')}
                  index={i}
                />
              ))}
            </div>
          </section>
        </FadeInView>
      )}
    </div>
  )
}
