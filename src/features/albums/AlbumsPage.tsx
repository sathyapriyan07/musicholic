import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PageShell, PageContent } from '@/shared/layout'
import { PageTitle, BodyText } from '@/shared/typography'
import { FadeInView, StaggerGrid, StaggerItem } from '@/shared/motion'
import CinematicCard from '@/shared/ui/CinematicCard'
import LoadingSpinner from '@/shared/ui/LoadingSpinner'
import type { Album } from '@/types'

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('albums')
      .select('*, artist:artists(id, name, image)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAlbums(data as unknown as Album[])
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <PageShell>
      <PageContent>
        <div className="py-8 pb-20 lg:pb-24">
          <FadeInView>
            <div className="px-5 lg:px-8 mb-8">
              <PageTitle label="Collection">Albums</PageTitle>
              <BodyText muted size="sm">
                {albums.length} {albums.length === 1 ? 'album' : 'albums'}
              </BodyText>
            </div>
          </FadeInView>

          {albums.length > 0 ? (
            <div className="px-5 lg:px-8">
              <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                {albums.map((album, i) => (
                  <StaggerItem key={album.id}>
                    <CinematicCard
                      to={`/album/${album.id}`}
                      image={album.cover}
                      title={album.title}
                      subtitle={album.artist?.name}
                      index={i}
                    />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </div>
          ) : (
            <BodyText muted className="text-center py-20">
              No albums yet
            </BodyText>
          )}
        </div>
      </PageContent>
    </PageShell>
  )
}
