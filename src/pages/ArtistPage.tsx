import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import CinematicCard from '@/components/ui/CinematicCard'
import FadeInView from '@/components/motion/FadeInView'
import StaggerGrid, { StaggerItem } from '@/components/motion/StaggerGrid'
import ArtistConnections from '@/components/artist/ArtistConnections'
import { useArtistCollaborators } from '@/components/artist/useCollaborators'
import type { Artist, Song, Album, ArtistLink } from '@/types'
import { ARTIST_PLATFORM_CONFIG } from '@/types'

const platformConfig = ARTIST_PLATFORM_CONFIG

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [artistLinks, setArtistLinks] = useState<ArtistLink[]>([])
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleSongs, setVisibleSongs] = useState(12)
  const [bioExpanded, setBioExpanded] = useState(false)
  const bioRef = useRef<HTMLParagraphElement>(null)
  const collaborators = useArtistCollaborators(id)

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      setLoading(true)
      const { data: artistData } = await supabase.from('artists').select('*').eq('id', id).single()
      const songsData = await fetchSongsWithArtists({
        filter: (q: any) => q.contains('artist_ids', [id]).order('created_at', { ascending: false }),
      })
      const { data: albumsData } = await supabase
        .from('albums')
        .select('*, artist:artists(id, name, image)')
        .eq('artist_id', id)
        .order('created_at', { ascending: false })
      const { data: linksData } = await supabase
        .from('artist_links')
        .select('*')
        .eq('artist_id', id)

      if (artistData) setArtist(artistData as unknown as Artist)
      setSongs(songsData)
      if (albumsData) setAlbums(albumsData as unknown as Album[])
      if (linksData) setArtistLinks(linksData as unknown as ArtistLink[])

      if (id) {
        const { data: songArtistsData } = await supabase
          .from('song_artists')
          .select('song_id')
          .eq('artist_id', id)

        if (songArtistsData && songArtistsData.length > 0) {
          const songIds = songArtistsData.map((sa: any) => sa.song_id)

          const { data: relatedData } = await supabase
            .from('song_artists')
            .select('artist_id, artist:artists(id, name, image)')
            .in('song_id', songIds)
            .neq('artist_id', id)

          if (relatedData) {
            const artistMap = new Map<string, Artist>()
            relatedData.forEach((item: any) => {
              if (item.artist && !artistMap.has(item.artist.id)) {
                artistMap.set(item.artist.id, item.artist as Artist)
              }
            })
            setRelatedArtists(Array.from(artistMap.values()))
          }
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!artist) return <div className="px-6 py-20 text-center" style={{ color: 'var(--am-text-2)' }}>Artist not found</div>

  const hasImages = songs.filter(s => s.cover).slice(0, 9)

  return (
    <div>
      {/* Cinematic Hero */}
      <div className="relative h-[60vh] lg:h-[70vh] overflow-hidden">
        {artist.image ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${artist.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'var(--am-surface-2)' }} />
        )}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 40%, var(--am-bg) 100%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, rgba(252,60,68,0.06) 0%, transparent 60%)',
        }} />

        <FadeInView className="relative z-10 h-full flex items-end">
          <div className="px-5 lg:px-8 pb-10 lg:pb-20 w-full">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-title mb-3"
            >
              {artist.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[16px] lg:text-[18px]"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
              {albums.length > 0 && ` · ${albums.length} ${albums.length === 1 ? 'album' : 'albums'}`}
            </motion.p>
          </div>
        </FadeInView>
      </div>

      {/* Bio */}
      {artist.bio && (
        <FadeInView>
          <div className="px-5 lg:px-8 pt-2 pb-8 max-w-3xl">
            <p
              ref={bioRef}
              className={`text-[15px] leading-relaxed ${!bioExpanded ? 'line-clamp-2' : ''}`}
              style={{ color: 'var(--am-text-2)' }}
            >
              {artist.bio}
            </p>
            {artist.bio.length > 150 && (
              <button
                onClick={() => setBioExpanded(!bioExpanded)}
                className="mt-2 text-[13px] font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--am-accent)' }}
              >
                {bioExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </FadeInView>
      )}

      {/* Links */}
      {artistLinks.length > 0 && (
        <FadeInView>
          <div className="px-5 lg:px-8 pb-6 flex flex-wrap gap-3">
            {artistLinks.map((link) => {
              const config = platformConfig[link.platform as keyof typeof platformConfig]
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold transition-all hover:scale-105"
                  style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
                >
                  {config?.logo && (
                    <img src={config.logo} alt={config.name} className="w-4 h-4 object-contain" />
                  )}
                  <span style={{ color: 'var(--am-text-2)' }}>{config?.name || link.platform}</span>
                </a>
              )
            })}
          </div>
        </FadeInView>
      )}

      {/* Creative Universe */}
      <ArtistConnections collaborators={collaborators} />

      {/* Visual Journey - ScrollTiltedGrid */}
      {hasImages.length >= 3 && (
        <FadeInView>
          <div className="mb-12">
            <h2 className="text-[22px] lg:text-[28px] font-bold tracking-tight px-5 lg:px-8 mb-4">
              Visual Journey
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 px-5 lg:px-8 scrollbar-hide">
              {hasImages.map((song) => (
                <motion.div
                  key={song.id}
                  className="flex-shrink-0 w-40 h-40 rounded-2xl overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={song.cover!} alt={song.title} className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInView>
      )}

      {/* Songs */}
      {songs.length > 0 && (
        <FadeInView>
          <div className="px-5 lg:px-8 mb-12">
            <h2 className="text-[22px] lg:text-[28px] font-bold tracking-tight mb-6">Songs</h2>
            <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
              {songs.slice(0, visibleSongs).map((song, i) => (
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
            {visibleSongs < songs.length && (
              <div className="flex justify-center mt-8">
                <motion.button
                  onClick={() => setVisibleSongs((prev) => prev + 12)}
                  className="px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all hover:opacity-90"
                  style={{ background: 'var(--am-accent)', color: '#fff' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View More
                </motion.button>
              </div>
            )}
          </div>
        </FadeInView>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <FadeInView>
          <section className="px-5 lg:px-8 mb-12">
            <h2 className="text-[22px] lg:text-[28px] font-bold tracking-tight mb-6">Albums</h2>
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

      {/* Related Artists */}
      {relatedArtists.length > 0 && (
        <FadeInView>
          <section className="px-5 lg:px-8 pb-20 lg:pb-24">
            <h2 className="text-[22px] lg:text-[28px] font-bold tracking-tight mb-6">Related Artists</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {relatedArtists.slice(0, 10).map((related, i) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="flex-shrink-0 w-32 group"
                >
                  <Link to={`/artist/${related.id}`} className="block">
                    <motion.div
                      className="w-32 h-32 rounded-full overflow-hidden mb-2"
                      style={{ background: 'var(--am-surface-2)' }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      {related.image ? (
                        <img src={related.image} alt={related.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: 'var(--am-text-3)' }}>
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </motion.div>
                    <p className="text-[13px] font-semibold truncate text-center">{related.name}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeInView>
      )}

      {songs.length === 0 && albums.length === 0 && (
        <p className="text-center py-20 text-[14px]" style={{ color: 'var(--am-text-2)' }}>No content yet</p>
      )}
    </div>
  )
}
