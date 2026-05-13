import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import CinematicCard from '@/components/ui/CinematicCard'
import FadeInView from '@/components/motion/FadeInView'
import StaggerGrid, { StaggerItem } from '@/components/motion/StaggerGrid'
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
  const [activeSection, setActiveSection] = useState<string>('bio')

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

  const sections = [
    { id: 'bio', label: 'Bio', disabled: !artist.bio },
    { id: 'songs', label: 'Songs', disabled: songs.length === 0 },
    { id: 'albums', label: 'Albums', disabled: albums.length === 0 },
    { id: 'links', label: 'Links', disabled: artistLinks.length === 0 },
  ]

  return (
    <div>
      {/* Header: image + name */}
      <div className="flex gap-6 lg:gap-8 px-5 lg:px-8 pt-8 lg:pt-12 pb-6">
        <div className="w-32 h-32 lg:w-44 lg:h-44 flex-shrink-0 overflow-hidden">
          {artist.image ? (
            <img
              src={artist.image}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--am-surface-2)' }}>
              <svg viewBox="0 0 24 24" className="w-12 h-12" style={{ fill: 'var(--am-text-3)' }}>
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{artist.name}</h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--am-text-2)' }}>
            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            {albums.length > 0 && ` · ${albums.length} ${albums.length === 1 ? 'album' : 'albums'}`}
          </p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 px-5 lg:px-8 pb-6 overflow-x-auto scrollbar-hide">
        {sections.map(s => (
          <button
            key={s.id}
            disabled={s.disabled}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              'relative px-4 py-2 text-[13px] font-semibold transition-colors',
              activeSection === s.id
                ? 'text-[var(--am-text)]'
                : 'text-[var(--am-text-3)] hover:text-[var(--am-text-2)]',
              s.disabled && 'opacity-30 cursor-not-allowed'
            )}
          >
            {s.label}
            {activeSection === s.id && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: 'var(--am-accent)' }} />
            )}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="px-5 lg:px-8 pb-12">
        {activeSection === 'bio' && artist.bio && (
          <div className="max-w-3xl">
            <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--am-text-2)' }}>
              {artist.bio}
            </p>
          </div>
        )}

        {activeSection === 'songs' && songs.length > 0 && (
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
        )}

        {activeSection === 'albums' && albums.length > 0 && (
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
        )}

        {activeSection === 'links' && artistLinks.length > 0 && (
          <div className="flex flex-wrap gap-3 max-w-xl">
            {artistLinks.map((link) => {
              const config = platformConfig[link.platform as keyof typeof platformConfig]
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:scale-105"
                  style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
                >
                  {config?.logo && (
                    <img src={config.logo} alt={config.name} className="w-5 h-5 object-contain" />
                  )}
                  <span style={{ color: 'var(--am-text-2)' }}>{config?.name || link.platform}</span>
                </a>
              )
            })}
          </div>
        )}
      </div>

      {activeSection === 'songs' && visibleSongs < songs.length && (
        <div className="flex justify-center pb-12">
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
    </div>
  )
}
