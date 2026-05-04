import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Song, Album } from '@/types'

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
  wrapperType?: string
}

type SearchType = 'song' | 'album'

export default function ITunesImport({ onImported }: {
  onImported: () => void
}) {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('song')
  const [results, setResults] = useState<iTunesResult[]>([])
  const [loading, setLoading] = useState(false)
  const [importingId, setImportingId] = useState<number | null>(null)
  const [selectedResults, setSelectedResults] = useState<number[]>([])

  async function searchITunes() {
    if (!query.trim()) return
    setLoading(true)
    try {
      const entity = searchType === 'album' ? 'album' : 'song'
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=${entity}&limit=20`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (e) {
      console.error('iTunes search failed', e)
    }
    setLoading(false)
  }

  function getHighQualityArtwork(url: string): string {
    return url.replace(/100x100bb|60x60bb/, '600x600bb')
  }

  async function handleImportSong(item: iTunesResult) {
    setImportingId(item.trackId || null)
    try {
      const coverUrl = getHighQualityArtwork(item.artworkUrl100)
      const { data: songData } = await (supabase.from('songs') as any).insert({
        title: item.trackName || 'Unknown Track',
        cover: coverUrl,
        artist_ids: [],
        album_id: null,
      }).select().single()

      if (songData) {
        const { data: albumCheck } = await supabase.from('albums').select('id').ilike('title', item.collectionName || '').maybeSingle()
        if (albumCheck) {
          await (supabase.from('songs') as any).update({ album_id: (albumCheck as any).id }).eq('id', (songData as Song).id)
        }
      }

      onImported()
    } catch (e) {
      console.error('Import failed', e)
    }
    setImportingId(null)
  }

  async function handleImportAlbum(item: iTunesResult) {
    if (!item.collectionId) return
    setImportingId(item.collectionId)
    try {
      const collectionId = item.collectionId
      const coverUrl = getHighQualityArtwork(item.artworkUrl100)

      let albumId: string | null = null
      const { data: existingAlbum } = await supabase.from('albums').select('*').ilike('title', item.collectionName || '').maybeSingle()
      if (existingAlbum) {
        albumId = (existingAlbum as any).id
        await (supabase.from('albums') as any).update({ cover: coverUrl }).eq('id', albumId)
      } else {
        const { data } = await (supabase.from('albums') as any).insert({
          title: item.collectionName || 'Unknown Album',
          artist_id: null,
          cover: coverUrl,
        }).select().single()
        if (data) albumId = (data as Album).id
      }

      const res = await fetch(`https://itunes.apple.com/lookup?id=${collectionId}&entity=song`)
      const data = await res.json()
      const songs = data.results?.filter((r: any) => r.wrapperType === 'track') || []

      for (const track of songs) {
        const { data: existingSong } = await supabase.from('songs').select('id').ilike('title', track.trackName || '').maybeSingle()
        if (existingSong) continue

        await (supabase.from('songs') as any).insert({
          title: track.trackName || 'Unknown Track',
          cover: getHighQualityArtwork(track.artworkUrl100 || item.artworkUrl100),
          artist_ids: [],
          album_id: albumId,
        })
      }

      onImported()
    } catch (e) {
      console.error('Album import failed', e)
    }
    setImportingId(null)
  }

  async function handleBulkImportSongs() {
    setLoading(true)
    try {
      for (const item of results) {
        if (item.trackId && !selectedResults.includes(item.trackId)) continue
        if (!item.trackId) continue
        await handleImportSong(item)
      }
      setSelectedResults([])
      onImported()
    } catch (e) {
      console.error('Bulk import failed', e)
    }
    setLoading(false)
  }

  function toggleSelect(id: number) {
    setSelectedResults(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function selectAll() {
    if (selectedResults.length === results.filter(r => r.trackId).length) {
      setSelectedResults([])
    } else {
      setSelectedResults(results.filter(r => r.trackId).map(r => r.trackId!))
    }
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}>
      <h3 className="text-[17px] font-bold mb-4">iTunes Import</h3>
      <p className="text-[12px] mb-4" style={{ color: 'var(--am-text-2)' }}>Search and import songs or albums from iTunes. Cover images are imported as URLs. Artists must be assigned manually in the Songs/Albums tab.</p>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSearchType('song')}
          className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
          style={searchType === 'song' ? { background: 'var(--am-accent)', color: '#fff' } : { background: 'var(--am-surface-2)', color: 'var(--am-text-2)' }}
        >
          Songs
        </button>
        <button
          onClick={() => setSearchType('album')}
          className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
          style={searchType === 'album' ? { background: 'var(--am-accent)', color: '#fff' } : { background: 'var(--am-surface-2)', color: 'var(--am-text-2)' }}
        >
          Albums
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchITunes()}
          placeholder={`Search ${searchType}s...`}
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

      {results.length > 0 && searchType === 'song' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={selectAll}
              className="text-[12px] font-semibold hover:opacity-70"
              style={{ color: 'var(--am-accent)' }}
            >
              {selectedResults.length === results.filter(r => r.trackId).length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-[11px]" style={{ color: 'var(--am-text-3)' }}>
              {selectedResults.length} of {results.filter(r => r.trackId).length} selected
            </span>
            <button
              onClick={handleBulkImportSongs}
              disabled={selectedResults.length === 0 || loading}
              className="px-4 py-2 rounded-full text-[11px] font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--am-accent)' }}
            >
              {loading ? 'Importing...' : `Import ${selectedResults.length} Songs`}
            </button>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
          {results.map((item) => (
            <div
              key={item.trackId || item.collectionId}
              className="flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-opacity cursor-pointer"
              style={{
                background: selectedResults.includes(item.trackId!)
                  ? 'var(--am-surface-3)'
                  : 'var(--am-surface-2)',
                border: selectedResults.includes(item.trackId!)
                  ? '1px solid var(--am-accent)'
                  : '1px solid transparent',
              }}
              onClick={() => item.trackId && toggleSelect(item.trackId)}
            >
              {item.trackId && (
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedResults.includes(item.trackId)
                    ? 'bg-[var(--am-accent)] border-[var(--am-accent)]'
                    : 'border-[var(--am-text-3)]'
                }`}>
                  {selectedResults.includes(item.trackId) && <span className="text-white text-[10px]">✓</span>}
                </div>
              )}
              <img src={getHighQualityArtwork(item.artworkUrl100)} alt={item.trackName || item.collectionName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate">{item.trackName || item.collectionName}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--am-text-2)' }}>
                  {item.artistName} {item.collectionName && item.trackName ? `· ${item.collectionName}` : ''}
                </p>
              </div>
              {searchType === 'album' ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleImportAlbum(item) }}
                  disabled={importingId === item.collectionId}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white disabled:opacity-50 flex-shrink-0"
                  style={{ background: 'var(--am-accent)' }}
                >
                  {importingId === item.collectionId ? 'Importing...' : 'Import Album'}
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleImportSong(item) }}
                  disabled={importingId === item.trackId}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white disabled:opacity-50 flex-shrink-0"
                  style={{ background: 'var(--am-accent)' }}
                >
                  {importingId === item.trackId ? 'Importing...' : 'Import'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
