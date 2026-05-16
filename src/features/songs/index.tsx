import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getYouTubeThumbnail, extractYouTubeId } from '@/shared/lib/cn'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import { PLATFORM_CONFIG } from '@/types'
import type { Artist, Song, PlatformKey } from '@/types'
import { AppFrame, AmbientArtworkLayer, ContentRail } from '@/shared/layout'
import { SectionTitle } from '@/shared/typography'
import YouTubeHeroPlayer from '@/features/songs/YouTubeHeroPlayer'
import YouTubeEmbed from '@/features/songs/YouTubeEmbed'
import { useSongCollaborators } from '@/components/artist/useCollaborators'
import LoadingSpinner from '@/shared/ui/LoadingSpinner'
import EditorialCard from '@/shared/ui/EditorialCard'
import GlassMediaCard from '@/shared/ui/GlassMediaCard'
import { ChevronDown, Play, Music2 } from 'lucide-react'
import FadeInView from '@/shared/motion/FadeInView'

const qualityOptions = ['hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium']

const qualityLabels: Record<string, string> = {
  hd2160: '4K',
  hd1440: '1440p',
  hd1080: '1080p',
  hd720: '720p',
  large: '480p',
  medium: '360p',
}

export default function SongPage() {
  const { id } = useParams<{ id: string }>()
  const [song, setSong] = useState<Song | null>(null)
  const [relatedSongs, setRelatedSongs] = useState<Song[]>([])
  const [albumSongs, setAlbumSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const songCollaborators = useSongCollaborators(id)
  const [muted, setMuted] = useState(true)
  const [qualityIndex, setQualityIndex] = useState(0)

  useEffect(() => {
    async function fetchSong() {
      if (!id) return
      setLoading(true)

      const { data, error } = await supabase
        .from('songs')
        .select('*, links:links(*)')
        .eq('id', id)
        .single()

      if (data && !error) {
        const songData = data as any
        const artistIds = songData.artist_ids || []

        let artists: Artist[] = []
        if (artistIds.length > 0) {
          const { data: artistData } = await supabase.from('artists').select('*').in('id', artistIds)
          if (artistData) artists = artistData as unknown as Artist[]
        }

        let album = null
        if (songData.album_id) {
          const { data: albumData } = await supabase.from('albums').select('*').eq('id', songData.album_id).single()
          if (albumData) album = albumData
        }

        const { data: songArtistsData } = await supabase
          .from('song_artists')
          .select('*, artist:artists(id, name, image)')
          .eq('song_id', id)
          .order('position', { ascending: true })

        setSong({ ...songData, artists, album, song_artists: songArtistsData || [] } as Song)

        if (artistIds.length > 0) {
          const related = await fetchSongsWithArtists({
            filter: (q: any) => q.overlaps('artist_ids', artistIds).neq('id', id),
            limit: 10,
          })
          setRelatedSongs(related)
        }

        if (songData.album_id) {
          const { data: albumSongsData } = await supabase
            .from('songs')
            .select('*, album:albums(*, artist:artists(*))')
            .eq('album_id', songData.album_id)
            .neq('id', id)
            .limit(10)
          if (albumSongsData) {
            const enriched = await Promise.all(
              albumSongsData.map(async (s: any) => {
                const artistData = await fetchSongsWithArtists({
                  filter: (q: any) => q.eq('id', s.id),
                })
                return { ...s, artists: artistData[0]?.artists || [] }
              })
            )
            setAlbumSongs(enriched)
          }
        }
      }
      setLoading(false)
    }
    fetchSong()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!song) return (
    <div className="px-6 py-20 text-center" style={{ color: 'var(--am-text-2)' }}>Song not found</div>
  )

  const coverUrl = song.cover || (song.album && song.album.cover) || getYouTubeThumbnail(song.youtube_embed_url)

  return (
    <AppFrame>
      <AmbientArtworkLayer image={coverUrl} />

      {/* Immersive Playback Hero */}
      <div className="relative w-full overflow-hidden aspect-video">
        {song.youtube_embed_url ? (
          <div className="absolute inset-0">
            <YouTubeHeroPlayer
              videoId={extractYouTubeId(song.youtube_embed_url) || ''}
              muted={muted}
              quality={qualityOptions[qualityIndex]}
              qualityLabel={qualityLabels[qualityOptions[qualityIndex]]}
              onToggleMute={() => setMuted(!muted)}
              onToggleQuality={() => setQualityIndex((qualityIndex + 1) % qualityOptions.length)}
            />
          </div>
        ) : coverUrl ? (
          <div className="absolute inset-0">
            <img src={coverUrl} alt="" className="w-full h-full object-cover" style={{ transform: 'scale(1.1)', filter: 'blur(2px)' }} />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--am-surface-2)' }}>
            <Music2 className="w-16 h-16" style={{ color: 'var(--am-text-3)' }} />
          </div>
        )}

        {/* Soft gradient veil */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(0deg, var(--am-bg) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)',
        }} />

        {/* Hero content overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 lg:px-8 pb-6 lg:pb-10">
          <FadeInView direction="up" distance={30} className="w-full">
            <div className="flex items-end gap-5 lg:gap-8">
              {coverUrl ? (
                <div className="relative flex-shrink-0 shadow-2xl overflow-hidden" style={{ width: 'clamp(80px, 20vw, 200px)', aspectRatio: '1/1' }}>
                  <img src={coverUrl} alt={song.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
                </div>
              ) : (
                <div className="flex-shrink-0 flex items-center justify-center shadow-2xl overflow-hidden" style={{ width: 'clamp(80px, 20vw, 200px)', aspectRatio: '1/1', background: 'var(--am-surface-2)' }}>
                  <Music2 className="w-1/4 h-1/4" style={{ color: 'var(--am-text-3)' }} />
                </div>
              )}
              <div className="min-w-0 pb-1">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight leading-tight text-white drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>
                  {song.title}
                </h1>
                {song.artists && song.artists.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3 mt-2 lg:mt-3">
                    {song.artists.map((artist: Artist) => (
                      <Link key={artist.id} to={`/artist/${artist.id}`} className="transition-opacity group">
                        <span className="text-sm lg:text-base font-semibold text-white/70 drop-shadow group-hover:text-white">{artist.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {song.album && (
                  <div className="mt-2">
                    <Link to={`/album/${song.album.id}`} className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors text-xs lg:text-sm font-medium">
                      <Play className="w-3 h-3 fill-current" />
                      {song.album.title}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </FadeInView>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-5 lg:px-8 py-8 space-y-14">

        {/* Listen On */}
        {song.links && song.links.length > 0 && (
          <FadeInView key="listen">
            <SectionTitle className="mb-5">Listen On</SectionTitle>
            <div className="flex flex-wrap gap-3">
              {song.links.map((link: any) => {
                const config = PLATFORM_CONFIG[link.platform as PlatformKey]
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3 rounded-full text-[12px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}
                  >
                    {config?.logo && (
                      <img src={config.logo} alt={config.name} className="w-5 h-5 object-contain flex-shrink-0" />
                    )}
                    <span style={{ color: 'var(--am-text)' }}>{config?.name || link.platform}</span>
                  </a>
                )
              })}
            </div>
          </FadeInView>
        )}

        {/* Preview */}
        {song.youtube_embed_url && (
          <FadeInView key="preview">
            <SectionTitle className="mb-5">Preview</SectionTitle>
            <div className="max-w-2xl rounded-2xl overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
              <YouTubeEmbed url={song.youtube_embed_url} />
            </div>
          </FadeInView>
        )}

        {/* Artists / People */}
        {songCollaborators.length > 0 && (
          <FadeInView key="people">
            <ContentRail title="Artists" className="!px-0">
              {song.song_artists?.map((sa) => (
                <Link
                  key={sa.id}
                  to={`/artist/${sa.artist_id}`}
                  className="flex-shrink-0 snap-rail-item"
                >
                  <div className="w-24 h-32 relative overflow-hidden rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {sa.artist?.image ? (
                      <img src={sa.artist.image} alt={sa.artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: 'var(--am-text-3)' }}>
                        {sa.artist?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="absolute inset-0" style={{
                      background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 40%)',
                    }} />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-[11px] font-semibold text-white truncate drop-shadow-lg">{sa.artist?.name || 'Unknown'}</p>
                      {sa.role && (
                        <p className="text-[9px] text-white/60 truncate drop-shadow-lg">{sa.role}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </ContentRail>
          </FadeInView>
        )}

        {/* Lyrics — Apple Music inspired */}
        {song.lyrics && (
          <FadeInView key="lyrics">
            <SectionTitle className="mb-5">Lyrics</SectionTitle>
            <div
              className="cursor-pointer select-none rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div onClick={() => setLyricsOpen(!lyricsOpen)} className="flex items-center justify-end px-5 pt-5 pb-2">
                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--am-text-3)' }}>
                  {lyricsOpen ? 'Collapse' : 'Expand'}
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-300"
                    style={{ transform: lyricsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </div>
              </div>
              <div
                className="px-5 pb-5 transition-all duration-500 ease-in-out overflow-hidden"
                style={{
                  maxHeight: lyricsOpen ? '10000px' : '0',
                  opacity: lyricsOpen ? 1 : 0,
                }}
              >
                <div className="whitespace-pre-wrap text-[15px] lg:text-[17px] leading-relaxed font-light" style={{ color: 'var(--am-text)' }}>
                  {song.lyrics}
                </div>
              </div>
              {!lyricsOpen && (
                <div className="px-5 pb-5">
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed line-clamp-4 font-light" style={{ color: 'var(--am-text-2)' }}>
                    {song.lyrics}
                  </div>
                </div>
              )}
            </div>
          </FadeInView>
        )}

        {/* Album Songs */}
        {albumSongs.length > 0 && (
          <FadeInView key="album-songs">
            <ContentRail title="Album Songs" className="!px-0">
              {albumSongs.map((s) => (
                <GlassMediaCard
                  key={s.id}
                  to={`/song/${s.id}`}
                  image={s.cover}
                  title={s.title}
                  subtitle={s.artists?.map(a => a.name).join(', ')}
                  size="md"
                />
              ))}
            </ContentRail>
          </FadeInView>
        )}

        {/* Related */}
        {relatedSongs.length > 0 && (
          <FadeInView key="related">
            <ContentRail title="Related Songs" className="!px-0">
              {relatedSongs.map((s) => (
                <EditorialCard
                  key={s.id}
                  to={`/song/${s.id}`}
                  image={s.cover}
                  title={s.title}
                  subtitle={s.artists?.map(a => a.name).join(', ')}
                  size="sm"
                />
              ))}
            </ContentRail>
          </FadeInView>
        )}
      </div>
    </AppFrame>
  )
}
