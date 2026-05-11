import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'
import { Link } from 'react-router-dom'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

interface CinematicHeroProps {
  videoId: string
  title: string
  subtitle: string
  linkTo: string
}

export default function CinematicHero({ videoId, title, subtitle, linkTo }: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const apiReady = useRef(false)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [showInfo, setShowInfo] = useState(true)
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
          loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: (event: any) => {
            event.target.mute()
            event.target.playVideo()
          },
          onStateChange: (event: any) => {
            setPlaying(event.data === window.YT.PlayerState.PLAYING)
          },
        },
      })
    }

    return () => {
      if (endTimerRef.current) clearInterval(endTimerRef.current)
      playerRef.current?.destroy()
    }
  }, [videoId])

  const toggleMute = () => {
    if (!playerRef.current) return
    if (muted) {
      playerRef.current.unMute()
    } else {
      playerRef.current.mute()
    }
    setMuted(!muted)
  }

  const togglePlay = () => {
    if (!playerRef.current) return
    if (playing) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowInfo(false), 5000)
    const showTimer = setInterval(() => setShowInfo(true), 8000)
    return () => {
      clearTimeout(timer)
      clearInterval(showTimer)
    }
  }, [])

  return (
    <div className="relative w-full aspect-video sm:aspect-[4/1] lg:aspect-[16/1] overflow-hidden">
      {/* YouTube Background */}
      <div className="absolute inset-0">
        <div ref={containerRef} className="absolute inset-0 scale-[1.4] sm:scale-[1.8] lg:scale-[2.5]" style={{ pointerEvents: 'none' }} />
      </div>

      {/* Cinematic Overlay Layers */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, rgba(252,60,68,0.08) 0%, transparent 70%)',
      }} />
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(1.5px)' }} />

      {/* Mobile-only dark overlay for readability */}
      <div className="absolute inset-0 sm:hidden" style={{
        background: 'linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.3) 100%)',
      }} />

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(252,60,68,0.15) 0%, transparent 70%)' }}
      />

      {/* Floating Metadata */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 z-20 flex items-center px-5 lg:px-16"
          >
            <div className="max-w-xl">
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-[11px] lg:text-[13px] font-semibold uppercase tracking-[0.2em] mb-2 lg:mb-3"
                style={{ color: 'var(--am-accent)' }}
              >
                Featured
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight leading-[1.1] mb-1 lg:mb-2"
              >
                {title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-sm lg:text-base font-medium mb-3 lg:mb-4"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Link
                  to={linkTo}
                  className="inline-flex items-center gap-1.5 lg:gap-2 px-4 lg:px-6 py-1.5 lg:py-2.5 rounded-full text-[12px] lg:text-[14px] font-semibold transition-all hover:opacity-90"
                  style={{ background: 'var(--am-accent)', color: '#fff' }}
                >
                  <Play className="w-3 h-3 lg:w-4 lg:h-4 fill-white" />
                  Listen Now
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2"
      >
        <button
          onClick={togglePlay}
          className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {playing ? <Pause className="w-3 h-3 lg:w-4 lg:h-4 text-white" /> : <Play className="w-3 h-3 lg:w-4 lg:h-4 text-white ml-0.5" />}
        </button>
        <button
          onClick={toggleMute}
          className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {muted ? <VolumeX className="w-3 h-3 lg:w-4 lg:h-4 text-white" /> : <Volume2 className="w-3 h-3 lg:w-4 lg:h-4 text-white" />}
        </button>
      </motion.div>
    </div>
  )
}
