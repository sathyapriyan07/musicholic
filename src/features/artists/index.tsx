import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'

import { ARTIST_PLATFORM_CONFIG } from '@/types'
import type { Artist, Song, Album, ArtistLink } from '@/types'
import { PageShell, PageContent } from '@/shared/layout'
import { SectionTitle, BodyText } from '@/shared/typography'
import { FadeInView } from '@/shared/motion'
import CinematicCard from '@/shared/ui/CinematicCard'
import LoadingSpinner from '@/shared/ui/LoadingSpinner'


const platformConfig = ARTIST_PLATFORM_CONFIG

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [artistLinks, setArtistLinks] = useState<ArtistLink[]>([])
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)




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

  return (
    <PageShell>
      <PageContent>
        {/* Artist hero */}
        <div className="relative w-full aspect-video overflow-hidden">
          {artist.image ? (
            <img src={artist.image} alt={artist.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--am-surface-2)' }}>
              <svg viewBox="0 0 24 24" className="w-16 h-16" style={{ fill: 'var(--am-text-3)' }}>
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 50%)',
          }} />
          <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-8">
            <h1 className="text-2xl lg:text-4xl font-bold tracking-tight leading-tight text-white drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>{artist.name}</h1>
            <p className="text-[14px] mt-1 text-white/70">
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
              {albums.length > 0 && ` · ${albums.length} ${albums.length === 1 ? 'album' : 'albums'}`}
            </p>
          </div>
        </div>

        {/* Section content */}
        <div className="px-5 lg:px-8 pt-8 pb-12 space-y-12">
          {artist.bio && (
            <BodyText muted className="whitespace-pre-line max-w-3xl">{artist.bio}</BodyText>
          )}

          {songs.length > 0 && (
            <div>
              <SectionTitle className="mb-5">Songs</SectionTitle>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {songs.map((song, i) => (
                  <div key={song.id} className="flex-shrink-0 w-40">
                    <CinematicCard
                      to={`/song/${song.id}`}
                      image={song.cover}
                      title={song.title}
                      subtitle={song.artists?.map(a => a.name).join(', ')}
                      index={i}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {albums.length > 0 && (
            <div>
              <SectionTitle className="mb-5">Albums</SectionTitle>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {albums.map((album, i) => (
                  <div key={album.id} className="flex-shrink-0 w-40">
                    <CinematicCard
                      to={`/album/${album.id}`}
                      image={album.cover}
                      title={album.title}
                      subtitle={album.artist?.name}
                      index={i}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {artistLinks.length > 0 && (
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

        {/* Related Artists */}
        {relatedArtists.length > 0 && (
          <FadeInView>
            <section className="px-5 lg:px-8 pb-20 lg:pb-24">
              <SectionTitle className="mb-6">Related Artists</SectionTitle>
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
      </PageContent>
    </PageShell>
  )
}
