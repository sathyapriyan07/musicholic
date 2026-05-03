import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { Album } from '@/types'
import { Play } from 'lucide-react'

interface AlbumCardProps {
  album: Album
  size?: 'sm' | 'md' | 'lg'
  showArtist?: boolean
}

const sizeMap = {
  sm: { card: 'w-28', img: 'w-28 aspect-video' },
  md: { card: 'w-36', img: 'w-36 aspect-video' },
  lg: { card: 'w-44', img: 'w-44 aspect-video' },
}

export default function AlbumCard({ album, size = 'md', showArtist = true }: AlbumCardProps) {
  const s = sizeMap[size]

  return (
    <Link to={`/album/${album.id}`} className={cn('group flex-shrink-0 cursor-pointer', s.card)}>
      <div className="relative overflow-hidden rounded-xl transition-transform duration-200 group-hover:scale-[1.03]"
        style={{ background: 'var(--am-surface-2)' }}>
        {album.cover ? (
          <img
            src={album.cover}
            alt={album.title}
            className={cn('w-full h-full object-cover', s.img)}
            loading="lazy"
          />
        ) : (
          <div className={cn('w-full flex items-center justify-center', s.img)}>
            <svg viewBox="0 0 24 24" className="w-1/3 h-1/3" style={{ fill: 'var(--am-text-3)' }}>
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'var(--am-accent)' }}>
            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-[13px] font-semibold truncate leading-tight">{album.title}</p>
        {showArtist && album.artist && (
          <p className="text-[12px] mt-0.5 truncate leading-tight" style={{ color: 'var(--am-text-2)' }}>
            {album.artist.name}
          </p>
        )}
      </div>
    </Link>
  )
}
