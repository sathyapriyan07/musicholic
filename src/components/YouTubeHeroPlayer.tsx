import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Play, Pause, Sun } from 'lucide-react'

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
}

export default function YouTubeHeroPlayer({ videoId, muted, quality, qualityLabel, onToggleMute, onToggleQuality }: YouTubeHeroPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const apiReady = useRef(false)
  const [playing, setPlaying] = useState(true)
  const [brightness, setBrightness] = useState(1)
  const [showBrightness, setShowBrightness] = useState(false)

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
        },
        events: {
          onReady: (event: any) => {
            event.target.setPlaybackQuality(quality)
            if (!muted) {
              event.target.unMute()
            }
          },
          onStateChange: (event: any) => {
            setPlaying(event.data === window.YT.PlayerState.PLAYING)
          },
        },
      })
    }

    return () => {
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
      <div ref={containerRef} className="absolute inset-0" style={{ transform: 'scale(1.5)', filter: `brightness(${brightness})` }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--am-bg) 0%, transparent 40%)' }} />
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
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
        <div className="relative">
          <button
            onClick={() => setShowBrightness(!showBrightness)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <Sun className="w-4 h-4 text-white" />
          </button>
          {showBrightness && (
            <div
              className="absolute bottom-full right-0 mb-2 p-3 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.8)' }}
            >
              <input
                type="range"
                min="0.3"
                max="2"
                step="0.1"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-24 h-1 accent-white cursor-pointer"
                style={{ accentColor: 'white' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
