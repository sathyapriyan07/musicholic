import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Song, PlatformKey } from '@/types'
import { PLATFORM_CONFIG } from '@/types'
import { getYouTubeThumbnail } from '@/lib/utils'
import { Music2, Plus } from 'lucide-react'

interface BulkLinkManagerProps {
  songs: Song[]
  onSaved: () => void
}

export default function BulkLinkManager({ songs, onSaved }: BulkLinkManagerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [links, setLinks] = useState<{ platform: PlatformKey; url: string }[]>([{ platform: 'spotify', url: '' }])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState<'add' | 'delete'>('add')
  const [platformToDelete, setPlatformToDelete] = useState<PlatformKey>('spotify')

  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.artists as any[] | undefined)?.some(a => a.name.toLowerCase().includes(search.toLowerCase()))
  )

  function toggleSelect(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function selectAll() {
    if (selectedIds.length === filteredSongs.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredSongs.map(i => i.id))
    }
  }

  function addLink() {
    setLinks([...links, { platform: 'spotify', url: '' }])
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index))
  }

  function updateLink(index: number, field: 'platform' | 'url', value: string) {
    const updated = [...links]
    updated[index] = { ...updated[index], [field]: value }
    setLinks(updated)
  }

  async function handleAction() {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      if (action === 'add') {
        const validLinks = links.filter(l => l.url.trim())
        for (const songId of selectedIds) {
          for (const link of validLinks) {
            await (supabase.from('links') as any).insert({
              song_id: songId,
              platform: link.platform,
              url: link.url.trim(),
            })
          }
        }
      } else if (action === 'delete') {
        for (const songId of selectedIds) {
          await (supabase.from('links') as any).delete().eq('song_id', songId).eq('platform', platformToDelete)
        }
      }
      onSaved()
      setSelectedIds([])
      setLinks([{ platform: 'spotify', url: '' }])
    } catch (e) {
      console.error('Bulk link action failed', e)
    }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl p-5 mb-8" style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}>
      <h3 className="text-[17px] font-bold mb-4">Bulk Link Manager</h3>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as 'add' | 'delete')}
          className="rounded-xl px-3 py-2 text-[13px] focus:outline-none"
          style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
        >
          <option value="add">Add Links</option>
          <option value="delete">Delete Links by Platform</option>
        </select>

        {action === 'add' && (
          <div className="w-full space-y-2 mt-2">
            {links.map((link, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={link.platform}
                  onChange={(e) => updateLink(i, 'platform', e.target.value)}
                  className="rounded-xl px-3 py-2 text-[13px] focus:outline-none"
                  style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
                >
                  {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(i, 'url', e.target.value)}
                  className="flex-1 rounded-xl px-4 py-2 text-[13px] focus:outline-none"
                  style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
                  placeholder="https://..."
                />
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addLink}
              className="text-[12px] font-semibold flex items-center gap-1"
              style={{ color: 'var(--am-accent)' }}
            >
              <Plus className="w-3 h-3" /> Add Another Link
            </button>
          </div>
        )}

        {action === 'delete' && (
          <select
            value={platformToDelete}
            onChange={(e) => setPlatformToDelete(e.target.value as PlatformKey)}
            className="rounded-xl px-3 py-2 text-[13px] focus:outline-none"
            style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
          >
            {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
        )}

        <button
          onClick={handleAction}
          disabled={selectedIds.length === 0 || loading || (action === 'add' && !links.some(l => l.url.trim()))}
          className="px-4 py-2 rounded-full text-[13px] font-semibold text-white disabled:opacity-50"
          style={{ background: action === 'delete' ? '#ef4444' : 'var(--am-accent)' }}
        >
          {loading ? 'Processing...' : `Apply to ${selectedIds.length} song(s)`}
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search songs..."
        className="w-full mb-4 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
        style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
      />

      <div className="mb-3 flex items-center justify-between">
        <div>
          <button
            onClick={selectAll}
            className="text-[12px] font-semibold hover:opacity-70"
            style={{ color: 'var(--am-accent)' }}
          >
            {selectedIds.length === filteredSongs.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-[12px] ml-3" style={{ color: 'var(--am-text-3)' }}>
            {selectedIds.length} of {filteredSongs.length} selected
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
        {filteredSongs.map(song => {
          const thumbnail = song.cover || getYouTubeThumbnail(song.youtube_embed_url)
          const songLinks = (song as any).links || []
          return (
            <div
              key={song.id}
              onClick={() => toggleSelect(song.id)}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
              style={{
                background: selectedIds.includes(song.id) ? 'var(--am-surface-3)' : 'var(--am-surface-2)',
                border: `1px solid ${selectedIds.includes(song.id) ? 'var(--am-accent)' : 'transparent'}`,
              }}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                selectedIds.includes(song.id) ? 'bg-[var(--am-accent)] border-[var(--am-accent)]' : 'border-[var(--am-text-3)]'
              }`}>
                {selectedIds.includes(song.id) && <span className="text-white text-[10px]">✓</span>}
              </div>
              {thumbnail ? (
                <img src={thumbnail} alt={song.title} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--am-surface-2)' }}>
                  <Music2 className="w-5 h-5" style={{ color: 'var(--am-text-3)' }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate">{song.title}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--am-text-3)' }}>
                  {(song.artists as any[] | undefined)?.map(a => a.name).join(', ') || 'No artist'}
                  {songLinks.length > 0 ? ` · ${songLinks.length} link(s)` : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
