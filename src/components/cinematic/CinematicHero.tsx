import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Play, Pause, ChevronDown } from 'lucide-react'
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
    <div className="relative w-full h-screen overflow-hidden">
      {/* YouTube Background */}
      <div className="absolute inset-0">
        <div ref={containerRef} className="absolute inset-0" style={{ transform: 'scale(1.8)', pointerEvents: 'none' }} />
      </div>

      {/* Cinematic Overlay Layers */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 30%, rgba(10,10,10,0.6) 60%, var(--am-bg) 100%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center top, rgba(252,60,68,0.08) 0%, transparent 70%)',
      }} />
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(2px)' }} />

      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(252,60,68,0.15) 0%, transparent 70%)' }}
      />

      {/* Floating Metadata */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute bottom-[20%] left-8 lg:left-16 z-20 max-w-2xl"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3"
              style={{ color: 'var(--am-accent)' }}
            >
              Featured
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="editorial-title mb-3"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg lg:text-xl font-medium mb-6"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Link
                to={linkTo}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold transition-all hover:opacity-90"
                style={{ background: 'var(--am-accent)', color: '#fff' }}
              >
                <Play className="w-4 h-4 fill-white" />
                Listen Now
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 right-8 z-20 flex gap-2"
      >
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
        </button>
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" style={{ color: 'var(--am-text-3)' }} />
        </motion.div>
      </motion.div>
    </div>
  )
}
