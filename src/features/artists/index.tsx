import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import { ARTIST_PLATFORM_CONFIG } from '@/types'
import type { Artist, Song, Album, ArtistLink } from '@/types'
import { AppFrame, AmbientArtworkLayer, ContentRail } from '@/shared/layout'
import { SectionTitle, CinematicDescription, FloatingMetadata } from '@/shared/typography'
import { FadeInView } from '@/shared/motion'
import EditorialCard from '@/shared/ui/EditorialCard'
import GlassMediaCard from '@/shared/ui/GlassMediaCard'
import ImmersiveRailCard from '@/shared/ui/ImmersiveRailCard'
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
    <AppFrame>
      <AmbientArtworkLayer image={artist.image} />

      {/* Documentary-style hero banner */}
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
          background: 'linear-gradient(0deg, var(--am-bg) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)',
        }} />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <FadeInView direction="up">
            <FloatingMetadata className="mb-4">
              <span>Artist</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}{albums.length > 0 && ` · ${albums.length} ${albums.length === 1 ? 'album' : 'albums'}`}</span>
            </FloatingMetadata>
            <h1 className="text-3xl lg:text-6xl font-bold tracking-tight leading-tight text-white drop-shadow-xl" style={{ fontFamily: 'var(--font-display)' }}>
              {artist.name}
            </h1>
          </FadeInView>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-5 lg:px-8 py-8 space-y-14">

        {/* Bio */}
        {artist.bio && (
          <FadeInView>
            <CinematicDescription className="max-w-3xl whitespace-pre-line">
              {artist.bio}
            </CinematicDescription>
          </FadeInView>
        )}

        {/* Top Songs */}
        {songs.length > 0 && (
          <FadeInView>
            <ContentRail title="Songs" className="!px-0">
              {songs.map((song) => (
                <GlassMediaCard
                  key={song.id}
                  to={`/song/${song.id}`}
                  image={song.cover}
                  title={song.title}
                  subtitle={song.artists?.map(a => a.name).join(', ')}
                  size="md"
                />
              ))}
            </ContentRail>
          </FadeInView>
        )}

        {/* Essential Albums */}
        {albums.length > 0 && (
          <FadeInView>
            <ContentRail title="Albums" className="!px-0">
              {albums.map((album) => (
                <EditorialCard
                  key={album.id}
                  to={`/album/${album.id}`}
                  image={album.cover}
                  title={album.title}
                  subtitle={album.artist?.name}
                  size="md"
                />
              ))}
            </ContentRail>
          </FadeInView>
        )}

        {/* Links */}
        {artistLinks.length > 0 && (
          <FadeInView>
            <SectionTitle className="mb-5">Links</SectionTitle>
            <div className="flex flex-wrap gap-3">
              {artistLinks.map((link) => {
                const config = platformConfig[link.platform as keyof typeof platformConfig]
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-semibold transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}
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
      </div>

      {/* Related Artists */}
      {relatedArtists.length > 0 && (
        <div className="relative z-10 pb-24">
          <ContentRail title="Related Artists">
            {relatedArtists.slice(0, 10).map((related) => (
              <ImmersiveRailCard
                key={related.id}
                to={`/artist/${related.id}`}
                image={related.image}
                title={related.name}
              />
            ))}
          </ContentRail>
        </div>
      )}
    </AppFrame>
  )
}
