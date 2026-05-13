import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Music, Mic2 } from 'lucide-react'

interface PlatformLinks {
  spotify?: string
  instagram?: string
  youtube?: string
  soundcloud?: string
  appleMusic?: string
}

export interface Collaborator {
  id: string
  name: string
  role: string
  relationship: string
  image: string | null
  songsTogether: number
  albumsTogether: number
  yearsActive: string
  artistId: string
  platforms?: PlatformLinks
}

interface ArtistConnectionsProps {
  collaborators: Collaborator[]
  title?: string
  subtitle?: string
}

const relationshipColors: Record<string, string> = {
  'Frequent Collaborator': '#fc3c44',
  'Featured Artist': '#ff6b70',
  Producer: '#4fc3f7',
  Lyricist: '#a78bfa',
  Composer: '#34d399',
  Singer: '#fbbf24',
  Engineer: '#f472b6',
  Director: '#60a5fa',
}

function getRelationshipColor(relationship: string): string {
  for (const [key, color] of Object.entries(relationshipColors)) {
    if (relationship.toLowerCase().includes(key.toLowerCase())) return color
  }
  return '#fc3c44'
}

export default function ArtistConnections({
  collaborators,
  title = 'Creative Universe',
  subtitle = 'The artists, producers, and creators behind the music',
}: ArtistConnectionsProps) {
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (!collaborators.length) return null

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Section background */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(252,60,68,0.03) 0%, transparent 60%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 70% 50%, rgba(79,195,247,0.02) 0%, transparent 50%)',
      }} />

      {/* Section header */}
      <div className="relative px-5 lg:px-8 mb-10 lg:mb-14">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
          style={{ color: 'var(--am-accent)' }}
        >
          {title}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="text-2xl lg:text-[32px] font-bold tracking-tight leading-[1.1] max-w-2xl"
        >
          {subtitle}
        </motion.h2>
      </div>

      {/* Collaborator grid */}
      <div className="relative px-5 lg:px-8">
        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
          {collaborators.map((collab, i) => (
            <CollaboratorCard
              key={collab.id}
              collab={collab}
              index={i}
              isHovered={hoveredId === collab.id}
              onHover={setHoveredId}
              onClick={() => navigate(`/artist/${collab.artistId}`)}
            />
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="flex sm:hidden gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {collaborators.map((collab, i) => (
            <CollaboratorCard
              key={collab.id}
              collab={collab}
              index={i}
              isHovered={hoveredId === collab.id}
              onHover={setHoveredId}
              onClick={() => navigate(`/artist/${collab.artistId}`)}
              compact
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function CollaboratorCard({
  collab,
  index,
  isHovered,
  onHover,
  onClick,
  compact,
}: {
  collab: Collaborator
  index: number
  isHovered: boolean
  onHover: (id: string | null) => void
  onClick: () => void
  compact?: boolean
}) {
  const relColor = getRelationshipColor(collab.relationship)

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => onHover(collab.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      className={`group relative text-left cursor-pointer min-w-0 ${compact ? 'w-40 flex-shrink-0' : 'w-full'}`}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      {/* Card container */}
      <div className="relative overflow-hidden rounded-2xl" style={{ background: 'var(--am-surface)' }}>
        {/* Image container */}
        <div className={`relative overflow-hidden ${compact ? 'aspect-[4/5]' : 'aspect-[4/5] lg:aspect-[3/4]'}`}>
          {collab.image ? (
            <img
              src={collab.image}
              alt={collab.name}
              className="w-full h-full object-cover transition-all duration-700 ease-out"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--am-surface-2)' }}>
              <Mic2 className="w-12 h-12" style={{ color: 'var(--am-text-3)' }} />
            </div>
          )}

          {/* Name at bottom */}
          {collab.image && (
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-[13px] font-bold text-white drop-shadow-lg">{collab.name}</p>
            </div>
          )}

          {/* Relationship badge */}
          <div className="absolute top-3 left-3">
            <span
              className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: `${relColor}20`,
                color: relColor,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${relColor}30`,
              }}
            >
              {collab.role || collab.relationship}
            </span>
          </div>
        </div>

        {/* Info section below image */}
        <div className={`p-3 lg:p-4 ${compact ? 'hidden' : ''}`}>
          <p className="text-[13px] font-semibold truncate">{collab.name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Music className="w-3 h-3" style={{ color: 'var(--am-text-3)' }} />
            <span className="text-[11px]" style={{ color: 'var(--am-text-2)' }}>
              {collab.songsTogether} songs · {collab.albumsTogether} {collab.albumsTogether === 1 ? 'album' : 'albums'}
            </span>
          </div>

          {/* Platform icons */}
          {collab.platforms && (
            <div className="flex gap-2 mt-2.5">
              {collab.platforms.spotify && (
                <a
                  href={collab.platforms.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="transition-opacity hover:opacity-70"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1DB954">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </a>
              )}
              {collab.platforms.youtube && (
                <a
                  href={collab.platforms.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="transition-opacity hover:opacity-70"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
              {collab.platforms.instagram && (
                <a
                  href={collab.platforms.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="transition-opacity hover:opacity-70"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#E4405F">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
              )}
              {collab.platforms.appleMusic && (
                <a
                  href={collab.platforms.appleMusic}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="transition-opacity hover:opacity-70"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#FA243C">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.62-.71 1.61-1.16 2.49-1.13.09.95-.26 1.91-.88 2.62-.61.71-1.58 1.13-2.51 1.07-.09-.89.28-1.84.9-2.56" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}
