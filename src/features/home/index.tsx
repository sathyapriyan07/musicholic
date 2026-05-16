import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import type { Song, Artist, Album } from '@/types'
import { AppFrame, DynamicBackdrop, AmbientArtworkLayer, ContentRail } from '@/shared/layout'
import { HeroHeadline, FloatingMetadata, CinematicDescription } from '@/shared/typography'
import { FadeInView } from '@/shared/motion'
import EditorialCard from '@/shared/ui/EditorialCard'
import HeroPoster from '@/shared/ui/HeroPoster'
import GlassMediaCard from '@/shared/ui/GlassMediaCard'
import ImmersiveRailCard from '@/shared/ui/ImmersiveRailCard'
import LoadingSpinner from '@/shared/ui/LoadingSpinner'
import EditorialDiscovery from '@/features/discovery/EditorialDiscovery'

export default function HomePage() {
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return <LoadingSpinner />

  const isEmpty = featuredSongs.length === 0 && artists.length === 0 && albums.length === 0

  if (isEmpty) {
    return (
      <AppFrame>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <svg viewBox="0 0 24 24" className="w-8 h-8" style={{ fill: 'var(--am-text-3)' }}>
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-1" style={{ color: 'var(--am-text)' }}>No music yet</p>
          <p style={{ color: 'var(--am-text-2)' }}>Visit the admin panel to add songs, artists and albums</p>
        </div>
      </AppFrame>
    )
  }

  return (
    <AppFrame>
      <DynamicBackdrop image={featuredSongs[0]?.cover} blur={80} />
      <AmbientArtworkLayer image={featuredSongs[0]?.cover} />

      {/* Cinematic Hero Stage */}
      <section className="relative z-10 min-h-[85vh] lg:min-h-[90vh] flex items-end pb-20 lg:pb-32 px-5 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {featuredSongs[0]?.cover && (
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${featuredSongs[0].cover})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(60px) saturate(1.5)',
                transform: 'scale(1.2)',
                opacity: 0.25,
              }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 40%, var(--am-bg) 100%)',
          }} />
        </div>

        <div className="relative z-10 max-w-5xl">
          <FadeInView direction="up" delay={0.1}>
            <FloatingMetadata className="mb-6">
              <span>Editorial</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>Featured Story</span>
            </FloatingMetadata>
          </FadeInView>

          <FadeInView direction="up" delay={0.2}>
            <HeroHeadline className="mb-4 text-white">
              Discover<br />Music
            </HeroHeadline>
          </FadeInView>

          <FadeInView direction="up" delay={0.35}>
            <CinematicDescription size="lg" className="mb-10 max-w-xl">
              A cinematic journey through sound, emotion, and storytelling
            </CinematicDescription>
          </FadeInView>

          <FadeInView direction="up" delay={0.5}>
            <motion.button
              className="px-8 py-3.5 rounded-full text-[14px] font-semibold text-white"
              style={{ background: 'var(--am-accent)' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Featured
            </motion.button>
          </FadeInView>
        </div>

        {/* Floating decorative accents */}
        <motion.div
          className="absolute top-32 right-10 lg:right-20 w-64 h-64 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-full h-full rounded-full" style={{
            background: 'radial-gradient(circle, rgba(252,60,68,0.08), transparent 70%)',
          }} />
        </motion.div>
      </section>

      {/* Featured Rail */}
      {featuredSongs.length > 0 && (
        <section className="relative z-10 mb-16">
          <ContentRail title="Featured" titleClassName="text-white/90">
            {featuredSongs.slice(0, 10).map((song) => (
              <EditorialCard
                key={song.id}
                to={`/song/${song.id}`}
                image={song.cover}
                title={song.title}
                subtitle={song.artists?.map(a => a.name).join(', ')}
                badge="Featured"
                size="md"
              />
            ))}
          </ContentRail>
        </section>
      )}

      {/* Visual Discovery */}
      <section className="relative z-10 mb-16">
        <EditorialDiscovery />
      </section>

      {/* Artists Spotlight */}
      {artists.length > 0 && (
        <section className="relative z-10 mb-16">
          <ContentRail title="Artists" titleClassName="text-white/90">
            {artists.map((artist) => (
              <ImmersiveRailCard
                key={artist.id}
                to={`/artist/${artist.id}`}
                image={artist.image}
                title={artist.name}
              />
            ))}
          </ContentRail>
        </section>
      )}

      {/* New Releases */}
      {albums.length > 0 && (
        <section className="relative z-10 mb-16">
          <ContentRail title="New Releases" titleClassName="text-white/90">
            {albums.map((album) => (
              <HeroPoster
                key={album.id}
                to={`/album/${album.id}`}
                image={album.cover}
                title={album.title}
                subtitle={album.artist?.name}
              />
            ))}
          </ContentRail>
        </section>
      )}

      {/* Recently Added */}
      {recentSongs.length > 0 && (
        <section className="relative z-10 pb-24">
          <ContentRail title="Recently Added" titleClassName="text-white/90">
            {recentSongs.slice(0, 15).map((song) => (
              <GlassMediaCard
                key={song.id}
                to={`/song/${song.id}`}
                image={song.cover}
                title={song.title}
                subtitle={song.artists?.map(a => a.name).join(', ')}
                size="sm"
              />
            ))}
          </ContentRail>
        </section>
      )}
    </AppFrame>
  )
}
