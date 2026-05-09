import { getYouTubeEmbedUrl } from '@/lib/utils'

interface YouTubeEmbedProps {
  url: string | null
  className?: string
  autoplay?: boolean
}

export default function YouTubeEmbed({ url, className, autoplay }: YouTubeEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(url, autoplay)

  if (!embedUrl) {
    return (
      <div
        className="aspect-video rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--am-surface-2)' }}
      >
        <p className="text-[13px]" style={{ color: 'var(--am-text-3)' }}>No preview available</p>
      </div>
    )
  }

  return (
    <div className={`aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl ${className || ''}`}>
      <iframe
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
