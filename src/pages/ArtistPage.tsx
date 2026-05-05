import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import SongCard from '@/components/SongCard'
import AlbumCard from '@/components/AlbumCard'
import Shelf from '@/components/Shelf'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Artist, Song, Album, ArtistLink } from '@/types'
import { ARTIST_PLATFORM_CONFIG } from '@/types'

// Re-declare to fix import issue
const platformConfig = ARTIST_PLATFORM_CONFIG

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [artistLinks, setArtistLinks] = useState<ArtistLink[]>([])
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      setLoading(true)
      const { data: artistData } = await supabase.from('artists').select('*').eq('id', id).single()
      const songsData = await fetchSongsWithArtists({
        filter: (q: any) => q.contains('artist_ids', [id]).order('created_at', { ascending: false }),
      })
      const { data: albumsData } = await supabase
        .from('albums')
        .select('*, artist:artists(id, name, image)')
        .eq('artist_id', id)
        .order('created_at', { ascending: false })
      const { data: linksData } = await supabase
        .from('artist_links')
        .select('*')
        .eq('artist_id', id)

      if (artistData) setArtist(artistData as unknown as Artist)
      setSongs(songsData)
      if (albumsData) setAlbums(albumsData as unknown as Album[])
      if (linksData) setArtistLinks(linksData as unknown as ArtistLink[])

      // Fetch related artists (artists who appear on same songs)
      if (id) {
        const { data: songArtistsData } = await supabase
          .from('song_artists')
          .select('song_id')
          .eq('artist_id', id)
        
        if (songArtistsData && songArtistsData.length > 0) {
          const songIds = songArtistsData.map((sa: any) => sa.song_id)
          
          const { data: relatedData } = await supabase
            .from('song_artists')
            .select('artist_id, artist:artists(id, name, image)')
            .in('song_id', songIds)
            .neq('artist_id', id)
          
          if (relatedData) {
            const artistMap = new Map<string, Artist>()
            relatedData.forEach((item: any) => {
              if (item.artist && !artistMap.has(item.artist.id)) {
                artistMap.set(item.artist.id, item.artist as Artist)
              }
            })
            setRelatedArtists(Array.from(artistMap.values()))
          }
        }
      }
      
      setLoading(false)
    }
    fetchData()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!artist) return <div className="px-6 py-20 text-center" style={{ color: 'var(--am-text-2)' }}>Artist not found</div>

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden">
        {artist.image ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${artist.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'top',
            }}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'var(--am-surface-2)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 50%, var(--am-bg) 100%)' }} />

        <div className="relative z-10 px-5 lg:px-8 pt-32 pb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 leading-tight" style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{artist.name}</h1>
            <p className="text-[14px] mb-3" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
              {albums.length > 0 && ` · ${albums.length} ${albums.length === 1 ? 'album' : 'albums'}`}
            </p>
            {artist.bio && (
              <p className="text-[14px] leading-relaxed max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{artist.bio}</p>
            )}
          </div>
        </div>
      </div>

      {artistLinks.length > 0 && (
        <div className="px-5 lg:px-8 py-4">
              <div className="flex flex-wrap gap-3">
              {artistLinks.map((link) => {
                const config = platformConfig[link.platform as keyof typeof platformConfig]
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-[11px] font-semibold transition-opacity hover:opacity-80 bg-transparent border"
                    style={{ borderColor: 'var(--am-border)' }}
                  >
                    {config?.logo && (
                      <img src={config.logo} alt={config.name} className="w-5 h-5 object-contain" />
                    )}
                    <span style={{ color: 'var(--am-text-2)' }}>{config?.name || link.platform}</span>
                  </a>
                )
              })}
            </div>
        </div>
      )}

      {songs.length > 0 && (
        <Shelf title="Songs">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </Shelf>
      )}

      {albums.length > 0 && (
        <Shelf title="Albums">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} showArtist={false} />
          ))}
        </Shelf>
      )}

      {relatedArtists.length > 0 && (
        <Shelf title="Related Artists">
          {relatedArtists.map((artist) => (
            <div key={artist.id} className="flex-shrink-0 w-36">
              <Link to={`/artist/${artist.id}`} className="block group">
                <div className="w-36 h-36 rounded-full overflow-hidden mb-2">
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--am-surface-2)' }}>
                      <svg viewBox="0 0 24 24" className="w-12 h-12" style={{ fill: 'var(--am-text-3)' }}>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-[13px] font-semibold truncate text-center">{artist.name}</p>
              </Link>
            </div>
          ))}
        </Shelf>
      )}

      {songs.length === 0 && albums.length === 0 && (
        <p className="text-center py-10 text-[14px]" style={{ color: 'var(--am-text-2)' }}>No content yet</p>
      )}
    </div>
  )
}
