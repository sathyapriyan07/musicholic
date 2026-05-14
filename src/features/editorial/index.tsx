import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchSongsWithArtists } from '@/lib/supabase'
import type { Song } from '@/types'
import { PageShell, PageContent } from '@/shared/layout'
import { DisplayTitle, BodyText, SectionTitle } from '@/shared/typography'
import { FadeInView } from '@/shared/motion'
import { ArrowLeft } from 'lucide-react'
import CinematicCard from '@/shared/ui/CinematicCard'
import LoadingSpinner from '@/shared/ui/LoadingSpinner'
import DynamicIslandTOC from '@/components/ui/DynamicIslandTOC'

const EDITORIAL_CONTENT: Record<string, {
  title: string
  subtitle: string
  description: string
  heroColor: string
  sections: { id: string; label: string; type: 'text' | 'songs' | 'gallery'; content?: string }[]
}> = {
  'midnight-drive': {
    title: 'Midnight Drive',
    subtitle: 'Late night vibes for the open road',
    description: 'There\'s something magical about driving through empty streets as the city lights blur past.',
    heroColor: '#1a1a2e',
    sections: [
      { id: 'essay', label: 'The Journey', type: 'text', content: 'The hum of the engine, the glow of dashboard lights, and the endless road ahead. Midnight drives have a meditative quality that few experiences can match. The music becomes your companion, each track painting the passing scenery with emotion.' },
      { id: 'tracks', label: 'Essential Tracks', type: 'songs' },
      { id: 'mood', label: 'The Mood', type: 'text', content: 'These tracks are carefully selected to complement the nocturnal journey. From ambient electronic textures to deep, resonant beats, each song is a chapter in your midnight story.' },
    ],
  },
  'rainy-tamil-nights': {
    title: 'Rainy Tamil Nights',
    subtitle: 'Melancholic melodies for monsoon evenings',
    description: 'The pitter-patter of rain against the window, the earthy scent of wet soil.',
    heroColor: '#1a2332',
    sections: [
      { id: 'essay', label: 'The Monsoon Mood', type: 'text', content: 'Rain in Tamil Nadu is not just weather — it is an emotion, a memory, a feeling that runs deep in the cultural consciousness.' },
      { id: 'tracks', label: 'Rainy Day Selections', type: 'songs' },
      { id: 'reflection', label: 'A Note', type: 'text', content: 'Each melody carries the weight of monsoon memories.' },
    ],
  },
  'synthwave-dreams': {
    title: 'Synthwave Dreams',
    subtitle: 'Retro futuristic electronic soundscapes',
    description: 'A journey through neon-lit streets and retro-futuristic soundscapes.',
    heroColor: '#2d1b3d',
    sections: [
      { id: 'essay', label: 'The Retro Future', type: 'text', content: 'Synthwave is a genre built on nostalgia for a future that never was.' },
      { id: 'tracks', label: 'The Collection', type: 'songs' },
      { id: 'culture', label: 'Cultural Impact', type: 'text', content: 'From Stranger Things to Drive, synthwave has permeated modern media.' },
    ],
  },
}

export default function EditorialPage() {
  const { slug } = useParams<{ slug: string }>()
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await fetchSongsWithArtists({ order: { column: 'created_at' }, limit: 30 })
      setAllSongs(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  const editorial = slug ? EDITORIAL_CONTENT[slug] : null
  if (!editorial) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <p className="text-lg font-semibold mb-2">Editorial not found</p>
        <Link to="/" className="text-[14px] font-medium" style={{ color: 'var(--am-accent)' }}>
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <PageShell>
      <div>
        <div className="relative h-[60vh] lg:h-[70vh] overflow-hidden flex items-end"
          style={{ background: editorial.heroColor }}
        >
          <div className="absolute inset-0" style={{
            background: `linear-gradient(180deg, transparent 0%, ${editorial.heroColor} 100%)`,
            opacity: 0.6,
          }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, rgba(252,60,68,0.08) 0%, transparent 70%)',
          }} />

          <FadeInView className="relative z-10 px-5 lg:px-8 pb-16 lg:pb-20 max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3"
              style={{ color: 'var(--am-accent)' }}
            >
              Editorial
            </motion.p>
            <DisplayTitle className="mb-3">{editorial.title}</DisplayTitle>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[16px] lg:text-[18px] max-w-2xl"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {editorial.subtitle}
            </motion.p>
          </FadeInView>

          <Link to="/" className="absolute top-6 left-5 lg:left-8 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
        </div>

        <PageContent>
          <div className="max-w-4xl mx-auto px-5 lg:px-8 py-12 lg:py-16">
            {editorial.sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-16">
                {section.type === 'text' && section.content && (
                  <FadeInView>
                    <SectionTitle className="mb-4">{section.label}</SectionTitle>
                    <BodyText muted>{section.content}</BodyText>
                  </FadeInView>
                )}

                {section.type === 'songs' && allSongs.length > 0 && (
                  <div>
                    <SectionTitle className="mb-6">{section.label}</SectionTitle>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {allSongs.slice(0, 10).map((song, i) => (
                        <CinematicCard
                          key={song.id}
                          to={`/song/${song.id}`}
                          image={song.cover}
                          title={song.title}
                          subtitle={song.artists?.map(a => a.name).join(', ')}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {section.type === 'gallery' && (
                  <FadeInView>
                    <SectionTitle className="mb-4">{section.label}</SectionTitle>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {allSongs.filter(s => s.cover).slice(0, 6).map((song) => (
                        <div key={song.id} className="aspect-square rounded-2xl overflow-hidden">
                          <img src={song.cover!} alt={song.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </FadeInView>
                )}
              </section>
            ))}
          </div>

          <FadeInView>
            <div className="px-5 lg:px-8 pb-16 max-w-4xl mx-auto">
              <BodyText muted>{editorial.description}</BodyText>
            </div>
          </FadeInView>

          <DynamicIslandTOC items={editorial.sections.map(s => ({ id: s.id, label: s.label }))} />
        </PageContent>
      </div>
    </PageShell>
  )
}
