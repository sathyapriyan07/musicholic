import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Song, Album, Artist } from '@/types'
// Helper to cast supabase queries
const supa = (supabase as any)
import { getYouTubeThumbnail } from '@/lib/utils'

interface BulkEditProps {
  type: 'song' | 'album'
  items: (Song | Album)[]
  artists: Artist[]
  onSaved: () => void
}

export default function BulkEdit({ type, items, artists, onSaved }: BulkEditProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [action, setAction] = useState<'delete' | 'updateArtist' | 'updateCover'>('delete')
  const [artistId, setArtistId] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleSelect(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function selectAll() {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map(i => i.id))
    }
  }

  async function handleBulkAction() {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      if (action === 'delete') {
        if (type === 'song') {
          await supa.from('song_artists').delete().in('song_id', selectedIds)
          await supa.from('links').delete().in('song_id', selectedIds)
          await supa.from('songs').delete().in('id', selectedIds)
        } else {
          await supa.from('albums').delete().in('id', selectedIds)
        }
      } else if (action === 'updateArtist' && artistId) {
        if (type === 'song') {
          await supa.from('songs').update({ artist_ids: [artistId] }).in('id', selectedIds)
          // Update song_artists
          await supa.from('song_artists').delete().in('song_id', selectedIds)
          for (const songId of selectedIds) {
            await supa.from('song_artists').insert({
              song_id: songId,
              artist_id: artistId,
              role: 'primary',
              position: 0,
            })
          }
        } else {
          await supa.from('albums').update({ artist_id: artistId }).in('id', selectedIds)
        }
      } else if (action === 'updateCover') {
        if (type === 'song') {
          const updates = items
            .filter(i => selectedIds.includes(i.id))
            .map(async (item: any) => {
              const youtubeThumb = getYouTubeThumbnail(item.youtube_embed_url)
              if (youtubeThumb && !item.cover) {
                await supa.from('songs').update({ cover: youtubeThumb }).eq('id', item.id)
              }
            })
          await Promise.all(updates)
        }
      }
      onSaved()
      setSelectedIds([])
    } catch (e) {
      console.error('Bulk action failed', e)
    }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl p-5 mb-8" style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}>
      <h3 className="text-[17px] font-bold mb-4">Bulk Edit {type}s</h3>
      
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as any)}
          className="rounded-xl px-3 py-2 text-[13px] focus:outline-none"
          style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
        >
          <option value="delete">Delete Selected</option>
          <option value="updateArtist">Update Artist</option>
          <option value="updateCover">Set YouTube Thumbnail as Cover</option>
        </select>

        {action === 'updateArtist' && (
          <select
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            className="rounded-xl px-3 py-2 text-[13px] focus:outline-none"
            style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
          >
            <option value="">Select Artist</option>
            {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}

        <button
          onClick={handleBulkAction}
          disabled={selectedIds.length === 0 || loading || (action === 'updateArtist' && !artistId)}
          className="px-4 py-2 rounded-full text-[13px] font-semibold text-white disabled:opacity-50"
          style={{ background: action === 'delete' ? '#ef4444' : 'var(--am-accent)' }}
        >
          {loading ? 'Processing...' : `Apply to ${selectedIds.length} item(s)`}
        </button>
      </div>

      <div className="mb-3">
        <button
          onClick={selectAll}
          className="text-[12px] font-semibold hover:opacity-70"
          style={{ color: 'var(--am-accent)' }}
        >
          {selectedIds.length === items.length ? 'Deselect All' : 'Select All'}
        </button>
        <span className="text-[12px] ml-3" style={{ color: 'var(--am-text-3)' }}>
          {selectedIds.length} of {items.length} selected
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => toggleSelect(item.id)}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
            style={{
              background: selectedIds.includes(item.id) ? 'var(--am-surface-3)' : 'var(--am-surface-2)',
              border: `1px solid ${selectedIds.includes(item.id) ? 'var(--am-accent)' : 'transparent'}`,
            }}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
              selectedIds.includes(item.id) ? 'bg-[var(--am-accent)] border-[var(--am-accent)]' : 'border-[var(--am-text-3)]'
            }`}>
              {selectedIds.includes(item.id) && <span className="text-white text-[10px]">✓</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate">{(item as any).title || (item as any).name}</p>
              {'artist_ids' in item && item.artist_ids?.length > 0 && (
                <p className="text-[11px] truncate" style={{ color: 'var(--am-text-3)' }}>
                  {item.artist_ids.length} artist(s)
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
