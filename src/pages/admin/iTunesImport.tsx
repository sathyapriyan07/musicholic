import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Artist, Album, Song } from '@/types'


interface iTunesResult {
  trackId?: number
  collectionId?: number
  trackName?: string
  collectionName?: string
  artistName: string
  artworkUrl100: string
  artworkUrl600?: string
  previewUrl?: string
  collectionViewUrl?: string
  trackViewUrl?: string
}

export default function ITunesImport({ artists, onImported }: {
  artists: Artist[]
  onImported: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<iTunesResult[]>([])
  const [loading, setLoading] = useState(false)
  const [importingId, setImportingId] = useState<number | null>(null)

  async function searchITunes() {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=20`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (e) {
      console.error('iTunes search failed', e)
    }
    setLoading(false)
  }

  async function importSong(item: iTunesResult) {
    setImportingId(item.trackId || null)
    try {
      let artistId: string | null = null
      const existingArtist = artists.find(a => a.name.toLowerCase() === item.artistName.toLowerCase())
      if (existingArtist) {
        artistId = existingArtist.id
      } else {
        const { data } = await (supabase.from('artists') as any).insert({ name: item.artistName, image: item.artworkUrl100 }).select().single()
        if (data) artistId = (data as Artist).id
      }

      let albumId: string | null = null
      if (item.collectionId) {
        const { data: albumData } = await supabase.from('albums').select('*').eq('title', item.collectionName || '').maybeSingle()
        if (albumData) {
          albumId = (albumData as any).id
        } else if (artistId) {
          const { data } = await (supabase.from('albums') as any).insert({
            title: item.collectionName || 'Unknown Album',
            artist_id: artistId,
            cover: item.artworkUrl600 || item.artworkUrl100,
          }).select().single()
          if (data) albumId = (data as Album).id
        }
      }

      const { data: songData } = await (supabase.from('songs') as any).insert({
        title: item.trackName || 'Unknown Track',
        cover: item.artworkUrl600 || item.artworkUrl100,
        artist_ids: artistId ? [artistId] : [],
        album_id: albumId,
      }).select().single()

      if (songData && artistId) {
        await (supabase.from('song_artists') as any).insert({
          song_id: (songData as Song).id,
          artist_id: artistId,
          role: 'primary',
          position: 0,
        })
      }

      onImported()
    } catch (e) {
      console.error('Import failed', e)
    }
    setImportingId(null)
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}>
      <h3 className="text-[17px] font-bold mb-4">iTunes Import</h3>
      <p className="text-[12px] mb-4" style={{ color: 'var(--am-text-2)' }}>Search and import songs from iTunes. Cover images are imported as URLs (not uploaded). Preview URLs are not imported.</p>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchITunes()}
          placeholder="Search songs..."
          className="flex-1 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
          style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
        />
        <button
          onClick={searchITunes}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-50"
          style={{ background: 'var(--am-accent)' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
          {results.map((item) => (
            <div key={item.trackId} className="flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-opacity"
              style={{ background: 'var(--am-surface-2)' }}>
              <img src={item.artworkUrl100} alt={item.trackName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate">{item.trackName}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--am-text-2)' }}>
                  {item.artistName} {item.collectionName ? `· ${item.collectionName}` : ''}
                </p>
              </div>
              <button
                onClick={() => importSong(item)}
                disabled={importingId === item.trackId}
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white disabled:opacity-50 flex-shrink-0"
                style={{ background: 'var(--am-accent)' }}
              >
                {importingId === item.trackId ? 'Importing...' : 'Import'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
