import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import type { Song, Artist, Album } from '@/types'
import { PageShell, PageBackdrop, PageContent, AmbientGradient } from '@/shared/layout'
import { DisplayTitle, BodyText, SectionTitle } from '@/shared/typography'
import { FadeInView, FloatingMotion } from '@/shared/motion'
import { GlowCard } from '@/shared/surfaces'
import CinematicCard from '@/shared/ui/CinematicCard'
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
      <PageShell>
        <PageContent>
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
            <GlowCard className="w-16 h-16 flex items-center justify-center mb-5">
              <svg viewBox="0 0 24 24" className="w-8 h-8" style={{ fill: 'var(--am-text-3)' }}>
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </GlowCard>
            <p className="text-lg font-semibold mb-1">No music yet</p>
            <BodyText muted>Visit the admin panel to add songs, artists and albums</BodyText>
          </div>
        </PageContent>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageBackdrop
        image={featuredSongs[0]?.cover}
        gradient="linear-gradient(180deg, transparent 0%, var(--am-bg) 100%)"
      />
      <AmbientGradient />
      <PageContent>
        {/* Cinematic Hero Section */}
        <section className="relative min-h-[70vh] lg:min-h-[80vh] flex items-end pb-16 lg:pb-24">
          <div className="absolute inset-0 overflow-hidden">
            {featuredSongs[0]?.cover && (
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url(${featuredSongs[0].cover})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(40px)',
                  transform: 'scale(1.1)',
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 40%, var(--am-bg) 100%)',
            }} />
          </div>

          <div className="relative z-10 px-5 lg:px-8 max-w-5xl">
            <FadeInView direction="up" delay={0.2}>
              <motion.p
                className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: 'var(--am-accent)' }}
              >
                Editorial
              </motion.p>
            </FadeInView>

            <FadeInView direction="up" delay={0.3}>
              <DisplayTitle className="mb-4">
                Discover Music
              </DisplayTitle>
            </FadeInView>

            <FadeInView direction="up" delay={0.4}>
              <BodyText muted size="lg" className="max-w-xl mb-8">
                A cinematic journey through sound, emotion, and storytelling
              </BodyText>
            </FadeInView>

            <FadeInView direction="up" delay={0.5}>
              <motion.button
                className="px-8 py-3 rounded-full text-[14px] font-semibold text-white"
                style={{ background: 'var(--am-accent)' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Explore Featured
              </motion.button>
            </FadeInView>
          </div>

          {/* Floating decorative elements */}
          <FloatingMotion className="absolute top-20 right-10 lg:right-20 opacity-20 hidden lg:block" amplitude={10} duration={5}>
            <div className="w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(252,60,68,0.2), transparent 70%)' }} />
          </FloatingMotion>
          <FloatingMotion className="absolute top-40 right-40 opacity-10 hidden lg:block" amplitude={8} duration={6} delay={1}>
            <div className="w-20 h-20 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)' }} />
          </FloatingMotion>
        </section>

        {/* Featured Grid */}
        {featuredSongs.length > 0 && (
          <section className="px-5 lg:px-8 mb-12 lg:mb-16">
            <FadeInView>
              <SectionTitle className="mb-6">Featured</SectionTitle>
            </FadeInView>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
              {featuredSongs.slice(0, 10).map((song, i) => (
                <FadeInView key={song.id} delay={i * 0.05}>
                  <CinematicCard
                    to={`/song/${song.id}`}
                    image={song.cover}
                    title={song.title}
                    subtitle={song.artists?.map(a => a.name).join(', ')}
                    badge="Featured"
                    size="lg"
                    fluid
                  />
                </FadeInView>
              ))}
            </div>
          </section>
        )}

        {/* Visual Discovery */}
        <EditorialDiscovery />

        {/* Artists Spotlight */}
        {artists.length > 0 && (
          <section className="px-5 lg:px-8 mb-12 lg:mb-24">
            <FadeInView>
              <SectionTitle className="mb-6">Artists</SectionTitle>
            </FadeInView>
            <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {artists.map((artist, i) => (
                <FadeInView key={artist.id} delay={i * 0.03} className="flex-shrink-0 w-20 sm:w-28 lg:w-32 group">
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
                </FadeInView>
              ))}
            </div>
          </section>
        )}

        {/* Albums - New Releases */}
        {albums.length > 0 && (
          <section className="px-5 lg:px-8 mb-12 lg:mb-24">
            <FadeInView>
              <SectionTitle className="mb-6">New Releases</SectionTitle>
            </FadeInView>
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
        )}

        {/* Recently Added */}
        {recentSongs.length > 0 && (
          <section className="px-5 lg:px-8 pb-16 lg:pb-24">
            <FadeInView>
              <SectionTitle className="mb-6">Recently Added</SectionTitle>
            </FadeInView>
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
        )}
      </PageContent>
    </PageShell>
  )
}
