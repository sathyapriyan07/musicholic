import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractYouTubeId(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] || null
}

export function getYouTubeEmbedUrl(url: string | null, autoplay?: boolean): string | null {
  const id = extractYouTubeId(url)
  if (!id) return null
  return autoplay ? `https://www.youtube.com/embed/${id}?autoplay=1` : `https://www.youtube.com/embed/${id}`
}

export function getYouTubeThumbnail(url: string | null): string | null {
  const id = extractYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
