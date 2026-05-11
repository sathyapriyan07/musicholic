import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import MusicUniverse from '@/components/discovery/MusicUniverse'
import FadeInView from '@/components/motion/FadeInView'
import type { Album, Artist } from '@/types'
import type { MusicUniverseImage } from '@/components/discovery/MusicUniverse'

export default function BrowsePage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [albumsRes, artistsRes] = await Promise.all([
          supabase
            .from('albums')
            .select('*, artist:artists(id, name, image)')
            .order('created_at', { ascending: false })
            .limit(50),
          supabase.from('artists').select('*').order('name', { ascending: true }).limit(50),
        ])
        if (albumsRes.data) setAlbums(albumsRes.data as unknown as Album[])
        if (artistsRes.data) setArtists(artistsRes.data as unknown as Artist[])
      } catch (err) {
        console.error('Browse error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingSpinner />

  const universeImages: MusicUniverseImage[] = albums.map((album) => ({
    src: album.cover,
    alt: album.title,
    title: album.title,
    subtitle: album.artist?.name,
    linkTo: `/album/${album.id}`,
    id: album.id,
  }))

  return (
    <div className="pb-20 lg:pb-24">
      <MusicUniverse
        images={universeImages}
        title="Explore The Music Universe"
        subtitle="Drag to navigate through floating album worlds. Tap to discover more."
        segments={24}
        grayscale
        openedImageWidth="360px"
        openedImageHeight="460px"
        overlayBlurColor="#0a0a0a"
      />

      {artists.length > 0 && (
        <FadeInView>
          <section className="px-5 lg:px-8 mt-12 lg:mt-16">
            <h2 className="text-[22px] lg:text-[28px] font-bold tracking-tight mb-6">Artists</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 lg:gap-5">
              {artists.map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.03 }}
                  className="group"
                >
                  <a href={`/artist/${artist.id}`} className="block">
                    <motion.div
                      className="w-full aspect-square rounded-full overflow-hidden mb-2.5"
                      style={{ background: 'var(--am-surface-2)' }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      {artist.image ? (
                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-1/3 h-1/3" style={{ fill: 'var(--am-text-3)' }}>
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </motion.div>
                    <p className="text-[13px] font-semibold truncate text-center">{artist.name}</p>
                  </a>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeInView>
      )}
    </div>
  )
}
