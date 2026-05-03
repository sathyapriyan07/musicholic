import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import type { Song, Artist } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

interface SongsQueryOptions {
  order?: { column: string; ascending?: boolean }
  filter?: (q: any) => any
  limit?: number
}

export async function fetchSongsWithArtists(opts: SongsQueryOptions = {}): Promise<Song[]> {
  let q: any = supabase.from('songs').select('*, links:links(*)')

  if (opts.filter) q = opts.filter(q)

  if (opts.order) {
    q = q.order(opts.order.column, { ascending: opts.order.ascending ?? false })
  }

  if (opts.limit) q = q.limit(opts.limit)

  const { data, error } = await q as unknown as { data: any[] | null; error: any }
  if (error || !data) return []

  const allArtistIds = new Set<string>()
  data.forEach((row: any) => {
    if (row.artist_ids) {
      row.artist_ids.forEach((id: string) => allArtistIds.add(id))
    }
  })

  if (allArtistIds.size === 0) {
    return data as unknown as Song[]
  }

  const { data: artists } = await supabase
    .from('artists')
    .select('*')
    .in('id', Array.from(allArtistIds))

  const artistMap = new Map<string, Artist>()
  if (artists) {
    artists.forEach((a: any) => artistMap.set(a.id, a as unknown as Artist))
  }

  return data.map((row: any) => {
    const songArtists = (row.artist_ids || []).map((id: string) => artistMap.get(id)).filter(Boolean)
    return { ...row, artists: songArtists } as unknown as Song
  })
}
