import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AlbumCard from '@/components/AlbumCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Album, Artist } from '@/types'

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('albums')
          .select('*, artist:artists(id, name, image)')
          .order('created_at', { ascending: false })
        if (data) setAlbums(data as unknown as Album[])
      } catch {
        console.error('Error fetching albums')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = albums.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    ((a.artist as Artist | undefined)?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="py-8">
      <div className="px-5 lg:px-8 mb-6">
        <h1 className="text-[32px] font-bold tracking-tight mb-1">Albums</h1>
        <p className="text-[14px]" style={{ color: 'var(--am-text-2)' }}>{albums.length} {albums.length === 1 ? 'album' : 'albums'}</p>
      </div>

      {albums.length > 10 && (
        <div className="px-5 lg:px-8 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search albums..."
            className="w-full max-w-md rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
            style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--am-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--am-border)')}
          />
        </div>
      )}

      <div className="px-5 lg:px-8">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
            {filtered.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ) : (
          <p className="text-center py-16 text-[14px]" style={{ color: 'var(--am-text-2)' }}>
            {search ? 'No albums found' : 'No albums yet'}
          </p>
        )}
      </div>
    </div>
  )
}
