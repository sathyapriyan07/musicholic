import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import SongCard from '@/components/SongCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Album, Song, Artist } from '@/types'
import { List, LayoutGrid, Play } from 'lucide-react'
import { getYouTubeThumbnail } from '@/lib/utils'

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>()
  const [album, setAlbum] = useState<Album | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

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

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden">
        {album.cover ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${album.cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'top',
            }}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'var(--am-surface-2)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 50%, var(--am-bg) 100%)' }} />

        <div className="relative z-10 px-5 lg:px-8 pt-32 pb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 leading-tight" style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{album.title}</h1>
            {artist && (
              <p className="text-[14px] flex items-center justify-center gap-2" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                <Link to={`/artist/${artist.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
                      <svg viewBox="0 0 24 24" className="w-3 h-3" style={{ fill: 'rgba(255,255,255,0.7)' }}>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                  <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>{artist.name}</span>
                </Link>
                {' · '}{songs.length} {songs.length === 1 ? 'song' : 'songs'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* View toggle & Songs */}
      <div className="px-5 lg:px-8 mb-10">
        {songs.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold">Tracklist</h2>
            <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: 'var(--am-surface-2)' }}>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? '' : 'text-[var(--am-text-3)]'}`}
                style={viewMode === 'list' ? { background: 'var(--am-surface-3)', color: '#fff' } : {}}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? '' : 'text-[var(--am-text-3)]'}`}
                style={viewMode === 'grid' ? { background: 'var(--am-surface-3)', color: '#fff' } : {}}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {songs.length > 0 && viewMode === 'list' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--am-divider)' }}>
            {songs.map((song, i) => (
              <AlbumSongRow key={song.id} song={song} index={i} />
            ))}
          </div>
        )}

        {songs.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}

        {songs.length === 0 && (
          <p className="text-center py-10 text-[14px]" style={{ color: 'var(--am-text-2)' }}>No songs in this album yet</p>
        )}
      </div>
    </div>
  )
}

function AlbumSongRow({ song, index }: { song: Song; index: number }) {
  const thumbnail = song.cover || getYouTubeThumbnail(song.youtube_embed_url)
  return (
    <Link
      to={`/song/${song.id}`}
      className="group flex items-center gap-3 py-2.5 px-4 transition-colors hover:bg-white/5"
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
  )
}
