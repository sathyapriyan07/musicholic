import { useEffect, useState } from 'react'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import SongCard from '@/components/SongCard'
import ArtistCard from '@/components/ArtistCard'
import AlbumCard from '@/components/AlbumCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Song, Artist, Album } from '@/types'
import { cn } from '@/lib/utils'

type Tab = 'songs' | 'artists' | 'albums'

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<Tab>('songs')
  const [songs, setSongs] = useState<Song[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const songsData = await fetchSongsWithArtists({ order: { column: 'created_at' }, limit: 50 })
        const [artistsRes, albumsRes] = await Promise.all([
          supabase.from('artists').select('*').order('name', { ascending: true }).limit(50),
          supabase.from('albums').select('*, artist:artists(id, name, image)').order('created_at', { ascending: false }).limit(50),
        ])
        setSongs(songsData)
        if (artistsRes.data) setArtists(artistsRes.data as unknown as Artist[])
        if (albumsRes.data) setAlbums(albumsRes.data as unknown as Album[])
      } catch (err) {
        console.error('Browse error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingSpinner />

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'songs', label: 'Songs', count: songs.length },
    { key: 'artists', label: 'Artists', count: artists.length },
    { key: 'albums', label: 'Albums', count: albums.length },
  ]

  const emptyMsg = { songs: 'No songs yet', artists: 'No artists yet', albums: 'No albums yet' }

  return (
    <div className="py-8">
      <div className="px-5 lg:px-8 mb-8">
        <h1 className="text-[32px] font-bold tracking-tight">Browse</h1>
      </div>

      {/* Pill tabs */}
      <div className="flex gap-2 mb-8 px-5 lg:px-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all',
              activeTab === tab.key
                ? 'text-white'
                : 'text-[var(--am-text-2)] hover:text-white hover:bg-white/5'
            )}
            style={activeTab === tab.key ? { background: 'var(--am-accent)' } : { background: 'var(--am-surface-2)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="px-5 lg:px-8">
        {activeTab === 'songs' && songs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} size="md" />
            ))}
          </div>
        )}

        {activeTab === 'artists' && artists.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} size="md" />
            ))}
          </div>
        )}

        {activeTab === 'albums' && albums.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} size="md" />
            ))}
          </div>
        )}

        {((activeTab === 'songs' && songs.length === 0) ||
          (activeTab === 'artists' && artists.length === 0) ||
          (activeTab === 'albums' && albums.length === 0)) && (
          <p className="text-center py-16 text-[14px]" style={{ color: 'var(--am-text-2)' }}>
            {emptyMsg[activeTab]}
          </p>
        )}
      </div>
    </div>
  )
}
