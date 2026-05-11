import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Trash2, Edit2, Music2, Upload, X, Search, List, Grid3x3 } from 'lucide-react'
import type { Song, Artist, Album, PlatformKey, ArtistPlatformKey } from '@/types'
import { PLATFORM_CONFIG, ARTIST_PLATFORM_CONFIG } from '@/types'
import { cn } from '@/lib/utils'
import { getYouTubeThumbnail } from '@/lib/utils'
import ITunesImport from './iTunesImport'
import BulkEdit from './BulkEdit'
import BulkLinkManager from './BulkLinkManager'
import SearchableSelect from '@/components/SearchableSelect'
import EditorialCms from './EditorialCms'

type AdminTab = 'songs' | 'artists' | 'albums' | 'itunes' | 'links' | 'editorial'

const inputClass = 'w-full rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]'
const inputStyle = { background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }
const inputFocus = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = 'var(--am-accent)')
const inputBlur = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = 'var(--am-border)')

function parseArtistNames(artistName: string): string[] {
  const separators = [' & ', ' feat. ', ' ft. ', ' featuring ', ', ', ' x ', ' + ']
  let names = [artistName]
  for (const sep of separators) {
    names = names.flatMap(n => n.split(sep).map(s => s.trim()).filter(Boolean))
  }
  return [...new Set(names)]
}

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AdminTab>('songs')
  const [songs, setSongs] = useState<Song[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [_loading, setLoading] = useState(true)
  const [editingSongId, setEditingSongId] = useState<string | null>(null)
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null)
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null)
  const [showNewSongForm, setShowNewSongForm] = useState(false)
  const [showNewArtistForm, setShowNewArtistForm] = useState(false)
  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false)
  const [songSearch, setSongSearch] = useState('')
  const [artistSearch, setArtistSearch] = useState('')
  const [albumSearch, setAlbumSearch] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/')
  }, [user, authLoading, isAdmin, navigate])

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  async function fetchData() {
    setLoading(true)
    const [songsRes, artistsRes, albumsRes, linksRes, songArtistsRes] = await Promise.all([
      supabase.from('songs').select('*').order('created_at', { ascending: false }),
      supabase.from('artists').select('*').order('name'),
      supabase.from('albums').select('*').order('created_at', { ascending: false }),
      supabase.from('links').select('*'),
      supabase.from('song_artists').select('*, artist:artists(id, name, image)').order('position'),
    ])

    const songs = (songsRes.data as unknown as Song[]) || []
    const artists = (artistsRes.data as unknown as Artist[]) || []
    const albums = (albumsRes.data as unknown as Album[]) || []
    const links = (linksRes.data as any[]) || []
    const songArtists = (songArtistsRes.data as any[]) || []

    const artistMap = new Map<string, Artist>()
    artists.forEach(a => artistMap.set(a.id, a))
    const albumMap = new Map<string, any>()
    albums.forEach(a => albumMap.set(a.id, a))
    const linksBySong = new Map<string, any[]>()
    links.forEach(l => {
      if (!linksBySong.has(l.song_id)) linksBySong.set(l.song_id, [])
      linksBySong.get(l.song_id)!.push(l)
    })
    const songArtistsBySong = new Map<string, any[]>()
    songArtists.forEach(sa => {
      if (!songArtistsBySong.has(sa.song_id)) songArtistsBySong.set(sa.song_id, [])
      songArtistsBySong.get(sa.song_id)!.push(sa)
    })

    const enrichedSongs = songs.map(s => ({
      ...s,
      artists: (s.artist_ids || []).map((id: string) => artistMap.get(id)).filter(Boolean),
      album: s.album_id ? albumMap.get(s.album_id) : null,
      links: linksBySong.get(s.id) || [],
      song_artists: songArtistsBySong.get(s.id) || [],
    }))

    setSongs(enrichedSongs as Song[])
    setArtists(artists)
    setAlbums(albums)
    setLoading(false)
  }

  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(songSearch.toLowerCase()) ||
    (s.artists as Artist[] | undefined)?.some(a => a.name.toLowerCase().includes(songSearch.toLowerCase()))
  )

  const filteredArtists = artists.filter(a =>
    a.name.toLowerCase().includes(artistSearch.toLowerCase())
  )

  const filteredAlbums = albums.filter(a =>
    a.title.toLowerCase().includes(albumSearch.toLowerCase()) ||
    (a.artist as Artist | undefined)?.name.toLowerCase().includes(albumSearch.toLowerCase())
  )

  if (authLoading || !user) return <LoadingSpinner />

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'songs', label: 'Songs' },
    { key: 'artists', label: 'Artists' },
    { key: 'albums', label: 'Albums' },
    { key: 'itunes', label: 'iTunes Import' },
    { key: 'links', label: 'Links' },
    { key: 'editorial', label: 'Editorial' },
  ]

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab)
    setShowNewSongForm(false)
    setShowNewArtistForm(false)
    setShowNewAlbumForm(false)
    setEditingSongId(null)
    setEditingArtistId(null)
    setEditingAlbumId(null)
  }

  return (
    <div className="py-8 px-5 lg:px-8 max-w-4xl">
      <h1 className="text-[32px] font-bold tracking-tight mb-8">Admin</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={cn('px-5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all')}
            style={activeTab === tab.key ? { background: 'var(--am-accent)', color: '#fff' } : { background: 'var(--am-surface-2)', color: 'var(--am-text-2)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'songs' && (
        <SongsTab songs={filteredSongs} artists={artists} albums={albums}
          editingSongId={editingSongId} setEditingSongId={setEditingSongId}
          showNewForm={showNewSongForm} setShowNewForm={setShowNewSongForm}
          onSaved={fetchData} search={songSearch} setSearch={setSongSearch} />
      )}
      {activeTab === 'artists' && (
        <ArtistsTab artists={filteredArtists}
          editingArtistId={editingArtistId} setEditingArtistId={setEditingArtistId}
          showNewForm={showNewArtistForm} setShowNewForm={setShowNewArtistForm}
          onSaved={fetchData} search={artistSearch} setSearch={setArtistSearch} />
      )}
      {activeTab === 'albums' && (
        <AlbumsTab albums={filteredAlbums} artists={artists}
          editingAlbumId={editingAlbumId} setEditingAlbumId={setEditingAlbumId}
          showNewForm={showNewAlbumForm} setShowNewForm={setShowNewAlbumForm}
          onSaved={fetchData} search={albumSearch} setSearch={setAlbumSearch} />
      )}
      {activeTab === 'itunes' && (
        <ITunesImport onImported={fetchData} />
      )}
      {activeTab === 'links' && (
        <BulkLinkManager songs={songs} albums={albums} onSaved={fetchData} />
      )}
      {activeTab === 'editorial' && (
        <EditorialCms />
      )}

      {activeTab === 'songs' && filteredSongs.length > 0 && (
        <BulkEdit type="song" items={songs} artists={artists} onSaved={fetchData} />
      )}
      {activeTab === 'albums' && filteredAlbums.length > 0 && (
        <BulkEdit type="album" items={albums} artists={artists} onSaved={fetchData} />
      )}
    </div>
  )
}

