import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Collaborator } from './ArtistConnections'

function getRelationship(role: string): string {
  const roleMap: Record<string, string> = {
    singer: 'Singer',
    vocalist: 'Singer',
    producer: 'Producer',
    lyricist: 'Lyricist',
    writer: 'Lyricist',
    composer: 'Composer',
    musician: 'Composer',
    engineer: 'Engineer',
    mixer: 'Engineer',
    mastering: 'Engineer',
    director: 'Director',
    featured: 'Featured Artist',
    featuring: 'Featured Artist',
    guest: 'Featured Artist',
  }
  const lower = role?.toLowerCase() || ''
  for (const [key, value] of Object.entries(roleMap)) {
    if (lower.includes(key)) return value
  }
  return 'Frequent Collaborator'
}

export function useArtistCollaborators(artistId: string | undefined): Collaborator[] {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])

  useEffect(() => {
    if (!artistId) return

    let cancelled = false

    async function fetchCollaborators() {
      const { data: songArtists } = await supabase
        .from('song_artists')
        .select('song_id, artist_id, role')
        .eq('artist_id', artistId as string) as any as { data: any[] }

      const rawSongArtists = songArtists || []
      if (rawSongArtists.length === 0) return

      const songIds: string[] = [...new Set(rawSongArtists.map((sa: any) => sa.song_id).filter(Boolean))]

      const { data: otherArtists } = await supabase
        .from('song_artists')
        .select('song_id, artist_id, role, artist:artists(id, name, image, created_at)')
        .in('song_id', songIds)
        .neq('artist_id', artistId) as any

      if (!otherArtists || cancelled) return

      const collabMap = new Map<string, {
        artistId: string
        name: string
        image: string | null
        sharedSongIds: Set<string>
        roles: Map<string, number>
        artistCreatedAt: string
      }>()

      for (const sa of otherArtists) {
        const artistData = sa.artist
        if (!artistData) continue

        if (!collabMap.has(sa.artist_id)) {
          collabMap.set(sa.artist_id, {
            artistId: sa.artist_id,
            name: artistData.name || 'Unknown',
            image: artistData.image || null,
            sharedSongIds: new Set<string>(),
            roles: new Map<string, number>(),
            artistCreatedAt: artistData.created_at || '',
          })
        }

        const entry = collabMap.get(sa.artist_id)!
        entry.sharedSongIds.add(sa.song_id)
        if (sa.role) {
          entry.roles.set(sa.role, (entry.roles.get(sa.role) || 0) + 1)
        }
      }

      const collaboratorIds = [...collabMap.keys()]

      const { data: albumsData } = await supabase
        .from('songs')
        .select('album_id, artist_ids')
        .in('id', songIds)
        .not('album_id', 'is', null) as any

      const sharedAlbumIds = new Set<string>()
      if (albumsData) {
        for (const song of albumsData) {
          if (song.album_id) sharedAlbumIds.add(song.album_id)
        }
      }

      const { data: artistLinksData } = await supabase
        .from('artist_links')
        .select('artist_id, platform, url')
        .in('artist_id', collaboratorIds) as any

      const linksByArtist = new Map<string, Record<string, string>>()
      if (artistLinksData) {
        for (const link of artistLinksData) {
          if (!linksByArtist.has(link.artist_id)) {
            linksByArtist.set(link.artist_id, {})
          }
          const entry = linksByArtist.get(link.artist_id)!
          const platform = link.platform === 'apple_music' ? 'appleMusic' : link.platform
          if (link.url) entry[platform] = link.url
        }
      }

      const result: Collaborator[] = [...collabMap.entries()]
        .map(([id, entry]) => {
          const primaryRole = [...entry.roles.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([role]) => role)[0]

          const yearsActive = entry.artistCreatedAt
            ? `${new Date(entry.artistCreatedAt).getFullYear()} – ${new Date().getFullYear()}`
            : ''

          return {
            id,
            name: entry.name,
            relationship: getRelationship(primaryRole || ''),
            image: entry.image,
            songsTogether: entry.sharedSongIds.size,
            albumsTogether: sharedAlbumIds.size,
            yearsActive,
            artistId: id,
            platforms: linksByArtist.get(id) as Collaborator['platforms'] || undefined,
          }
        })
        .sort((a, b) => b.songsTogether - a.songsTogether)
        .slice(0, 12)

      if (!cancelled) setCollaborators(result)
    }

    fetchCollaborators()

    return () => { cancelled = true }
  }, [artistId])

  return collaborators
}

