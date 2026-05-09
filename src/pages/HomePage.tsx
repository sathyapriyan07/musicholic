import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, fetchSongsWithArtists } from '@/lib/supabase'
import SongCard from '@/components/SongCard'
import ArtistCard from '@/components/ArtistCard'
import AlbumCard from '@/components/AlbumCard'
import Shelf from '@/components/Shelf'
import LoadingSpinner from '@/components/LoadingSpinner'
import YouTubeHeroPlayer from '@/components/YouTubeHeroPlayer'
import { extractYouTubeId } from '@/lib/utils'
import type { Song, Artist, Album } from '@/types'
import { Play } from 'lucide-react'

export default function HomePage() {
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(true)
  const [qualityIndex, setQualityIndex] = useState(0)
  const [heroIndex, setHeroIndex] = useState(0)
  const qualityOptions = ['hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium']

  useEffect(() => {
    async function fetchData() {
      try {
        const [featuredRes, recentRes, artistsRes, albumsRes] = await Promise.all([
          fetchSongsWithArtists({
            order: { column: 'created_at' },
            limit: 20,
            filter: (q) => q.eq('featured', true),
          }),
          fetchSongsWithArtists({ order: { column: 'created_at' }, limit: 20 }),
          supabase.from('artists').select('*').order('created_at', { ascending: false }).limit(12),
          supabase.from('albums').select('*, artist:artists(id, name, image)').order('created_at', { ascending: false }).limit(12),
        ])

        if (featuredRes.length) setFeaturedSongs(featuredRes)
        if (recentRes.length) setRecentSongs(recentRes)
        if (artistsRes.data) setArtists(artistsRes.data as unknown as Artist[])
        if (albumsRes.data) setAlbums(albumsRes.data as unknown as Album[])
      } catch (err) {
        console.error('Error fetching home data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const heroSongs = featuredSongs.filter(s => s.youtube_embed_url)

  if (loading) return <LoadingSpinner />

  const isEmpty = featuredSongs.length === 0 && artists.length === 0 && albums.length === 0

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'var(--am-surface-2)' }}>
          <svg viewBox="0 0 24 24" className="w-8 h-8" style={{ fill: 'var(--am-text-3)' }}>
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <p className="text-lg font-semibold mb-1">No music yet</p>
        <p className="text-[14px]" style={{ color: 'var(--am-text-2)' }}>Visit the admin panel to add songs, artists and albums</p>
      </div>
    )
  }

  return (
    <div>
      {/* Hero banner */}
      {heroSongs.length > 0 && (
        <div className="relative w-full aspect-video overflow-hidden mb-8">
          <YouTubeHeroPlayer
            key={heroIndex}
            videoId={extractYouTubeId(heroSongs[heroIndex].youtube_embed_url) || ''}
            muted={muted}
            quality={qualityOptions[qualityIndex]}
            qualityLabel={qualityOptions[qualityIndex] === 'hd2160' ? '4K' : qualityOptions[qualityIndex] === 'hd1440' ? '1440p' : qualityOptions[qualityIndex] === 'hd1080' ? '1080p' : qualityOptions[qualityIndex] === 'hd720' ? '720p' : qualityOptions[qualityIndex] === 'large' ? '480p' : '360p'}
            startSeconds={0}
            endSeconds={10}
            onEnd={() => setHeroIndex((heroIndex + 1) % heroSongs.length)}
            onToggleMute={() => setMuted(!muted)}
            onToggleQuality={() => setQualityIndex((qualityIndex + 1) % qualityOptions.length)}
          />
          <Link
            to={`/song/${heroSongs[heroIndex].id}`}
            className="absolute bottom-6 left-5 lg:left-8 z-10 flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            {heroSongs[heroIndex].cover ? (
              <img src={heroSongs[heroIndex].cover} alt={heroSongs[heroIndex].title} className="w-14 h-14 rounded-xl object-cover shadow-lg" />
            ) : (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'var(--am-surface-2)' }}>
                <svg viewBox="0 0 24 24" className="w-6 h-6" style={{ fill: 'var(--am-text-3)' }}>
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
            <div>
              <p className="text-sm font-bold leading-tight">{heroSongs[heroIndex].title}</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--am-text-2)' }}>
                {heroSongs[heroIndex].artists?.map(a => a.name).join(', ')}
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Page title */}
      <div className="px-5 lg:px-8 mb-8">
        <h1 className="text-[32px] font-bold tracking-tight">Listen Now</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--am-text-2)' }}>Your music, always ready</p>
      </div>

      {/* Featured grid */}
      {featuredSongs.length > 0 && (
        <div className="px-5 lg:px-8 mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {featuredSongs.slice(0, 6).map((song) => (
              <FeaturedSongRow key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      {/* Recently added shelf */}
      {recentSongs.length > 0 && (
        <Shelf title="Recently Added" href="/browse">
          {recentSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </Shelf>
      )}

      {/* Artists shelf */}
      {artists.length > 0 && (
        <Shelf title="Artists">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </Shelf>
      )}

      {/* Albums shelf */}
      {albums.length > 0 && (
        <Shelf title="New Releases" href="/browse">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </Shelf>
      )}
    </div>
  )
}

function FeaturedSongRow({ song }: { song: Song }) {
  return (
    <Link
      to={`/song/${song.id}`}
      className="group flex items-center gap-3 rounded-xl overflow-hidden transition-colors"
      style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}
    >
      {song.cover ? (
        <img src={song.cover} alt={song.title} className="w-14 h-14 object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center"
          style={{ background: 'var(--am-surface-2)' }}>
          <svg viewBox="0 0 24 24" className="w-6 h-6" style={{ fill: 'var(--am-text-3)' }}>
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0 py-2 pr-3">
        <p className="text-[13px] font-semibold truncate">{song.title}</p>
        {song.artists && (
          <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--am-text-2)' }}>
            {song.artists.map(a => a.name).join(', ')}
          </p>
        )}
      </div>
      <div className="pr-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <div className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'var(--am-accent)' }}>
          <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
        </div>
      </div>
    </Link>
  )
}
