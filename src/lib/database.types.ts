export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string
          name: string
          image: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          image?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          image?: string | null
          bio?: string | null
          created_at?: string
        }
      }
      albums: {
        Row: {
          id: string
          title: string
          cover: string | null
          artist_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          cover?: string | null
          artist_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          cover?: string | null
          artist_id?: string
          created_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          cover: string | null
          youtube_embed_url: string | null
          artist_ids: string[]
          album_id: string | null
          featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          cover?: string | null
          youtube_embed_url?: string | null
          artist_ids?: string[]
          album_id?: string | null
          featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          cover?: string | null
          youtube_embed_url?: string | null
          artist_ids?: string[]
          album_id?: string | null
          featured?: boolean
          created_at?: string
        }
      }
      links: {
        Row: {
          id: string
          song_id: string
          platform: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          platform: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          platform?: string
          url?: string
          created_at?: string
        }
      }
      artist_links: {
        Row: {
          id: string
          artist_id: string
          platform: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          platform: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          platform?: string
          url?: string
          created_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          cover: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          cover?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          cover?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      song_artists: {
        Row: {
          id: string
          song_id: string
          artist_id: string
          role: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          artist_id: string
          role?: string
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          artist_id?: string
          role?: string
          position?: number
          created_at?: string
        }
      }
      playlist_songs: {
        Row: {
          id: string
          playlist_id: string
          song_id: string
          position: number
          added_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          song_id: string
          position: number
          added_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          song_id?: string
          position?: number
          added_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
