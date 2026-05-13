import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

interface YouTubeHeroPlayerProps {
  videoId: string
  muted: boolean
  quality: string
  qualityLabel: string
  onToggleMute: () => void
  onToggleQuality: () => void
  startSeconds?: number
  endSeconds?: number
  onEnd?: () => void
}

export default function YouTubeHeroPlayer({ videoId, muted, quality, qualityLabel, onToggleMute, onToggleQuality, startSeconds, endSeconds, onEnd }: YouTubeHeroPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const apiReady = useRef(false)
  const [playing, setPlaying] = useState(true)
  const endTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const first = document.getElementsByTagName('script')[0]
      first.parentNode?.insertBefore(tag, first)

      window.onYouTubeIframeAPIReady = () => {
        apiReady.current = true
        createPlayer()
      }
    } else {
      apiReady.current = true
      createPlayer()
    }

    function createPlayer() {
      if (!containerRef.current) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          mute: 1,
          playsinline: 1,
          rel: 0,
          start: startSeconds || 0,
        },
        events: {
          onReady: (event: any) => {
            event.target.setPlaybackQuality(quality)
            if (startSeconds) event.target.seekTo(startSeconds, true)
            if (!muted) event.target.unMute()
          },
          onStateChange: (event: any) => {
            setPlaying(event.data === window.YT.PlayerState.PLAYING)
            if (event.data === window.YT.PlayerState.PLAYING && endSeconds && onEnd) {
              if (endTimerRef.current) clearInterval(endTimerRef.current)
              endTimerRef.current = setInterval(() => {
                const current = playerRef.current?.getCurrentTime()
                if (current && current >= endSeconds) {
                  if (endTimerRef.current) clearInterval(endTimerRef.current)
                  onEnd()
                }
              }, 200)
            }
          },
        },
      })
    }

    return () => {
      if (endTimerRef.current) clearInterval(endTimerRef.current)
      playerRef.current?.destroy()
    }
  }, [videoId])

  useEffect(() => {
    if (!playerRef.current?.getCurrentTime) return
    const time = playerRef.current.getCurrentTime()
    if (muted) {
      playerRef.current?.mute()
    } else {
      playerRef.current?.unMute()
    }
    playerRef.current?.seekTo(time, true)
  }, [muted])

  useEffect(() => {
    if (!playerRef.current?.setPlaybackQuality) return
    const time = playerRef.current.getCurrentTime()
    playerRef.current?.setPlaybackQuality(quality)
    playerRef.current?.seekTo(time, true)
  }, [quality])

  function togglePlay() {
    if (!playerRef.current) return
    if (playing) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" style={{ transform: 'scale(1.5)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--am-bg) 0%, transparent 40%)' }} />
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
        </button>
        <button
          onClick={onToggleMute}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
        <button
          onClick={onToggleQuality}
          className="px-3 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold transition-opacity hover:opacity-80"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <span className="text-white">{qualityLabel}</span>
        </button>
      </div>
    </div>
  )
}
