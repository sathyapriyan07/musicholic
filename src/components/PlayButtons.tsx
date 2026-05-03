import type { Link as LinkType, PlatformKey } from '@/types'
import { PLATFORM_CONFIG } from '@/types'
import { ExternalLink, Music, AudioLines, Apple, Radio, Headphones, Cloud } from 'lucide-react'

const platformIcons: Record<PlatformKey, React.ReactNode> = {
  spotify: <Music className="w-4 h-4" />,
  youtube_music: <AudioLines className="w-4 h-4" />,
  apple_music: <Apple className="w-4 h-4" />,
  jiosaavn: <Radio className="w-4 h-4" />,
  gaana: <Headphones className="w-4 h-4" />,
  amazon_music: <Cloud className="w-4 h-4" />,
}

interface PlayButtonsProps {
  links: LinkType[]
  variant?: 'horizontal' | 'vertical' | 'grid'
}

export default function PlayButtons({ links, variant = 'horizontal' }: PlayButtonsProps) {
  if (links.length === 0) return null

  const variants = {
    horizontal: 'flex flex-wrap gap-2',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 gap-2',
  }

  return (
    <div className={variants[variant]}>
      {links.map((link) => {
        const config = PLATFORM_CONFIG[link.platform as PlatformKey]
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90 active:scale-95 text-white ${
              variant === 'vertical' ? 'w-full justify-center' : ''
            }`}
            style={{ backgroundColor: config.color }}
          >
            {platformIcons[link.platform as PlatformKey]}
            <span>Play on {config.name}</span>
            <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
          </a>
        )
      })}
    </div>
  )
}
