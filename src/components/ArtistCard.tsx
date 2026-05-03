import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { Artist } from '@/types'

interface ArtistCardProps {
  artist: Artist
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { card: 'w-24', img: 'w-24 h-24' },
  md: { card: 'w-32', img: 'w-32 h-32' },
  lg: { card: 'w-40', img: 'w-40 h-40' },
}

export default function ArtistCard({ artist, size = 'md' }: ArtistCardProps) {
  const s = sizeMap[size]

  return (
    <Link to={`/artist/${artist.id}`} className={cn('group flex-shrink-0 cursor-pointer', s.card)}>
      <div className="relative overflow-hidden rounded-full transition-transform duration-200 group-hover:scale-[1.04]"
        style={{ background: 'var(--am-surface-2)' }}>
        {artist.image ? (
          <img
            src={artist.image}
            alt={artist.name}
            className={cn('aspect-square object-cover', s.img)}
            loading="lazy"
          />
        ) : (
          <div className={cn('aspect-square flex items-center justify-center', s.img)}>
            <svg viewBox="0 0 24 24" className="w-1/3 h-1/3" style={{ fill: 'var(--am-text-3)' }}>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-2.5 text-center px-1">
        <p className="text-[13px] font-semibold truncate leading-tight">{artist.name}</p>
        <p className="text-[11px] mt-0.5 uppercase tracking-wider font-medium" style={{ color: 'var(--am-text-3)' }}>Artist</p>
      </div>
    </Link>
  )
}
