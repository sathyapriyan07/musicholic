import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import SongCard from '@/components/SongCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Album, Song, Artist } from '@/types'

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>()
  const [album, setAlbum] = useState<Album | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)

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
        {album.cover && (
          <div
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url(${album.cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(40px) saturate(1.4)',
              opacity: 0.35,
            }}
          />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--am-bg) 85%)' }} />

        <div className="relative z-10 px-5 lg:px-8 pt-10 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {album.cover ? (
              <img src={album.cover} alt={album.title} className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-2xl shadow-2xl flex-shrink-0" />
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--am-surface-2)' }}>
                <svg viewBox="0 0 24 24" className="w-16 h-16" style={{ fill: 'var(--am-text-3)' }}>
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--am-text-3)' }}>Album</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 leading-tight">{album.title}</h1>
              {artist && (
                <p className="text-[14px]" style={{ color: 'var(--am-text-2)' }}>
                  <Link to={`/artist/${artist.id}`} className="font-semibold hover:underline" style={{ color: 'var(--am-accent)' }}>
                    {artist.name}
                  </Link>
                  {' · '}{songs.length} {songs.length === 1 ? 'song' : 'songs'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Songs */}
      <div className="px-5 lg:px-8 mb-10">
        {songs.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <p className="text-center py-10 text-[14px]" style={{ color: 'var(--am-text-2)' }}>No songs in this album yet</p>
        )}
      </div>
    </div>
  )
}
