import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { fetchSongsWithArtists } from '@/lib/supabase'
import type { Song } from '@/types'
import ScrollTiltedGrid from '@/components/ui/ScrollTiltedGrid'
import { SectionTitle } from '@/shared/typography'
import { Caption } from '@/shared/typography'

export default function EditorialDiscovery() {
  const [songs, setSongs] = useState<Song[]>([])
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    async function load() {
      const data = await fetchSongsWithArtists({
        filter: (q) => q.eq('show_in_discovery', true).order('created_at', { ascending: false }),
        limit: 50,
      })
      setSongs(data)
    }
    load()
  }, [])

  const images = songs
    .filter(s => s.cover)
    .map(s => ({
      src: s.cover!,
      alt: s.title,
      id: s.id,
    }))

  if (images.length === 0) return null

  return (
    <section ref={ref} className="relative mb-12 lg:mb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="px-5 lg:px-8 mb-6"
      >
        <SectionTitle>Visual Discovery</SectionTitle>
        <Caption className="mt-1 lg:mt-2">Explore music through imagery</Caption>
      </motion.div>
      <ScrollTiltedGrid images={images} />
    </section>
  )
}
