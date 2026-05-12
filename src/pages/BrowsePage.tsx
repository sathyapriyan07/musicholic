import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import CinematicCard from '@/components/ui/CinematicCard'
import FadeInView from '@/components/motion/FadeInView'
import StaggerGrid, { StaggerItem } from '@/components/motion/StaggerGrid'
import type { Song, Artist, Album } from '@/types'
import { cn } from '@/lib/utils'

type Tab = 'songs' | 'artists' | 'albums'

const MOOD_CATEGORIES = [
  { label: 'All', key: 'songs' as Tab },
  { label: 'Artists', key: 'artists' as Tab },
  { label: 'Albums', key: 'albums' as Tab },
]

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<Tab>('songs')
  const [songs, setSongs] = useState<Song[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const songsData = await fetchSongsWithArtists({ order: { column: 'created_at' } })
        const [artistsRes, albumsRes] = await Promise.all([
          supabase.from('artists').select('*').order('name', { ascending: true }),
          supabase.from('albums').select('*, artist:artists(id, name, image)').order('created_at', { ascending: false }),
        ])
        setSongs(songsData)
        if (artistsRes.data) setArtists(artistsRes.data as unknown as Artist[])
        if (albumsRes.data) setAlbums(albumsRes.data as unknown as Album[])
      } catch (err) {
        console.error('Browse error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingSpinner />

  const emptyMsg = { songs: 'No songs yet', artists: 'No artists yet', albums: 'No albums yet' }

  return (
    <div className="py-8 pb-20 lg:pb-24">
      {/* Editorial Header */}
      <FadeInView>
        <div className="px-5 lg:px-8 mb-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: 'var(--am-accent)' }}
          >
            Discover
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="editorial-title"
          >
            Browse
          </motion.h1>
        </div>
      </FadeInView>

      {/* Cinematic Category Pills */}
      <FadeInView delay={0.2}>
        <div className="flex gap-2 mb-8 px-5 lg:px-8 overflow-x-auto scrollbar-hide">
          {MOOD_CATEGORIES.map((cat) => (
            <motion.button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={cn(
                'px-5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all',
                activeTab === cat.key
                  ? 'text-white'
                  : 'text-[var(--am-text-2)] hover:text-white'
              )}
              style={activeTab === cat.key ? { background: 'var(--am-accent)' } : { background: 'var(--am-surface-2)' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </FadeInView>

      {/* Content Grids */}
      <div className="px-5 lg:px-8">
        {activeTab === 'songs' && songs.length > 0 && (
          <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {songs.map((song, i) => (
              <StaggerItem key={song.id}>
                <CinematicCard
                  to={`/song/${song.id}`}
                  image={song.cover}
                  title={song.title}
                  subtitle={song.artists?.map(a => a.name).join(', ')}
                  index={i}
                />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}

        {activeTab === 'artists' && artists.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 lg:gap-5">
            {artists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="group"
              >
                <a href={`/artist/${artist.id}`} className="block">
                  <motion.div
                    className="w-full aspect-square rounded-full overflow-hidden mb-2.5"
                    style={{ background: 'var(--am-surface-2)' }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {artist.image ? (
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-1/3 h-1/3" style={{ fill: 'var(--am-text-3)' }}>
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                  <p className="text-[13px] font-semibold truncate text-center">{artist.name}</p>
                </a>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'albums' && albums.length > 0 && (
          <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {albums.map((album, i) => (
              <StaggerItem key={album.id}>
                <CinematicCard
                  to={`/album/${album.id}`}
                  image={album.cover}
                  title={album.title}
                  subtitle={album.artist?.name}
                  index={i}
                />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}

        {((activeTab === 'songs' && songs.length === 0) ||
          (activeTab === 'artists' && artists.length === 0) ||
          (activeTab === 'albums' && albums.length === 0)) && (
          <p className="text-center py-16 text-[14px]" style={{ color: 'var(--am-text-2)' }}>
            {emptyMsg[activeTab]}
          </p>
        )}
      </div>
    </div>
  )
}
