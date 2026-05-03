import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import SongCard from '@/components/SongCard'
import ArtistCard from '@/components/ArtistCard'
import AlbumCard from '@/components/AlbumCard'
import Shelf from '@/components/Shelf'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Song, Artist, Album } from '@/types'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [songs, setSongs] = useState<Song[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function search() {
      if (!query.trim()) {
        setSongs([])
        setArtists([])
        setAlbums([])
        return
      }
      setLoading(true)
      try {
        const songsData = await fetchSongsWithArtists({
          filter: (q: any) => q.ilike('title', `%${query}%`).limit(20),
        })
        const [artistsRes, albumsRes] = await Promise.all([
          supabase.from('artists').select('*').ilike('name', `%${query}%`).limit(15),
          supabase.from('albums').select('*, artist:artists(id, name, image)').ilike('title', `%${query}%`).limit(15),
        ])
        setSongs(songsData)
        if (artistsRes.data) setArtists(artistsRes.data as unknown as Artist[])
        if (albumsRes.data) setAlbums(albumsRes.data as unknown as Album[])
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }

    const timeout = setTimeout(search, 300)
    return () => clearTimeout(timeout)
  }, [query])

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ background: 'var(--am-surface-2)' }}>
          <Search className="w-7 h-7" style={{ color: 'var(--am-text-3)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Search</h1>
        <p className="text-[14px]" style={{ color: 'var(--am-text-2)' }}>Find songs, artists, and albums</p>
      </div>
    )
  }

  if (loading) return <LoadingSpinner />

  const totalResults = songs.length + artists.length + albums.length

  return (
    <div className="py-8">
      <div className="px-5 lg:px-8 mb-8">
        <h1 className="text-[28px] font-bold tracking-tight">
          Results for{' '}
          <span style={{ color: 'var(--am-accent)' }}>"{query}"</span>
        </h1>
        {totalResults > 0 && (
          <p className="text-[13px] mt-1" style={{ color: 'var(--am-text-2)' }}>
            {totalResults} result{totalResults !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {totalResults === 0 && (
        <div className="text-center py-20 px-6">
          <p className="text-lg font-semibold mb-1">No results found</p>
          <p className="text-[14px]" style={{ color: 'var(--am-text-2)' }}>Try different keywords</p>
        </div>
      )}

      {artists.length > 0 && (
        <Shelf title="Artists">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </Shelf>
      )}

      {albums.length > 0 && (
        <Shelf title="Albums">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </Shelf>
      )}

      {songs.length > 0 && (
        <Shelf title="Songs">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </Shelf>
      )}
    </div>
  )
}
