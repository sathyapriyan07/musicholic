import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import CinematicCard from '@/components/ui/CinematicCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import FadeInView from '@/components/motion/FadeInView'
import StaggerGrid, { StaggerItem } from '@/components/motion/StaggerGrid'
import ArtistConnections from '@/components/artist/ArtistConnections'
import { useAlbumCollaborators } from '@/components/artist/useCollaborators'
import MusicUniverse from '@/components/discovery/MusicUniverse'
import type { Album, Song, Artist } from '@/types'
import type { MusicUniverseImage } from '@/components/discovery/MusicUniverse'
import { Play } from 'lucide-react'
import { getYouTubeThumbnail } from '@/lib/utils'

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
    <div>
      {/* Cinematic Album Hero */}
      <div className="relative h-[60vh] lg:h-[70vh] overflow-hidden">
        {album.cover ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${album.cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'var(--am-surface-2)' }} />
        )}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 40%, var(--am-bg) 100%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, rgba(252,60,68,0.06) 0%, transparent 60%)',
        }} />

        <FadeInView className="relative z-10 h-full flex items-end">
          <div className="px-5 lg:px-8 pb-16 lg:pb-20 w-full">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-title mb-3"
            >
              {album.title}
            </motion.h1>
            {artist && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <Link to={`/artist/${artist.id}`} className="flex items-center gap-2 group">
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: 'rgba(255,255,255,0.7)' }}>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                  <span className="text-[15px] font-semibold group-hover:opacity-80 transition-opacity" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {artist.name}
                  </span>
                </Link>
                <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  · {songs.length} {songs.length === 1 ? 'song' : 'songs'}
                </span>
              </motion.div>
            )}
          </div>
        </FadeInView>
      </div>

      {/* Creative Team */}
      <ArtistConnections
        collaborators={albumCollaborators}
        title="Creative Team"
        subtitle="The composers, singers, and producers behind this album"
      />

      {/* Related Worlds */}
      {songs.length >= 2 && (() => {
        const relatedImages: MusicUniverseImage[] = songs
          .filter(s => s.cover)
          .slice(0, 20)
          .map(song => ({
            src: song.cover,
            alt: song.title,
            title: song.title,
            subtitle: song.artists?.map(a => a.name).join(', '),
            linkTo: `/song/${song.id}`,
            id: song.id,
          }))
        return (
          <FadeInView>
            <div className="mb-8">
              <MusicUniverse
                images={relatedImages}
                title="Related Worlds"
                subtitle="Similar albums, connected moods, and cinematic soundtrack universes"
                segments={relatedImages.length > 10 ? 10 : relatedImages.length}
                grayscale
                fit={0.5}
                openedImageWidth="280px"
                openedImageHeight="380px"
                overlayBlurColor="#0a0a0a"
              />
            </div>
          </FadeInView>
        )
      })()}

      {/* Album Moodboard */}
      {songCovers.length >= 3 && (
        <FadeInView>
          <div className="px-5 lg:px-8 py-8">
            <h2 className="text-[18px] lg:text-[22px] font-bold tracking-tight mb-4">Album Artwork</h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {[album.cover, ...songCovers].filter(Boolean).slice(0, 8).map((url, i) => (
                <motion.div
                  key={i}
                  className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={url!} alt="" className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInView>
      )}

      {/* Tracklist */}
      <div className="px-5 lg:px-8 pb-20 lg:pb-24">
        {songs.length > 0 && (
          <FadeInView>
            <h2 className="text-[22px] lg:text-[28px] font-bold tracking-tight mb-6">Tracklist</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--am-divider)' }}>
              {songs.map((song, i) => (
                <AlbumSongRow key={song.id} song={song} index={i} />
              ))}
            </div>
          </FadeInView>
        )}

        {songs.length > 0 && (
          <FadeInView>
            <h2 className="text-[22px] lg:text-[28px] font-bold tracking-tight mt-12 mb-6">All Songs</h2>
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
          </FadeInView>
        )}

        {songs.length === 0 && (
          <p className="text-center py-20 text-[14px]" style={{ color: 'var(--am-text-2)' }}>No songs in this album yet</p>
        )}
      </div>
    </div>
  )
}

function AlbumSongRow({ song, index }: { song: Song; index: number }) {
  const thumbnail = song.cover || getYouTubeThumbnail(song.youtube_embed_url)
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link
        to={`/song/${song.id}`}
        className="group flex items-center gap-3 py-3 px-4 transition-colors hover:bg-white/5"
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
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--am-accent)' }}>
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" style={{ color: '#fff' }} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
