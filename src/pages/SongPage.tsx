import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import LoadingSpinner from '@/components/LoadingSpinner'
import SongCard from '@/components/SongCard'
import { getYouTubeThumbnail } from '@/lib/utils'
import type { Song, Artist, PlatformKey } from '@/types'
import { PLATFORM_CONFIG } from '@/types'

export default function SongPage() {
  const { id } = useParams<{ id: string }>()
  const [song, setSong] = useState<Song | null>(null)
  const [relatedSongs, setRelatedSongs] = useState<Song[]>([])
  const [albumSongs, setAlbumSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

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

        setSong({ ...songData, artists, album } as Song)

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

  return (
    <div>
      {/* Hero with blurred art background */}
      <div className="relative overflow-hidden">
        {/* Blurred background */}
        {(song.cover || (song.album && song.album.cover) || (song.artists && song.artists[0]?.image) || getYouTubeThumbnail(song.youtube_embed_url)) && (
          <div
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url(${song.cover || song.album?.cover || song.artists?.[0]?.image || getYouTubeThumbnail(song.youtube_embed_url)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(40px) saturate(1.4)',
              opacity: 0.35,
            }}
          />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--am-bg) 85%)' }} />

        <div className="relative z-10 px-5 lg:px-8 pt-10 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 max-w-3xl">
            {/* Cover art */}
            <div className="flex-shrink-0">
              {song.cover || (song.album && song.album.cover) || (song.artists && song.artists[0]?.image) ? (
                <img src={(song.cover || song.album?.cover || song.artists?.[0]?.image) as string} alt={song.title} className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-2xl shadow-2xl" />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--am-surface-2)' }}>
                  <svg viewBox="0 0 24 24" className="w-16 h-16" style={{ fill: 'var(--am-text-3)' }}>
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--am-text-3)' }}>Song</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 leading-tight">{song.title}</h1>

              {song.artists && song.artists.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {song.artists.map((artist: Artist) => (
                    <Link key={artist.id} to={`/artist/${artist.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      {artist.image ? (
                        <img src={artist.image} alt={artist.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--am-surface-2)' }}>
                          <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: 'var(--am-text-3)' }}>
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                      <span className="font-semibold text-[15px]" style={{ color: 'var(--am-accent)' }}>{artist.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {song.album && (
                <p className="text-[13px] mb-4" style={{ color: 'var(--am-text-2)' }}>
                  From{' '}
                  <Link to={`/album/${song.album.id}`} className="font-semibold hover:underline" style={{ color: 'var(--am-text-2)' }}>
                    {song.album.title}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Streaming links */}
      {song.links && song.links.length > 0 && (
        <div className="px-5 lg:px-8 mb-8">
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--am-text-3)' }}>Listen on</p>
          <div className="flex flex-wrap gap-3">
            {song.links.map((link: any) => {
              const config = PLATFORM_CONFIG[link.platform as PlatformKey]
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-full text-[11px] font-semibold transition-opacity hover:opacity-80 bg-transparent border"
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
        <div className="px-5 lg:px-8 mb-10">
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--am-text-3)' }}>Preview</p>
          <div className="max-w-2xl">
            <YouTubeEmbed url={song.youtube_embed_url} />
          </div>
        </div>
      )}

      {/* Lyrics */}
      {song.lyrics && (
        <div className="px-5 lg:px-8 mb-10">
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--am-text-3)' }}>Lyrics</p>
          <div className="max-w-2xl rounded-2xl p-6 whitespace-pre-wrap text-[14px] leading-relaxed"
            style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)', color: 'var(--am-text)' }}>
            {song.lyrics}
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
