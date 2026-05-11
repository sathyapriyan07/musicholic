import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import type { Song } from '@/types'
import CinematicCard from '@/components/ui/CinematicCard'

interface MoodSectionProps {
  title: string
  description: string
  songs: Song[]
  slug?: string
}

export default function MoodSection({
  title,
  description,
  songs,
  slug,
}: MoodSectionProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section ref={ref} className="relative mb-16 lg:mb-24">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-30 rounded-3xl"
        style={{
          background: `linear-gradient(135deg, var(--am-accent) 0%, transparent 60%)`,
          opacity: 0.05,
        }}
      />

      <div className="relative px-5 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-6"
        >
          <h2 className="text-[28px] lg:text-[36px] font-bold tracking-tight leading-[1.1]">
            {title}
          </h2>
          <p className="text-[14px] lg:text-[15px] mt-2 max-w-xl" style={{ color: 'var(--am-text-2)' }}>
            {description}
          </p>
        </motion.div>

        {/* Horizontal scroll shelf */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        >
          {songs.map((song, i) => (
            <CinematicCard
              key={song.id}
              to={`/song/${song.id}`}
              image={song.cover}
              title={song.title}
              subtitle={song.artists?.map(a => a.name).join(', ')}
              index={i}
            />
          ))}
        </motion.div>

        {slug && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-4"
          >
            <Link
              to={`/editorial/${slug}`}
              className="inline-flex items-center gap-1 text-[13px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--am-accent)' }}
            >
              Explore {title}
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2]">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
