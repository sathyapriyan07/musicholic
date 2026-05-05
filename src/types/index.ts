export interface Artist {
  id: string
  name: string
  image: string | null
  bio: string | null
  created_at: string
  links?: ArtistLink[]
}

export interface Album {
  id: string
  title: string
  cover: string | null
  artist_id: string
  created_at: string
  artist?: Artist
}

export interface Song {
  id: string
  title: string
  cover: string | null
  youtube_embed_url: string | null
  artist_ids: string[]
  album_id: string | null
  lyrics: string | null
  created_at: string
  artists?: Artist[]
  album?: Album
  links?: Link[]
  song_artists?: SongArtist[]
}

export interface Link {
  id: string
  song_id: string | null
  album_id: string | null
  platform: 'spotify' | 'youtube_music' | 'apple_music' | 'jiosaavn' | 'gaana' | 'amazon_music'
  url: string
  created_at: string
}

export interface ArtistLink {
  id: string
  artist_id: string
  platform: 'spotify' | 'youtube_music' | 'apple_music' | 'jiosaavn' | 'gaana' | 'amazon_music' | 'youtube'
  url: string
  created_at: string
}

export interface SongArtist {
  id: string
  song_id: string
  artist_id: string
  role: 'primary' | 'featured' | 'producer' | 'composer' | 'lyricist'
  position: number
  created_at: string
  artist?: Artist
}

export interface Playlist {
  id: string
  user_id: string
  name: string
  description: string | null
  cover: string | null
  created_at: string
  updated_at: string
}

export interface PlaylistSong {
  id: string
  playlist_id: string
  song_id: string
  position: number
  added_at: string
  song?: Song
}

export type PlatformKey = Link['platform']
export type ArtistPlatformKey = ArtistLink['platform']

export const PLATFORM_CONFIG: Record<PlatformKey, { name: string; color: string; logo: string }> = {
  spotify: { name: 'Spotify', color: '#1DB954', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/3840px-Spotify_logo_without_text.svg.png' },
  youtube_music: { name: 'YouTube Music', color: '#FF0000', logo: '/Youtube_Music.png' },
  apple_music: { name: 'Apple Music', color: '#FA243C', logo: '/Apple_Music.png' },
  jiosaavn: { name: 'JioSaavn', color: '#51C457', logo: '/jiosaavn.png' },
  gaana: { name: 'Gaana', color: '#F37021', logo: '' },
  amazon_music: { name: 'Amazon Music', color: '#00A8E1', logo: 'https://wallpapers.com/images/hd/amazon-music-logo-ealtealc1quuokje-2.jpg' },
}

export const ARTIST_PLATFORM_CONFIG: Record<ArtistPlatformKey, { name: string; color: string; logo: string }> = {
  spotify: { name: 'Spotify', color: '#1DB954', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/3840px-Spotify_logo_without_text.svg.png' },
  youtube_music: { name: 'YouTube Music', color: '#FF0000', logo: '/Youtube_Music.png' },
  apple_music: { name: 'Apple Music', color: '#FA243C', logo: '/Apple_Music.png' },
  jiosaavn: { name: 'JioSaavn', color: '#51C457', logo: '/jiosaavn.png' },
  gaana: { name: 'Gaana', color: '#F37021', logo: '' },
  amazon_music: { name: 'Amazon Music', color: '#00A8E1', logo: 'https://wallpapers.com/images/hd/amazon-music-logo-ealtealc1quuokje-2.jpg' },
  youtube: { name: 'YouTube', color: '#FF0000', logo: '/Youtube_logo.png' },
}


