import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import CinematicCard from '@/components/ui/CinematicCard'
import FadeInView from '@/components/motion/FadeInView'
import StaggerGrid, { StaggerItem } from '@/components/motion/StaggerGrid'
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
    <div className="py-8 pb-20 lg:pb-24">
      <FadeInView>
        <div className="px-5 lg:px-8 mb-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: 'var(--am-accent)' }}
          >
            Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="editorial-title"
          >
            Albums
          </motion.h1>
          <p className="text-[14px] mt-2" style={{ color: 'var(--am-text-2)' }}>
            {albums.length} {albums.length === 1 ? 'album' : 'albums'}
          </p>
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
        <p className="text-center py-20 text-[14px]" style={{ color: 'var(--am-text-2)' }}>No albums yet</p>
      )}
    </div>
  )
}