function SongsTab({ songs, artists, albums, editingSongId, setEditingSongId, showNewForm, setShowNewForm, onSaved, search, setSearch }: {
  songs: Song[]; artists: Artist[]; albums: Album[];
  editingSongId: string | null; setEditingSongId: (id: string | null) => void;
  showNewForm: boolean; setShowNewForm: (v: boolean) => void;
  onSaved: () => void; search: string; setSearch: (v: string) => void
}) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold">Songs <span className="text-[var(--am-text-3)] font-normal text-[16px]">({songs.length})</span></h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full overflow-hidden" style={{ background: 'var(--am-surface-2)' }}>
            <button onClick={() => setViewMode('list')} className="p-2 transition-all" style={viewMode === 'list' ? { background: 'var(--am-accent)', color: '#fff' } : {}}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className="p-2 transition-all" style={viewMode === 'grid' ? { background: 'var(--am-accent)', color: '#fff' } : {}}>
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => { setShowNewForm(!showNewForm); setEditingSongId(null) }} className="flex items-center gap-1.5 text-white font-semibold px-4 py-2 rounded-full text-[13px] hover:opacity-90"
            style={{ background: 'var(--am-accent)' }}>
            <Plus className="w-4 h-4" /> {showNewForm ? 'Close' : 'Add Song'}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search songs..."
        className="w-full mb-4 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
        style={inputStyle}
        onFocus={inputFocus}
        onBlur={inputBlur}
      />

      {showNewForm && (
        <div className="mb-6">
          <SongForm artists={artists} albums={albums} song={null}
            onDone={() => { setShowNewForm(false); onSaved() }} />
        </div>
      )}

      {viewMode === 'list' ? (
        <div>
          {songs.map((song, i) => {
            const isEditing = editingSongId === song.id
            const thumbnail = song.cover || getYouTubeThumbnail(song.youtube_embed_url)
            return (
              <div key={song.id}>
                <div className="flex items-center gap-3 py-3 group"
                  style={i < songs.length - 1 && !isEditing ? { borderBottom: '1px solid var(--am-divider)' } : {}}>
                  {thumbnail ? (
                    <img src={thumbnail} alt={song.title} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--am-surface-2)' }}>
                      <Music2 className="w-5 h-5" style={{ color: 'var(--am-text-3)' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate">{song.title}</p>
                    <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--am-text-2)' }}>
                      {song.song_artists && song.song_artists.length > 0
                        ? song.song_artists.map((sa: any) => `${sa.artist?.name || 'Unknown'}${sa.role !== 'primary' ? ` (${sa.role})` : ''}`).join(', ')
                        : (song.artists as Artist[] | undefined)?.map(a => a.name).join(', ') || 'No artist'}
                      {(() => { const a = song as any; return a.album?.title ? ` · ${a.album.title}` : null })()}
                    </p>
                  </div>
                  {(song.links as any)?.length > 0 && (
                    <span className="text-[11px] tabular-nums px-2 py-0.5 rounded-full" style={{ color: 'var(--am-text-3)', background: 'var(--am-surface-2)' }}>
                      {(song.links as any).length} links
                    </span>
                  )}
                  <button onClick={() => { setEditingSongId(isEditing ? null : song.id); setShowNewForm(false) }} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--am-text-2)' }}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { deleteSong(song.id); if (isEditing) setEditingSongId(null) }} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {isEditing && (
                  <div className="mb-4">
                    <SongForm artists={artists} albums={albums} song={song}
                      onDone={() => { setEditingSongId(null); onSaved() }} />
                  </div>
                )}
              </div>
            )
          })}
          {songs.length === 0 && <p className="text-center py-10 text-[14px]" style={{ color: 'var(--am-text-2)' }}>No songs yet</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map(song => {
            const isEditing = editingSongId === song.id
            const thumbnail = song.cover || getYouTubeThumbnail(song.youtube_embed_url)
            return (
              <div key={song.id} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                  {thumbnail ? (
                    <img src={thumbnail} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--am-surface-2)' }}>
                      <Music2 className="w-8 h-8" style={{ color: 'var(--am-text-3)' }} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => { setEditingSongId(isEditing ? null : song.id); setShowNewForm(false) }} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { deleteSong(song.id); if (isEditing) setEditingSongId(null) }} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[13px] font-semibold truncate">{song.title}</p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--am-text-2)' }}>
                  {(song.artists as Artist[] | undefined)?.map(a => a.name).join(', ') || 'No artist'}
                </p>
                {isEditing && (
                  <div className="mt-2">
                    <SongForm artists={artists} albums={albums} song={song}
                      onDone={() => { setEditingSongId(null); onSaved() }} />
                  </div>
                )}
              </div>
            )
          })}
          {songs.length === 0 && <p className="text-center py-10 text-[14px] col-span-full" style={{ color: 'var(--am-text-2)' }}>No songs yet</p>}
        </div>
      )}
    </div>
  )
}

