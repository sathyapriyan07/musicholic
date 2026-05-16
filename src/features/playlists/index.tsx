import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/shared/ui/LoadingSpinner'
import { Plus, Music2, Trash2, ChevronLeft } from 'lucide-react'
import { SectionTitle, BodyText } from '@/shared/typography'
import { PageShell, PageContent } from '@/shared/layout'
import type { Playlist, Song, PlaylistSong } from '@/types'

export default function PlaylistsPage() {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [playlistSongs, setPlaylistSongs] = useState<PlaylistSong[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetchPlaylists()
  }, [user])

  async function fetchPlaylists() {
    if (!user) return
    const { data } = await supabase.from('playlists').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
    if (data) setPlaylists(data as Playlist[])
    setLoading(false)
  }

  async function selectPlaylist(playlist: Playlist) {
    setSelectedPlaylist(playlist)
    const { data } = await supabase
      .from('playlist_songs')
      .select('*, song:songs(*, artists:artists(id, name, image))')
      .eq('playlist_id', playlist.id)
      .order('position', { ascending: true })
    if (data) setPlaylistSongs(data as unknown as PlaylistSong[])
  }

  async function createPlaylist() {
    if (!user || !newName.trim()) return
    const { data } = await supabase.from('playlists').insert({ user_id: user.id, name: newName.trim(), description: newDesc.trim() || null } as any).select().single()
    if (data) {
      setPlaylists([data as Playlist, ...playlists])
      setShowCreate(false)
      setNewName('')
      setNewDesc('')
    }
  }

  async function deletePlaylist(id: string) {
    await supabase.from('playlist_songs').delete().eq('playlist_id', id)
    await supabase.from('playlists').delete().eq('id', id)
    setPlaylists(playlists.filter(p => p.id !== id))
    if (selectedPlaylist?.id === id) { setSelectedPlaylist(null); setPlaylistSongs([]) }
  }

  if (loading) return <LoadingSpinner />

  if (!user) {
    return (
      <PageShell>
        <PageContent>
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'var(--am-surface-2)' }}>
              <Music2 className="w-8 h-8" style={{ color: 'var(--am-text-3)' }} />
            </div>
            <SectionTitle className="mb-2">Your Library</SectionTitle>
            <BodyText muted className="mb-6">Sign in to create and manage playlists</BodyText>
            <Link to="/login" className="text-white font-semibold px-8 py-2.5 rounded-full hover:opacity-90 transition-opacity"
              style={{ background: 'var(--am-accent)' }}>
              Sign In
            </Link>
          </div>
        </PageContent>
      </PageShell>
    )
  }

  if (selectedPlaylist) {
    return (
      <PageShell>
        <PageContent className="py-8">
          <button
            onClick={() => { setSelectedPlaylist(null); setPlaylistSongs([]) }}
            className="flex items-center gap-1 px-5 lg:px-8 mb-6 text-[14px] font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--am-accent)' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Library
          </button>

          <div className="px-5 lg:px-8 mb-8 flex flex-col sm:flex-row items-start sm:items-end gap-6">
            <div className="w-48 h-48 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl"
              style={{ background: 'linear-gradient(135deg, var(--am-surface-2), var(--am-surface-3))' }}>
              <Music2 className="w-16 h-16" style={{ color: 'var(--am-text-3)' }} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--am-text-3)' }}>Playlist</p>
              <SectionTitle className="mb-2">{selectedPlaylist.name}</SectionTitle>
              {selectedPlaylist.description && (
                <BodyText muted className="mb-2">{selectedPlaylist.description}</BodyText>
              )}
              <p className="text-[13px]" style={{ color: 'var(--am-text-3)' }}>{playlistSongs.length} songs</p>
            </div>
          </div>

          {playlistSongs.length > 0 ? (
            <div className="px-5 lg:px-8">
              <div style={{ borderTop: '1px solid var(--am-divider)' }}>
                {playlistSongs.map((ps, i) => {
                  const song = ps.song as Song | undefined
                  if (!song) return null
                  return (
                    <Link
                      key={ps.id}
                      to={`/song/${song.id}`}
                      className="flex items-center gap-3 px-2 py-3 rounded-xl group transition-colors"
                      style={{ borderBottom: '1px solid var(--am-divider)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--am-surface)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <span className="w-6 text-center text-[12px] tabular-nums flex-shrink-0" style={{ color: 'var(--am-text-3)' }}>{i + 1}</span>
                      {song.cover ? (
                        <img src={song.cover} alt={song.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--am-surface-2)' }}>
                          <Music2 className="w-4 h-4" style={{ color: 'var(--am-text-3)' }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold truncate">{song.title}</p>
                        {song.artists && (
                          <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--am-text-2)' }}>
                            {(song.artists as any[]).map((a: any) => a.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : (
            <BodyText muted className="text-center py-10">This playlist is empty</BodyText>
          )}
        </PageContent>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageContent className="py-8">
        <div className="flex items-center justify-between mb-8 px-5 lg:px-8">
          <SectionTitle>Library</SectionTitle>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 text-white font-semibold px-4 py-2 rounded-full text-[13px] hover:opacity-90 transition-opacity"
            style={{ background: 'var(--am-accent)' }}
          >
            <Plus className="w-4 h-4" />
            New Playlist
          </button>
        </div>

        {showCreate && (
          <div className="mx-5 lg:mx-8 mb-6 rounded-2xl p-5 max-w-sm"
            style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}>
            <SectionTitle className="text-[17px] mb-4">New Playlist</SectionTitle>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name"
              className="w-full rounded-xl px-4 py-2.5 mb-3 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
              style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--am-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--am-border)')}
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full rounded-xl px-4 py-2.5 mb-4 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
              style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--am-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--am-border)')}
            />
            <div className="flex gap-3">
              <button onClick={createPlaylist} className="text-white font-semibold px-5 py-2 rounded-full text-[13px] hover:opacity-90"
                style={{ background: 'var(--am-accent)' }}>
                Create
              </button>
              <button onClick={() => setShowCreate(false)} className="text-[13px] font-medium hover:opacity-70 transition-opacity"
                style={{ color: 'var(--am-text-2)' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {playlists.length === 0 && !showCreate && (
          <div className="text-center py-20">
            <Music2 className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--am-text-3)' }} />
            <p className="text-[17px] font-semibold mb-1">No playlists yet</p>
            <BodyText muted>Create your first playlist to get started</BodyText>
          </div>
        )}

        {playlists.length > 0 && (
          <div className="px-5 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="group">
                  <div className="relative">
                    <button
                      onClick={() => selectPlaylist(playlist)}
                      className="w-full aspect-square rounded-2xl flex items-center justify-center transition-all group-hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, var(--am-surface-2), var(--am-surface-3))' }}
                    >
                      <Music2 className="w-10 h-10" style={{ color: 'var(--am-text-3)' }} />
                    </button>
                    <button
                      onClick={() => deletePlaylist(playlist.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      style={{ background: 'rgba(0,0,0,0.7)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                  <button onClick={() => selectPlaylist(playlist)} className="w-full text-left mt-2.5 px-0.5">
                    <p className="text-[13px] font-semibold truncate">{playlist.name}</p>
                    <p className="text-[11px] mt-0.5 uppercase tracking-wider font-medium" style={{ color: 'var(--am-text-3)' }}>Playlist</p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContent>
    </PageShell>
  )
}
