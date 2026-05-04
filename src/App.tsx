import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import TopNav from '@/components/TopNav'
import BottomNav from '@/components/BottomNav'
import HomePage from '@/pages/HomePage'
import SongPage from '@/pages/SongPage'
import ArtistPage from '@/pages/ArtistPage'
import AlbumPage from '@/pages/AlbumPage'
import SearchPage from '@/pages/SearchPage'
import BrowsePage from '@/pages/BrowsePage'
import PlaylistsPage from '@/pages/PlaylistsPage'
import AlbumsPage from '@/pages/AlbumsPage'
import LoginPage from '@/pages/LoginPage'
import AdminPage from '@/pages/admin/AdminPage'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen" style={{ background: 'var(--am-bg)' }}>
        <TopNav />
        <main className="pt-[52px] pb-[56px] lg:pb-0 max-w-[1800px] mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/song/:id" element={<SongPage />} />
            <Route path="/artist/:id" element={<ArtistPage />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/albums" element={<AlbumsPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  )
}
