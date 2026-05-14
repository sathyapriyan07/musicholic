import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ChevronUp, Music2 } from 'lucide-react'

interface MiniPlayerState {
  visible: boolean
  title: string
  subtitle: string
  image?: string | null
  isPlaying: boolean
}

let _playerState: MiniPlayerState = {
  visible: false,
  title: '',
  subtitle: '',
  image: null,
  isPlaying: false,
}

let _listeners: Array<(state: MiniPlayerState) => void> = []

function notifyListeners() {
  _listeners.forEach(fn => fn({ ..._playerState }))
}

export function showMiniPlayer(title: string, subtitle: string, image?: string | null) {
  _playerState = {
    ..._playerState,
    visible: true,
    title,
    subtitle,
    image,
    isPlaying: true,
  }
  notifyListeners()
}

export function hideMiniPlayer() {
  _playerState = { ..._playerState, visible: false }
  notifyListeners()
}

export function togglePlayMiniPlayer() {
  _playerState = { ..._playerState, isPlaying: !_playerState.isPlaying }
  notifyListeners()
}

export default function MiniPlayer() {
  const [expanded, setExpanded] = useState(false)
  const [state, setState] = useState<MiniPlayerState>(_playerState)

  useState(() => {
    _listeners.push(setState)
    return () => { _listeners = _listeners.filter(fn => fn !== setState) }
  })

  return (
    <AnimatePresence>
      {state.visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <motion.div
            layout
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'var(--am-glass-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--am-border)',
              width: expanded ? '320px' : '280px',
            }}
          >
            {/* Mini bar */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <motion.button
                onClick={() => togglePlayMiniPlayer()}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--am-accent)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {state.isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-white ml-0.5" style={{ color: '#fff' }} />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" style={{ color: '#fff' }} />
                )}
              </motion.button>

              <div className="flex items-center gap-2 flex-1 min-w-0">
                {state.image ? (
                  <img src={state.image} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--am-surface-2)' }}>
                    <Music2 className="w-4 h-4" style={{ color: 'var(--am-text-3)' }} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold truncate">{state.title}</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--am-text-2)' }}>{state.subtitle}</p>
                </div>
              </div>

              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 rounded-full transition-colors hover:bg-white/5"
              >
                <ChevronUp
                  className="w-4 h-4 transition-transform duration-200"
                  style={{ color: 'var(--am-text-2)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
            </div>

            {/* Expanded area */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1">
                    <div className="w-full h-1 rounded-full" style={{ background: 'var(--am-surface-3)' }}>
                      <div className="w-1/3 h-full rounded-full" style={{ background: 'var(--am-accent)' }} />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-full transition-colors hover:bg-white/5">
                          <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ color: 'var(--am-text-2)' }}>
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor" />
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor" />
                          </svg>
                        </button>
                        <button className="p-1.5 rounded-full transition-colors hover:bg-white/5">
                          <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ color: 'var(--am-text-2)' }}>
                            <path d="M8 5v14l11-7z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-full transition-colors hover:bg-white/5">
                          <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ color: 'var(--am-text-2)' }}>
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor" />
                            <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