function SongForm({ artists, albums, song, onDone }: {
  artists: Artist[]; albums: Album[]; song: Song | null; onDone: () => void
}) {
  const [title, setTitle] = useState(song?.title || '')
  const [cover, setCover] = useState(song?.cover || '')
  const [youtubeUrl, setYoutubeUrl] = useState(song?.youtube_embed_url || '')
  const [lyrics, setLyrics] = useState(song?.lyrics || '')
  const [songArtists, setSongArtists] = useState<{ artistId: string; role: string; position: number }[]>(() => {
    if (song?.song_artists && song.song_artists.length > 0) {
      return song.song_artists.map((sa: any) => ({
        artistId: sa.artist_id,
        role: sa.role || 'featured',
        position: sa.position || 0
      }))
    }
    return song?.artist_ids?.map((id, i) => ({ artistId: id, role: i === 0 ? 'primary' : 'featured', position: i })) || [{ artistId: '', role: 'primary', position: 0 }]
  })
  const [featured, setFeatured] = useState(song?.featured || false)
  const [showInDiscovery, setShowInDiscovery] = useState(song?.show_in_discovery || false)
  const [albumId, setAlbumId] = useState(song?.album_id || '')
  const [links, setLinks] = useState<{ platform: PlatformKey; url: string }[]>(() =>
    (song?.links || []).map((l: any) => ({ platform: l.platform as PlatformKey, url: l.url }))
  )
  const [loading, setLoading] = useState(false)
  const [itunesQuery, setItunesQuery] = useState('')
  const [itunesResults, setItunesResults] = useState<any[]>([])
  const [itunesSearching, setItunesSearching] = useState(false)
  const [albumItunesQuery, setAlbumItunesQuery] = useState('')
  const [albumItunesResults, setAlbumItunesResults] = useState<any[]>([])
  const [albumItunesSearching, setAlbumItunesSearching] = useState(false)

  async function searchItunes() {
    if (!itunesQuery.trim()) return
    setItunesSearching(true)
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(itunesQuery.trim())}&media=music&limit=10`)
      const data = await res.json()
      setItunesResults(data.results || [])
    } catch {
      setItunesResults([])
    }
    setItunesSearching(false)
  }

  async function selectItunesResult(r: any) {
    const hiRes = (r.artworkUrl100 || '').replace('/100x100', '/600x600')
    setCover(hiRes)
    if (r.trackName) setTitle(r.trackName)
    if (r.collectionName) {
      const existingAlbum = albums.find(a => a.title.toLowerCase() === r.collectionName.toLowerCase())
      if (existingAlbum) {
        setAlbumId(existingAlbum.id)
      }
    }

    if (r.artistName) {
      const names = parseArtistNames(r.artistName)
      const mapped = names.map((name, i) => ({ name, index: i }))

      for (const { name, index } of mapped) {
        const existingArtist = artists.find(a => a.name.toLowerCase() === name.toLowerCase())
        if (existingArtist) {
            setSongArtists(prev => {
              const has = prev.some(sa => sa.artistId === existingArtist.id)
              if (has) return prev
              return [...prev, { artistId: existingArtist.id, role: index === 0 ? 'primary' : 'featured', position: index }]
            })
            // Artist image intentionally not imported
        } else {
          const { data: newArtist } = await (supabase.from('artists') as any).insert({
            name,
            image: null,
          }).select().single()
          if (newArtist) {
            setSongArtists(prev => [...prev, { artistId: (newArtist as Artist).id, role: index === 0 ? 'primary' : 'featured', position: index }])
          }
        }
      }
    }
    setItunesResults([])
    setItunesQuery('')
  }

  async function searchAlbumItunes() {
    if (!albumItunesQuery.trim()) return
    setAlbumItunesSearching(true)
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(albumItunesQuery.trim())}&entity=album&limit=10`)
      const data = await res.json()
      setAlbumItunesResults(data.results || [])
    } catch {
      setAlbumItunesResults([])
    }
    setAlbumItunesSearching(false)
  }

  async function selectAlbumItunesResult(r: any) {
    const hiRes = (r.artworkUrl100 || '').replace('/100x100', '/600x600')
    const artistNames = parseArtistNames(r.artistName || '')

    // Upsert each artist
    for (const name of artistNames) {
      const existingArtist = artists.find(a => a.name.toLowerCase() === name.toLowerCase())
      if (existingArtist && !existingArtist.image) {
        // Artist image intentionally not imported
      }
      if (!existingArtist) {
        await (supabase.from('artists') as any).insert({
          name,
          image: null,
        })
      }
    }

    // Upsert album
    const { data: existingAlbum } = await supabase
      .from('albums')
      .select('*')
      .ilike('title', r.collectionName || '')
      .maybeSingle()

    if (existingAlbum) {
      setAlbumId((existingAlbum as any).id)
      await (supabase.from('albums') as any).update({ cover: hiRes }).eq('id', (existingAlbum as any).id)
    } else {
      let albumArtistId: string | null = null
      for (const name of artistNames) {
        const found = artists.find(a => a.name.toLowerCase() === name.toLowerCase())
        if (found) { albumArtistId = found.id; break }
      }

      if (!albumArtistId && artistNames.length > 0) {
        const { data: dbArtist } = await (supabase.from('artists') as any)
          .select('id').ilike('name', artistNames[0]).maybeSingle()
        if (dbArtist) albumArtistId = dbArtist.id
      }

      const { data: newAlbum } = await (supabase.from('albums') as any).insert({
        title: r.collectionName || 'Unknown Album',
        artist_id: albumArtistId,
        cover: hiRes,
      }).select().single()
      if (newAlbum) setAlbumId((newAlbum as Album).id)
    }

    setAlbumItunesResults([])
    setAlbumItunesQuery('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || songArtists.filter(sa => sa.artistId).length === 0) return
    setLoading(true)

    const artistIds = songArtists.filter(sa => sa.artistId).map(sa => sa.artistId)

    if (song) {
      await (supabase.from('songs') as any).update({
        title: title.trim(), cover: cover.trim() || null, youtube_embed_url: youtubeUrl.trim() || null,
        artist_ids: artistIds, album_id: albumId || null, lyrics: lyrics.trim() || null, featured, show_in_discovery: showInDiscovery
      }).eq('id', song.id)

      await supabase.from('song_artists').delete().eq('song_id', song.id)
      for (const [index, sa] of songArtists.filter(sa => sa.artistId).entries()) {
        await (supabase.from('song_artists') as any).insert({
          song_id: song.id, artist_id: sa.artistId, role: sa.role, position: index
        })
      }
      if (song.links) await supabase.from('links').delete().eq('song_id', song.id)
      for (const link of links) {
        if (link.url.trim()) await (supabase.from('links') as any).insert({ song_id: song.id, platform: link.platform, url: link.url.trim() })
      }
    } else {
      const { data } = await (supabase.from('songs') as any).insert({
        title: title.trim(), cover: cover.trim() || null, youtube_embed_url: youtubeUrl.trim() || null,
        artist_ids: artistIds, album_id: albumId || null, lyrics: lyrics.trim() || null, featured, show_in_discovery: showInDiscovery
      }).select().single()
      if (data) {
        for (const [index, sa] of songArtists.filter(sa => sa.artistId).entries()) {
          await (supabase.from('song_artists') as any).insert({
            song_id: (data as Song).id, artist_id: sa.artistId, role: sa.role, position: index
          })
        }
        for (const link of links) {
          if (link.url.trim()) await (supabase.from('links') as any).insert({ song_id: (data as Song).id, platform: link.platform, url: link.url.trim() })
        }
      }
    }
    onDone(); setLoading(false)
  }

  function addArtist() {
    setSongArtists([...songArtists, { artistId: '', role: 'featured', position: songArtists.length }])
  }

  function removeArtist(index: number) {
    setSongArtists(songArtists.filter((_, i) => i !== index))
  }

  function updateArtist(index: number, field: 'artistId' | 'role', value: string) {
    const updated = [...songArtists]
    updated[index] = { ...updated[index], [field]: value }
    setSongArtists(updated)
  }

  const artistOptions: { value: string; label: string }[] = artists.map(a => ({ value: a.id, label: a.name }))
  const albumOptions: { value: string; label: string }[] = albums.map(a => ({ value: a.id, label: a.title }))

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}>
      <h3 className="text-[17px] font-bold">{song ? 'Edit Song' : 'New Song'}</h3>
      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Song title" />
      </div>
      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Cover URL</label>
        <input type="url" value={cover} onChange={(e) => setCover(e.target.value)} className={inputClass} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="https://..." />
      </div>

      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Search iTunes for Cover</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={itunesQuery}
            onChange={(e) => setItunesQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchItunes())}
            className="flex-1 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
            style={inputStyle}
            onFocus={inputFocus}
            onBlur={inputBlur}
            placeholder="Song or album name..."
          />
          <button
            type="button"
            onClick={searchItunes}
            disabled={itunesSearching}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--am-accent)', color: '#fff' }}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {itunesResults.length > 0 && (
          <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
            {itunesResults.map((r: any, i: number) => (
              <button
                key={i}
                type="button"
                className="w-full flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-white/5 text-left"
                onClick={() => selectItunesResult(r)}
              >
                <img src={r.artworkUrl100} alt={r.trackName || r.collectionName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{r.trackName || r.collectionName}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--am-text-2)' }}>
                    {r.artistName}{r.collectionName && r.trackName ? ` · ${r.collectionName}` : ''}
                  </p>
                </div>
                <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: 'var(--am-accent)' }}>Use</span>
              </button>
            ))}
          </div>
        )}
        {itunesResults.length === 0 && itunesQuery.length > 0 && !itunesSearching && (
          <p className="mt-2 text-[12px] text-center" style={{ color: 'var(--am-text-3)' }}>No results found</p>
        )}
      </div>

      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>YouTube URL</label>
        <input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className={inputClass} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="https://www.youtube.com/watch?v=..." />
      </div>
      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Lyrics</label>
        <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} rows={4}
          className={`${inputClass} resize-none`} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
          placeholder="Enter song lyrics..." />
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)}
          className="w-4 h-4 rounded accent-[var(--am-accent)]" />
        <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'var(--am-text-3)' }}>Featured on Homepage</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={showInDiscovery} onChange={(e) => setShowInDiscovery(e.target.checked)}
          className="w-4 h-4 rounded accent-[var(--am-accent)]" />
        <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'var(--am-text-3)' }}>Show in Visual Discovery</span>
      </label>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'var(--am-text-3)' }}>Artists & Roles</label>
          <button type="button" onClick={addArtist}
            className="text-[12px] font-semibold flex items-center gap-1 hover:opacity-70" style={{ color: 'var(--am-accent)' }}>
            <Plus className="w-3 h-3" /> Add Artist
          </button>
        </div>
        {songArtists.map((sa, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <div className="flex-1">
              <SearchableSelect
                value={sa.artistId}
                onChange={(v) => updateArtist(i, 'artistId', v)}
                options={artistOptions}
                placeholder="Select artist"
                label="Artist"
              />
            </div>
            <input value={sa.role} onChange={(e) => updateArtist(i, 'role', e.target.value)}
              className="rounded-xl px-3 py-2 text-[13px] focus:outline-none w-28" style={inputStyle}
              placeholder="Role" />
            {songArtists.length > 1 && (
              <button type="button" onClick={() => removeArtist(i)} className="p-2 text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Album</label>
        <SearchableSelect
          value={albumId}
          onChange={setAlbumId}
          options={[{ value: '', label: 'No album' }, ...albumOptions]}
          placeholder="No album"
          label="Album"
        />
      </div>

      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Search iTunes for Album</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={albumItunesQuery}
            onChange={(e) => setAlbumItunesQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAlbumItunes())}
            className="flex-1 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
            style={inputStyle}
            onFocus={inputFocus}
            onBlur={inputBlur}
            placeholder="Album name..."
          />
          <button
            type="button"
            onClick={searchAlbumItunes}
            disabled={albumItunesSearching}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--am-accent)', color: '#fff' }}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {albumItunesResults.length > 0 && (
          <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
            {albumItunesResults.map((r: any, i: number) => (
              <button
                key={i}
                type="button"
                className="w-full flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-white/5 text-left"
                onClick={() => selectAlbumItunesResult(r)}
              >
                <img src={r.artworkUrl100} alt={r.collectionName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{r.collectionName}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--am-text-2)' }}>{r.artistName}</p>
                </div>
                <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: 'var(--am-accent)' }}>Assign</span>
              </button>
            ))}
          </div>
        )}
        {albumItunesResults.length === 0 && albumItunesQuery.length > 0 && !albumItunesSearching && (
          <p className="mt-2 text-[12px] text-center" style={{ color: 'var(--am-text-3)' }}>No results found</p>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'var(--am-text-3)' }}>Streaming Links</label>
          <button type="button" onClick={() => setLinks([...links, { platform: 'spotify', url: '' }])}
            className="text-[12px] font-semibold flex items-center gap-1 hover:opacity-70" style={{ color: 'var(--am-accent)' }}>
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {links.map((link, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <select value={link.platform} onChange={(e) => { const u = [...links]; u[i] = { ...u[i], platform: e.target.value as PlatformKey }; setLinks(u) }}
              className="rounded-xl px-3 py-2 text-[13px] focus:outline-none" style={inputStyle}>
              {Object.entries(PLATFORM_CONFIG).map(([key, config]) => <option key={key} value={key}>{config.name}</option>)}
            </select>
            <input type="url" value={link.url} onChange={(e) => { const u = [...links]; u[i] = { ...u[i], url: e.target.value }; setLinks(u) }}
              className="flex-1 rounded-xl px-4 py-2 text-[13px] focus:outline-none" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="https://..." />
            <button type="button" onClick={() => setLinks(links.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading} className="text-white font-semibold px-6 py-2 rounded-full text-[13px] hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--am-accent)' }}>
          {loading ? 'Saving…' : song ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onDone} className="text-[13px] font-medium hover:opacity-70 px-3" style={{ color: 'var(--am-text-2)' }}>Cancel</button>
      </div>
    </form>
  )
}

async function deleteSong(id: string) {
  await supabase.from('song_artists').delete().eq('song_id', id)
  await supabase.from('links').delete().eq('song_id', id)
  await supabase.from('songs').delete().eq('id', id)
}

function ArtistsTab({ artists, editingArtistId, setEditingArtistId, showNewForm, setShowNewForm, onSaved, search, setSearch }: {
  artists: Artist[];
  editingArtistId: string | null; setEditingArtistId: (id: string | null) => void;
  showNewForm: boolean; setShowNewForm: (v: boolean) => void;
  onSaved: () => void; search: string; setSearch: (v: string) => void
}) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold">Artists <span className="text-[var(--am-text-3)] font-normal text-[16px]">({artists.length})</span></h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full overflow-hidden" style={{ background: 'var(--am-surface-2)' }}>
            <button onClick={() => setViewMode('list')} className="p-2 transition-all" style={viewMode === 'list' ? { background: 'var(--am-accent)', color: '#fff' } : {}}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className="p-2 transition-all" style={viewMode === 'grid' ? { background: 'var(--am-accent)', color: '#fff' } : {}}>
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => { setShowNewForm(!showNewForm); setEditingArtistId(null) }} className="flex items-center gap-1.5 text-white font-semibold px-4 py-2 rounded-full text-[13px] hover:opacity-90"
            style={{ background: 'var(--am-accent)' }}>
            <Plus className="w-4 h-4" /> {showNewForm ? 'Close' : 'Add Artist'}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search artists..."
        className="w-full mb-4 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
        style={inputStyle}
        onFocus={inputFocus}
        onBlur={inputBlur}
      />

      {showNewForm && (
        <div className="mb-6">
          <ArtistForm artist={null} onDone={() => { setShowNewForm(false); onSaved() }} />
        </div>
      )}

      {viewMode === 'list' ? (
        <div>
          {artists.map((artist, i) => {
            const isEditing = editingArtistId === artist.id
            return (
              <div key={artist.id}>
                <div className="flex items-center gap-3 py-3 group"
                  style={i < artists.length - 1 && !isEditing ? { borderBottom: '1px solid var(--am-divider)' } : {}}>
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--am-surface-2)' }}>
                      <svg viewBox="0 0 24 24" className="w-6 h-6" style={{ fill: 'var(--am-text-3)' }}>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate">{artist.name}</p>
                    {artist.bio && <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--am-text-2)' }}>{artist.bio}</p>}
                  </div>
                  <button onClick={() => { setEditingArtistId(isEditing ? null : artist.id); setShowNewForm(false) }} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--am-text-2)' }}><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => { deleteArtist(artist.id); if (isEditing) setEditingArtistId(null) }} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
                {isEditing && (
                  <div className="mb-4">
                    <ArtistForm artist={artist} onDone={() => { setEditingArtistId(null); onSaved() }} />
                  </div>
                )}
              </div>
            )
          })}
          {artists.length === 0 && <p className="text-center py-10 text-[14px]" style={{ color: 'var(--am-text-2)' }}>No artists yet</p>}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {artists.map(artist => {
            const isEditing = editingArtistId === artist.id
            return (
              <div key={artist.id} className="group text-center">
                <div className="relative aspect-square rounded-full overflow-hidden mb-2 mx-auto w-24 h-24">
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--am-surface-2)' }}>
                      <svg viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: 'var(--am-text-3)' }}>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-full flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => { setEditingArtistId(isEditing ? null : artist.id); setShowNewForm(false) }} className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { deleteArtist(artist.id); if (isEditing) setEditingArtistId(null) }} className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[13px] font-semibold truncate">{artist.name}</p>
                {artist.bio && <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--am-text-2)' }}>{artist.bio}</p>}
                {isEditing && (
                  <div className="mt-2">
                    <ArtistForm artist={artist} onDone={() => { setEditingArtistId(null); onSaved() }} />
                  </div>
                )}
              </div>
            )
          })}
          {artists.length === 0 && <p className="text-center py-10 text-[14px] col-span-full" style={{ color: 'var(--am-text-2)' }}>No artists yet</p>}
        </div>
      )}
    </div>
  )
}

