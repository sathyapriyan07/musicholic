import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import LoadingSpinner from '@/components/LoadingSpinner'
import SongCard from '@/components/SongCard'
import ArtistConnections from '@/components/artist/ArtistConnections'
import { useSongCollaborators } from '@/components/artist/useCollaborators'
import { getYouTubeThumbnail, extractYouTubeId } from '@/lib/utils'
import type { Song, Artist, PlatformKey } from '@/types'
import { PLATFORM_CONFIG } from '@/types'
import { ChevronDown } from 'lucide-react'
import YouTubeHeroPlayer from '@/components/YouTubeHeroPlayer'

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
  const qualityOptions = ['hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium']

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
    <div>
      {/* Hero banner with overlay */}
      {song.youtube_embed_url ? (
        <div className="relative w-full aspect-video overflow-hidden">
          <YouTubeHeroPlayer
            videoId={extractYouTubeId(song.youtube_embed_url) || ''}
            muted={muted}
            quality={qualityOptions[qualityIndex]}
            qualityLabel={qualityOptions[qualityIndex] === 'hd2160' ? '4K' : qualityOptions[qualityIndex] === 'hd1440' ? '1440p' : qualityOptions[qualityIndex] === 'hd1080' ? '1080p' : qualityOptions[qualityIndex] === 'hd720' ? '720p' : qualityOptions[qualityIndex] === 'large' ? '480p' : '360p'}
            onToggleMute={() => setMuted(!muted)}
            onToggleQuality={() => setQualityIndex((qualityIndex + 1) % qualityOptions.length)}
          />
          <div className="absolute inset-0 flex items-end" style={{
            background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
          }}>
            <div className="px-5 lg:px-8 pb-6 lg:pb-10 w-full">
              <div className="flex items-end gap-5">
                {coverUrl ? (
                  <img src={coverUrl} alt={song.title} className="w-20 h-20 sm:w-28 sm:h-28 object-cover shadow-2xl flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--am-surface-2)' }}>
                    <svg viewBox="0 0 24 24" className="w-8 h-8" style={{ fill: 'var(--am-text-3)' }}>
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight leading-tight text-white drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>{song.title}</h1>
                  {song.artists && song.artists.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-3 mt-1">
                      {song.artists.map((artist: Artist) => (
                        <Link key={artist.id} to={`/artist/${artist.id}`} className="hover:underline transition-opacity">
                          <span className="text-[13px] sm:text-[14px] font-semibold text-white/80 drop-shadow">{artist.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Cover image + info (no video) */
        <div className="px-5 lg:px-8 pt-6 pb-8">
          <div className="flex items-end gap-5">
            {coverUrl ? (
              <img src={coverUrl} alt={song.title} className="w-28 h-28 sm:w-32 sm:h-32 object-cover shadow-2xl flex-shrink-0" />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--am-surface-2)' }}>
                <svg viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: 'var(--am-text-3)' }}>
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{song.title}</h1>
              {song.artists && song.artists.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-3">
                  {song.artists.map((artist: Artist) => (
                    <Link key={artist.id} to={`/artist/${artist.id}`} className="hover:underline transition-opacity">
                      <span className="text-[14px] font-semibold" style={{ color: 'var(--am-text-2)' }}>{artist.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Album info (below hero) */}
      {song.album && (
        <div className="px-5 lg:px-8 pt-4 pb-2">
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--am-text-3)' }}>Album</p>
          <Link to={`/album/${song.album.id}`} className="text-[14px] font-semibold hover:underline">{song.album.title}</Link>
        </div>
      )}

      {/* Streaming links */}
      {song.links && song.links.length > 0 && (
        <div className="px-5 lg:px-8 mb-8">
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--am-text-3)' }}>Listen on</p>
          <div className="grid grid-cols-2 gap-3">
            {song.links.map((link: any) => {
              const config = PLATFORM_CONFIG[link.platform as PlatformKey]
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-[11px] font-semibold transition-opacity hover:opacity-80 bg-transparent border w-full"
                  style={{ borderColor: 'var(--am-border)' }}
                >
                  {config?.logo && (
                    <img src={config.logo} alt={config.name} className="w-5 h-5 object-contain" />
                  )}
                  <span style={{ color: 'var(--am-text-2)' }}>{config?.name || link.platform}</span>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* YouTube embed */}
      {song.youtube_embed_url && (
        <div className="px-5 lg:px-8 mb-6">
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--am-text-3)' }}>Preview</p>
          <div className="max-w-2xl">
            <YouTubeEmbed url={song.youtube_embed_url} />
          </div>
        </div>
      )}

      {/* People Behind This Song */}
      <ArtistConnections
        collaborators={songCollaborators}
        title="People Behind This Song"
        subtitle="The artists and creators who brought this track to life"
      />

      {/* Lyrics */}
      {song.lyrics && (
        <div className="px-5 lg:px-8 mb-10">
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
            style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}
            onClick={() => setLyricsOpen(!lyricsOpen)}
          >
            <div className="flex items-center justify-between p-5">
              <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--am-text-3)' }}>Lyrics</p>
              <ChevronDown
                className="w-4 h-4 transition-transform duration-200"
                style={{ color: 'var(--am-text-3)', transform: lyricsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </div>
            <div
              className="px-5 pb-5 transition-all duration-300"
              style={{
                maxHeight: lyricsOpen ? '10000px' : '0',
                opacity: lyricsOpen ? 1 : 0,
                overflow: 'hidden',
              }}
            >
              <div className="whitespace-pre-wrap text-[14px] leading-relaxed" style={{ color: 'var(--am-text)' }}>
                {song.lyrics}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* More from album */}
      {albumSongs.length > 0 && (
        <div className="px-5 lg:px-8 mb-10">
          <h2 className="text-[22px] font-bold tracking-tight mb-4">More from this album</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {albumSongs.map((s) => (
              <SongCard key={s.id} song={s} />
            ))}
          </div>
        </div>
      )}

      {/* Related songs */}
      {relatedSongs.length > 0 && (
        <div className="px-5 lg:px-8 mb-10">
          <h2 className="text-[22px] font-bold tracking-tight mb-4">More from these artists</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {relatedSongs.map((s) => (
              <SongCard key={s.id} song={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