export function useSongCollaborators(songId: string | undefined): Collaborator[] {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])

  useEffect(() => {
    if (!songId) return

    let cancelled = false

    async function fetchCollaborators() {
      const { data: songArtists } = await supabase
        .from('song_artists')
        .select('artist_id, role, artist:artists(id, name, image, created_at)')
        .eq('song_id', songId as string)
        .order('position', { ascending: true }) as any

      if (!songArtists || cancelled) return

      const artistIds = songArtists.map((sa: any) => sa.artist_id)

      const { data: artistLinksData } = await supabase
        .from('artist_links')
        .select('artist_id, platform, url')
        .in('artist_id', artistIds) as any

      const linksByArtist = new Map<string, Record<string, string>>()
      if (artistLinksData) {
        for (const link of artistLinksData) {
          if (!linksByArtist.has(link.artist_id)) {
            linksByArtist.set(link.artist_id, {})
          }
          const entry = linksByArtist.get(link.artist_id)!
          const platform = link.platform === 'apple_music' ? 'appleMusic' : link.platform
          if (link.url) entry[platform] = link.url
        }
      }

      const result: Collaborator[] = songArtists.map((sa: any) => {
        const artistData = sa.artist
        const yearsActive = artistData?.created_at
          ? `${new Date(artistData.created_at).getFullYear()} – ${new Date().getFullYear()}`
          : ''

        return {
          id: sa.artist_id,
          name: artistData?.name || 'Unknown',
          relationship: getRelationship(sa.role || ''),
          image: artistData?.image || null,
          songsTogether: 0,
          albumsTogether: 0,
          yearsActive,
          artistId: sa.artist_id,
          platforms: linksByArtist.get(sa.artist_id) as Collaborator['platforms'] || undefined,
        }
      })

      if (!cancelled) setCollaborators(result)
    }

    fetchCollaborators()

    return () => { cancelled = true }
  }, [songId])

  return collaborators
}

export function useAlbumCollaborators(albumId: string | undefined): Collaborator[] {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])

  useEffect(() => {
    if (!albumId) return

    let cancelled = false

    async function fetchCollaborators() {
      const { data: albumSongs } = await supabase
        .from('songs')
        .select('id')
        .eq('album_id', albumId as string) as any

      if (!albumSongs || albumSongs.length === 0) return

      const songIds = albumSongs.map((s: any) => s.id)

      const { data: songArtists } = await supabase
        .from('song_artists')
        .select('artist_id, role, artist:artists(id, name, image, created_at)')
        .in('song_id', songIds)
        .order('position', { ascending: true }) as any

      if (!songArtists || cancelled) return

      const collabMap = new Map<string, {
        artistId: string
        name: string
        image: string | null
        roles: Map<string, number>
        artistCreatedAt: string
      }>()

      for (const sa of songArtists) {
        const artistData = sa.artist
        if (!artistData) continue

        if (!collabMap.has(sa.artist_id)) {
          collabMap.set(sa.artist_id, {
            artistId: sa.artist_id,
            name: artistData.name || 'Unknown',
            image: artistData.image || null,
            roles: new Map<string, number>(),
            artistCreatedAt: artistData.created_at || '',
          })
        }

        const entry = collabMap.get(sa.artist_id)!
        if (sa.role) {
          entry.roles.set(sa.role, (entry.roles.get(sa.role) || 0) + 1)
        }
      }

      const artistIds = [...collabMap.keys()]

      const { data: artistLinksData } = await supabase
        .from('artist_links')
        .select('artist_id, platform, url')
        .in('artist_id', artistIds) as any

      const linksByArtist = new Map<string, Record<string, string>>()
      if (artistLinksData) {
        for (const link of artistLinksData) {
          if (!linksByArtist.has(link.artist_id)) {
            linksByArtist.set(link.artist_id, {})
          }
          const entry = linksByArtist.get(link.artist_id)!
          const platform = link.platform === 'apple_music' ? 'appleMusic' : link.platform
          if (link.url) entry[platform] = link.url
        }
      }

      const result: Collaborator[] = [...collabMap.entries()]
        .map(([id, entry]) => {
          const primaryRole = [...entry.roles.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([role]) => role)[0]

          const yearsActive = entry.artistCreatedAt
            ? `${new Date(entry.artistCreatedAt).getFullYear()} – ${new Date().getFullYear()}`
            : ''

          return {
            id,
            name: entry.name,
            relationship: getRelationship(primaryRole || ''),
            image: entry.image,
            songsTogether: 0,
            albumsTogether: 1,
            yearsActive,
            artistId: id,
            platforms: linksByArtist.get(id) as Collaborator['platforms'] || undefined,
          }
        })

      if (!cancelled) setCollaborators(result)
    }

    fetchCollaborators()

    return () => { cancelled = true }
  }, [albumId])

  return collaborators
}