function ArtistForm({ artist, onDone }: { artist: Artist | null; onDone: () => void }) {
  const [name, setName] = useState(artist?.name || '')
  const [image, setImage] = useState(artist?.image || '')
  const [bio, setBio] = useState(artist?.bio || '')
  const [artistLinks, setArtistLinks] = useState<{ platform: ArtistPlatformKey; url: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (artist) fetchArtistLinks(artist.id)
  }, [])

  async function fetchArtistLinks(artistId: string) {
    const { data } = await supabase.from('artist_links').select('*').eq('artist_id', artistId)
    if (data) {
      setArtistLinks(data.map((l: any) => ({ platform: l.platform as ArtistPlatformKey, url: l.url })))
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage.from('artist-images').upload(fileName, file)
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('artist-images').getPublicUrl(data.path)
      setImage(publicUrl)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    if (artist) {
      await (supabase.from('artists') as any).update({
        name: name.trim(),
        image: image.trim() || null,
        bio: bio.trim() || null
      }).eq('id', artist.id)

      await supabase.from('artist_links').delete().eq('artist_id', artist.id)
      for (const link of artistLinks) {
        if (link.url.trim()) {
          await (supabase.from('artist_links') as any).insert({
            artist_id: artist.id,
            platform: link.platform,
            url: link.url.trim()
          })
        }
      }
    } else {
      const { data } = await (supabase.from('artists') as any).insert({
        name: name.trim(),
        image: image.trim() || null,
        bio: bio.trim() || null
      }).select().single()

      if (data) {
        for (const link of artistLinks) {
          if (link.url.trim()) {
            await (supabase.from('artist_links') as any).insert({
              artist_id: (data as Artist).id,
              platform: link.platform,
              url: link.url.trim()
            })
          }
        }
      }
    }
    onDone(); setLoading(false)
  }

  function addArtistLink() {
    setArtistLinks([...artistLinks, { platform: 'spotify', url: '' }])
  }

  function removeArtistLink(index: number) {
    setArtistLinks(artistLinks.filter((_, i) => i !== index))
  }

  function updateArtistLink(index: number, field: 'platform' | 'url', value: string) {
    const updated = [...artistLinks]
    updated[index] = { ...updated[index], [field]: value }
    setArtistLinks(updated)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}>
      <h3 className="text-[17px] font-bold">{artist ? 'Edit Artist' : 'New Artist'}</h3>

      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Artist name" />
      </div>

      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Image</label>
        <div className="flex gap-3 items-start">
          {image && (
            <div className="relative flex-shrink-0">
              <img src={image} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
              <button
                type="button"
                onClick={() => setImage('')}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] hover:bg-red-400"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex-1">
            <input type="url" value={image} onChange={(e) => setImage(e.target.value)} className={inputClass} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Image URL" />
            <div className="mt-2">
              <label className="cursor-pointer text-[12px] font-semibold flex items-center gap-1 hover:opacity-70" style={{ color: 'var(--am-accent)' }}>
                <Upload className="w-3 h-3" />
                <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
          className={`${inputClass} resize-none`} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
          placeholder="Artist biography..." />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'var(--am-text-3)' }}>Artist Links</label>
          <button type="button" onClick={addArtistLink}
            className="text-[12px] font-semibold flex items-center gap-1 hover:opacity-70" style={{ color: 'var(--am-accent)' }}>
            <Plus className="w-3 h-3" /> Add Link
          </button>
        </div>
        {artistLinks.map((link, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <select value={link.platform} onChange={(e) => updateArtistLink(i, 'platform', e.target.value)}
              className="rounded-xl px-3 py-2 text-[13px] focus:outline-none" style={inputStyle}>
              {Object.entries(ARTIST_PLATFORM_CONFIG).map(([key, config]: [string, any]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
            <input type="url" value={link.url} onChange={(e) => updateArtistLink(i, 'url', e.target.value)}
              className="flex-1 rounded-xl px-4 py-2 text-[13px] focus:outline-none" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="https://..." />
            <button type="button" onClick={() => removeArtistLink(i)} className="p-2 text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading || uploading} className="text-white font-semibold px-6 py-2 rounded-full text-[13px] hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--am-accent)' }}>
          {loading ? 'Saving…' : artist ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onDone} className="text-[13px] font-medium hover:opacity-70 px-3" style={{ color: 'var(--am-text-2)' }}>Cancel</button>
      </div>
    </form>
  )
}

async function deleteArtist(id: string) {
  await supabase.from('artist_links').delete().eq('artist_id', id)
  await supabase.from('artists').delete().eq('id', id)
}

function AlbumsTab({ albums, artists, editingAlbumId, setEditingAlbumId, showNewForm, setShowNewForm, onSaved, search, setSearch }: {
  albums: Album[]; artists: Artist[];
  editingAlbumId: string | null; setEditingAlbumId: (id: string | null) => void;
  showNewForm: boolean; setShowNewForm: (v: boolean) => void;
  onSaved: () => void; search: string; setSearch: (v: string) => void
}) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold">Albums <span className="text-[var(--am-text-3)] font-normal text-[16px]">({albums.length})</span></h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full overflow-hidden" style={{ background: 'var(--am-surface-2)' }}>
            <button onClick={() => setViewMode('list')} className="p-2 transition-all" style={viewMode === 'list' ? { background: 'var(--am-accent)', color: '#fff' } : {}}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className="p-2 transition-all" style={viewMode === 'grid' ? { background: 'var(--am-accent)', color: '#fff' } : {}}>
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => { setShowNewForm(!showNewForm); setEditingAlbumId(null) }} className="flex items-center gap-1.5 text-white font-semibold px-4 py-2 rounded-full text-[13px] hover:opacity-90"
            style={{ background: 'var(--am-accent)' }}>
            <Plus className="w-4 h-4" /> {showNewForm ? 'Close' : 'Add Album'}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search albums..."
        className="w-full mb-4 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
        style={inputStyle}
        onFocus={inputFocus}
        onBlur={inputBlur}
      />

      {showNewForm && (
        <div className="mb-6">
          <AlbumForm artists={artists} album={null} onDone={() => { setShowNewForm(false); onSaved() }} />
        </div>
      )}

      {viewMode === 'list' ? (
        <div>
          {albums.map((album, i) => {
            const isEditing = editingAlbumId === album.id
            return (
              <div key={album.id}>
                <div className="flex items-center gap-3 py-3 group"
                  style={i < albums.length - 1 && !isEditing ? { borderBottom: '1px solid var(--am-divider)' } : {}}>
                  {album.cover ? (
                    <img src={album.cover} alt={album.title} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--am-surface-2)' }}>
                      <Music2 className="w-5 h-5" style={{ color: 'var(--am-text-3)' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate">{album.title}</p>
                    <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--am-text-2)' }}>{(album.artist as Artist | undefined)?.name || 'Unknown'}</p>
                  </div>
                  <button onClick={() => { setEditingAlbumId(isEditing ? null : album.id); setShowNewForm(false) }} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--am-text-2)' }}><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => { deleteAlbum(album.id); if (isEditing) setEditingAlbumId(null) }} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
                {isEditing && (
                  <div className="mb-4">
                    <AlbumForm artists={artists} album={album} onDone={() => { setEditingAlbumId(null); onSaved() }} />
                  </div>
                )}
              </div>
            )
          })}
          {albums.length === 0 && <p className="text-center py-10 text-[14px]" style={{ color: 'var(--am-text-2)' }}>No albums yet</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map(album => {
            const isEditing = editingAlbumId === album.id
            return (
              <div key={album.id} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                  {album.cover ? (
                    <img src={album.cover} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--am-surface-2)' }}>
                      <Music2 className="w-8 h-8" style={{ color: 'var(--am-text-3)' }} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => { setEditingAlbumId(isEditing ? null : album.id); setShowNewForm(false) }} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { deleteAlbum(album.id); if (isEditing) setEditingAlbumId(null) }} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[13px] font-semibold truncate">{album.title}</p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--am-text-2)' }}>{(album.artist as Artist | undefined)?.name || 'Unknown'}</p>
                {isEditing && (
                  <div className="mt-2">
                    <AlbumForm artists={artists} album={album} onDone={() => { setEditingAlbumId(null); onSaved() }} />
                  </div>
                )}
              </div>
            )
          })}
          {albums.length === 0 && <p className="text-center py-10 text-[14px] col-span-full" style={{ color: 'var(--am-text-2)' }}>No albums yet</p>}
        </div>
      )}
    </div>
  )
}

