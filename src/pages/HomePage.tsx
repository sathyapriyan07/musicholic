import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import CinematicHero from '@/components/cinematic/CinematicHero'
import CinematicCard from '@/components/ui/CinematicCard'
import EditorialDiscovery from '@/components/editorial/EditorialDiscovery'
import FadeInView from '@/components/motion/FadeInView'
import StaggerGrid, { StaggerItem } from '@/components/motion/StaggerGrid'
import { extractYouTubeId } from '@/lib/utils'
import type { Song, Artist, Album } from '@/types'

export default function HomePage() {
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [heroIndex] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
         const [featuredRes, recentRes, artistsRes, albumsRes] = await Promise.all([
          fetchSongsWithArtists({
            order: { column: 'created_at' },
            limit: 20,
            filter: (q) => q.eq('featured', true),
          }),
          fetchSongsWithArtists({ order: { column: 'created_at' }, limit: 20 }),
          supabase.from('artists').select('*').order('created_at', { ascending: false }).limit(12),
          supabase.from('albums').select('*, artist:artists(id, name, image)').order('created_at', { ascending: false }).limit(12),
        ])

        if (featuredRes.length) setFeaturedSongs(featuredRes)
        if (recentRes.length) setRecentSongs(recentRes)
        if (artistsRes.data) setArtists(artistsRes.data as unknown as Artist[])
        if (albumsRes.data) setAlbums(albumsRes.data as unknown as Album[])
      } catch (err) {
        console.error('Error fetching home data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const heroSongs = featuredSongs.filter(s => s.youtube_embed_url)

  if (loading) return <LoadingSpinner />

  const isEmpty = featuredSongs.length === 0 && artists.length === 0 && albums.length === 0

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'var(--am-surface-2)' }}>
          <svg viewBox="0 0 24 24" className="w-8 h-8" style={{ fill: 'var(--am-text-3)' }}>
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <p className="text-lg font-semibold mb-1">No music yet</p>
        <p className="text-[14px]" style={{ color: 'var(--am-text-2)' }}>Visit the admin panel to add songs, artists and albums</p>
      </div>
    )
  }

  return (
    <div>
      {/* Fullscreen Cinematic Hero */}
      {heroSongs.length > 0 && (
        <CinematicHero
          key={heroIndex}
          videoId={extractYouTubeId(heroSongs[heroIndex].youtube_embed_url) || ''}
          title={heroSongs[heroIndex].title}
          subtitle={heroSongs[heroIndex].artists?.map(a => a.name).join(', ') || ''}
          linkTo={`/song/${heroSongs[heroIndex].id}`}
        />
      )}

      {/* Editorial Intro */}
      <FadeInView delay={0.2}>
        <div className="px-5 lg:px-8 py-10 lg:py-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: 'var(--am-accent)' }}
          >
            Editorial
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="editorial-title mb-4"
          >
            Discover Music
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[16px] lg:text-[18px] max-w-xl"
            style={{ color: 'var(--am-text-2)' }}
          >
            A cinematic journey through sound, emotion, and storytelling
          </motion.p>
        </div>
      </FadeInView>

      {/* Featured Grid - Cinematic Stagger */}
      {featuredSongs.length > 0 && (
        <FadeInView delay={0.3}>
          <div className="px-5 lg:px-8 mb-10 lg:mb-12">
            <h2 className="text-[18px] lg:text-[28px] font-bold tracking-tight mb-4 lg:mb-6">Featured</h2>
            <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 lg:gap-4">
              {featuredSongs.slice(0, 10).map((song) => (
                <StaggerItem key={song.id} className="w-full min-w-0">
                  <CinematicCard
                    to={`/song/${song.id}`}
                    image={song.cover}
                    title={song.title}
                    subtitle={song.artists?.map(a => a.name).join(', ')}
                    badge="Featured"
                    size="lg"
                    fluid
                  />
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </FadeInView>
      )}

      {/* Visual Discovery Section */}
      <EditorialDiscovery />

      {/* Artists Spotlight */}
      {artists.length > 0 && (
        <FadeInView>
          <section className="px-5 lg:px-8 mb-12 lg:mb-24">
            <h2 className="text-[18px] lg:text-[28px] font-bold tracking-tight mb-4 lg:mb-6">Artists</h2>
            <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {artists.map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="flex-shrink-0 w-20 sm:w-28 lg:w-32 group"
                >
                  <a href={`/artist/${artist.id}`} className="block">
                    <motion.div
                      className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden mb-2 lg:mb-3"
                      style={{ background: 'var(--am-surface-2)' }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      {artist.image ? (
                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: 'var(--am-text-3)' }}>
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
          </section>
        </FadeInView>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <FadeInView>
          <section className="px-5 lg:px-8 mb-12 lg:mb-24">
            <h2 className="text-[18px] lg:text-[28px] font-bold tracking-tight mb-4 lg:mb-6">New Releases</h2>
            <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 scrollbar-hide">
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

      {/* Recently Added */}
      {recentSongs.length > 0 && (
        <FadeInView>
          <section className="px-5 lg:px-8 pb-16 lg:pb-24">
            <h2 className="text-[18px] lg:text-[28px] font-bold tracking-tight mb-4 lg:mb-6">Recently Added</h2>
            <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {recentSongs.slice(0, 15).map((song, i) => (
                <CinematicCard
                  key={song.id}
                  to={`/song/${song.id}`}
                  image={song.cover}
                  title={song.title}
                  subtitle={song.artists?.map(a => a.name).join(', ')}
                  size="sm"
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
