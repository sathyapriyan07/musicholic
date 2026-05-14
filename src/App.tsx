import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import TopNav from '@/features/navigation/TopNav'
import BottomNav from '@/features/navigation/BottomNav'
import CommandPalette from '@/features/command-palette'
import MiniPlayer from '@/features/mini-player'
import AnimatedRoutes from '@/app/router/AnimatedRoutes'

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <>
      <div className="min-h-screen" style={{ background: 'var(--am-bg)' }}>
        <TopNav />
        <main className="pt-[52px] pb-[56px] lg:pb-0">
          <PageTransition>
            <AnimatedRoutes />
          </PageTransition>
        </main>
        <BottomNav />
        <MiniPlayer />
      </div>
      <CommandPalette />
    </>
  )
}
