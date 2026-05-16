import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import { getYouTubeThumbnail } from '@/shared/lib/cn'
import { PageShell, PageContent } from '@/shared/layout'
import { SectionTitle, BodyText } from '@/shared/typography'
import { Play } from 'lucide-react'
import { FadeInView } from '@/shared/motion'
import LoadingSpinner from '@/shared/ui/LoadingSpinner'
import { useAlbumCollaborators } from '@/features/artists/useCollaborators'
import type { Album, Song, Artist, PlatformKey } from '@/types'
import { PLATFORM_CONFIG } from '@/types'

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>()
  const [album, setAlbum] = useState<Album | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const albumCollaborators = useAlbumCollaborators(id)


  useEffect(() => {
    async function fetchData() {
      if (!id) return
      setLoading(true)
      const { data: albumData } = await supabase.from('albums').select('*, artist:artists(*)').eq('id', id).single()
      const songsData = await fetchSongsWithArtists({
        filter: (q: any) => q.eq('album_id', id).order('created_at', { ascending: false }),
      })
      if (albumData) {
        setAlbum(albumData as unknown as Album)
        const albumObj = albumData as any
        if (albumObj.artist) setArtist(albumObj.artist as Artist)
      }
      setSongs(songsData)
      setLoading(false)
    }
    fetchData()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!album) return <div className="px-6 py-20 text-center" style={{ color: 'var(--am-text-2)' }}>Album not found</div>

  const songCovers = songs.filter(s => s.cover).map(s => s.cover!)

  return (
    <PageShell>
      <PageContent>
        {/* Album header */}
        <div className="px-5 lg:px-8 pt-8 lg:pt-12 pb-8">
          <div className="flex flex-col items-start">
            <FadeInView direction="up">
              {album.cover ? (
                <img src={album.cover} alt={album.title} className="w-48 h-48 lg:w-56 lg:h-56 object-cover shadow-2xl rounded-xl" />
              ) : (
                <div className="w-48 h-48 lg:w-56 lg:h-56 flex items-center justify-center rounded-xl" style={{ background: 'var(--am-surface-2)' }}>
                  <svg viewBox="0 0 24 24" className="w-12 h-12" style={{ fill: 'var(--am-text-3)' }}>
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
            </FadeInView>
            <div className="mt-6">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{album.title}</h1>
              {artist && (
                <div className="flex items-center gap-2 mt-3">
                  <Link to={`/artist/${artist.id}`} className="flex items-center gap-2 group">
                    {artist.image ? (
                      <img src={artist.image} alt={artist.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--am-surface-2)' }}>
                        <svg viewBox="0 0 24 24" className="w-3 h-3" style={{ fill: 'var(--am-text-3)' }}>
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    <span className="text-[14px] font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--am-text-2)' }}>{artist.name}</span>
                  </Link>
                  <span className="text-[13px]" style={{ color: 'var(--am-text-3)' }}>· {songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section content */}
        <div className="px-5 lg:px-8 pb-20 lg:pb-24">
          {songs.length > 0 && (
            <div className="mb-12">
              <SectionTitle className="mb-6">Tracklist</SectionTitle>
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--am-divider)' }}>
                {songs.map((song, i) => (
                  <AlbumSongRow key={song.id} song={song} index={i} />
                ))}
              </div>
            </div>
          )}

          {songCovers.length >= 3 && (
            <div className="mb-12">
              <SectionTitle className="mb-6">Album Artwork</SectionTitle>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {[album.cover, ...songCovers].filter(Boolean).slice(0, 8).map((url, i) => (
                  <motion.div
                    key={i}
                    className="aspect-square overflow-hidden rounded-lg"
                    style={{ background: 'var(--am-surface-2)' }}
                    whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img src={url!} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {albumCollaborators.length > 0 && (
            <div className="mb-12">
              <SectionTitle className="mb-6">Team</SectionTitle>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {albumCollaborators.map((collab) => (
                  <Link
                    key={collab.id}
                    to={`/artist/${collab.artistId}`}
                    className="group block flex-shrink-0 w-32"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-lg relative" style={{ background: 'var(--am-surface-2)' }}>
                      {collab.image ? (
                        <img src={collab.image} alt={collab.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-8 h-8" style={{ fill: 'var(--am-text-3)' }}>
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0" style={{
                        background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 50%)',
                      }} />
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <p className="text-[12px] font-semibold truncate text-white drop-shadow-lg">{collab.name}</p>
                        <p className="text-[10px] truncate text-white/70 drop-shadow-lg">{collab.role || collab.relationship}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {songs.length === 0 && (
            <BodyText muted className="text-center py-20">
              No songs in this album yet
            </BodyText>
          )}
        </div>
      </PageContent>
    </PageShell>
  )
}

function AlbumSongRow({ song, index }: { song: Song; index: number }) {
  const thumbnail = song.cover || getYouTubeThumbnail(song.youtube_embed_url)
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        onClick={() => navigate(`/song/${song.id}`)}
        className="group flex items-center gap-3 py-3 px-4 transition-all duration-200 hover:bg-white/5 cursor-pointer hover:scale-[1.005]"
        style={{ borderBottom: '1px solid var(--am-divider)' }}
      >
        <div className="flex items-center gap-3 min-w-[48px]">
          {thumbnail ? (
            <img src={thumbnail} alt={song.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--am-surface-2)' }}>
              <span className="text-[13px] font-medium" style={{ color: 'var(--am-text-3)' }}>{index + 1}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold truncate">{song.title}</p>
          {song.artists && song.artists.length > 0 && (
            <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--am-text-2)' }}>
              {song.artists.map(a => a.name).join(', ')}
            </p>
          )}
          {song.links && song.links.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              {song.links.map((link) => {
                const config = PLATFORM_CONFIG[link.platform as PlatformKey]
                return config ? (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="transition-opacity hover:opacity-70"
                    title={config.name}
                  >
                    {config.logo ? (
                      <img src={config.logo} alt={config.name} className="w-3.5 h-3.5 object-contain" />
                    ) : (
                      <span className="text-[10px] font-medium" style={{ color: 'var(--am-text-3)' }}>{config.name}</span>
                    )}
                  </a>
                ) : null
              })}
            </div>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <motion.div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--am-accent)' }}
            whileHover={{ scale: 1.1 }}
          >
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" style={{ color: '#fff' }} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