function AlbumForm({ artists, album, onDone }: { artists: Artist[]; album: Album | null; onDone: () => void }) {
  const [title, setTitle] = useState(album?.title || '')
  const [cover, setCover] = useState(album?.cover || '')
  const [artistId, setArtistId] = useState(album?.artist_id || '')
  const [loading, setLoading] = useState(false)
  const [itunesQuery, setItunesQuery] = useState('')
  const [itunesResults, setItunesResults] = useState<any[]>([])
  const [itunesSearching, setItunesSearching] = useState(false)
  const [links, setLinks] = useState<{ platform: PlatformKey; url: string }[]>([])

  useEffect(() => {
    if (album) fetchAlbumLinks(album.id)
  }, [])

  async function fetchAlbumLinks(albumId: string) {
    const { data } = await supabase.from('links').select('*').eq('album_id', albumId)
    if (data) {
      setLinks(data.map((l: any) => ({ platform: l.platform as PlatformKey, url: l.url })))
    }
  }

  async function searchItunes() {
    if (!itunesQuery.trim()) return
    setItunesSearching(true)
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(itunesQuery.trim())}&entity=album&limit=10`)
      const data = await res.json()
      setItunesResults(data.results || [])
    } catch {
      setItunesResults([])
    }
    setItunesSearching(false)
  }

  async function selectItunesResult(r: any) {
    const hiRes = (r.artworkUrl100 || '').replace('/100x100', '/600x600')
    setCover(hiRes)
    if (r.collectionName) setTitle(r.collectionName)

    if (r.artistName) {
      const names = parseArtistNames(r.artistName)
      const savedIds: string[] = []

      for (const name of names) {
        const existingArtist = artists.find(a => a.name.toLowerCase() === name.toLowerCase())
        if (existingArtist) {
          savedIds.push(existingArtist.id)
          // Artist image intentionally not imported
        } else {
          const { data } = await (supabase.from('artists') as any).insert({
            name,
            image: null,
          }).select().single()
          if (data) savedIds.push((data as Artist).id)
        }
      }

      if (savedIds.length > 0) {
        setArtistId(savedIds[0])
      }
    }
    setItunesResults([])
    setItunesQuery('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !artistId) return
    setLoading(true)
    if (album) {
      await (supabase.from('albums') as any).update({ title: title.trim(), cover: cover.trim() || null, artist_id: artistId }).eq('id', album.id)
      await supabase.from('links').delete().eq('album_id', album.id)
      for (const link of links) {
        if (link.url.trim()) await (supabase.from('links') as any).insert({ album_id: album.id, platform: link.platform, url: link.url.trim() })
      }
    } else {
      const { data } = await (supabase.from('albums') as any).insert({ title: title.trim(), cover: cover.trim() || null, artist_id: artistId }).select().single()
      if (data) {
        for (const link of links) {
          if (link.url.trim()) await (supabase.from('links') as any).insert({ album_id: (data as Album).id, platform: link.platform, url: link.url.trim() })
        }
      }
    }
    onDone(); setLoading(false)
  }

  const artistOptions: { value: string; label: string }[] = artists.map(a => ({ value: a.id, label: a.name }))

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}>
      <h3 className="text-[17px] font-bold">{album ? 'Edit Album' : 'New Album'}</h3>
      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Album title" />
      </div>

      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Search iTunes</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={itunesQuery}
            onChange={(e) => setItunesQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchItunes())}
            className="flex-1 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
            style={inputStyle}
            onFocus={inputFocus}
            onBlur={inputBlur}
            placeholder="Album name..."
          />
          <button
            type="button"
            onClick={searchItunes}
            disabled={itunesSearching}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--am-accent)', color: '#fff' }}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {itunesResults.length > 0 && (
          <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
            {itunesResults.map((r: any, i: number) => (
              <button
                key={i}
                type="button"
                className="w-full flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-white/5 text-left"
                onClick={() => selectItunesResult(r)}
              >
                <img src={r.artworkUrl100} alt={r.collectionName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{r.collectionName}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--am-text-2)' }}>{r.artistName}</p>
                </div>
                <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: 'var(--am-accent)' }}>Use</span>
              </button>
            ))}
          </div>
        )}
        {itunesResults.length === 0 && itunesQuery.length > 0 && !itunesSearching && (
          <p className="mt-2 text-[12px] text-center" style={{ color: 'var(--am-text-3)' }}>No results found</p>
        )}
      </div>

      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Cover URL</label>
        <input type="url" value={cover} onChange={(e) => setCover(e.target.value)} className={inputClass} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="https://..." />
      </div>

      <div>
        <label className="block text-[12px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--am-text-3)' }}>Artist</label>
        <SearchableSelect
          value={artistId}
          onChange={setArtistId}
          options={artistOptions}
          placeholder="Select artist"
          label="Artist"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'var(--am-text-3)' }}>Streaming Links</label>
          <button type="button" onClick={() => setLinks([...links, { platform: 'spotify', url: '' }])}
            className="text-[12px] font-semibold flex items-center gap-1 hover:opacity-70" style={{ color: 'var(--am-accent)' }}>
            <Plus className="w-3 h-3" /> Add Link
          </button>
        </div>
        {links.map((link, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <select value={link.platform} onChange={(e) => { const u = [...links]; u[i] = { ...u[i], platform: e.target.value as PlatformKey }; setLinks(u) }}
              className="rounded-xl px-3 py-2 text-[13px] focus:outline-none" style={inputStyle}>
              {Object.entries(PLATFORM_CONFIG).map(([key, config]) => <option key={key} value={key}>{config.name}</option>)}
            </select>
            <input type="url" value={link.url} onChange={(e) => { const u = [...links]; u[i] = { ...u[i], url: e.target.value }; setLinks(u) }}
              className="flex-1 rounded-xl px-4 py-2 text-[13px] focus:outline-none" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="https://..." />
            <button type="button" onClick={() => setLinks(links.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading} className="text-white font-semibold px-6 py-2 rounded-full text-[13px] hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--am-accent)' }}>
          {loading ? 'Saving…' : album ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onDone} className="text-[13px] font-medium hover:opacity-70 px-3" style={{ color: 'var(--am-text-2)' }}>Cancel</button>
      </div>
    </form>
  )
}

async function deleteAlbum(id: string) { await supabase.from('albums').delete().eq('id', id) }
