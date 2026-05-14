import { lazy } from 'react'

const HomePage = lazy(() => import('@/features/home'))
const SongPage = lazy(() => import('@/features/songs'))
const ArtistPage = lazy(() => import('@/features/artists'))
const AlbumPage = lazy(() => import('@/features/albums'))
const SearchPage = lazy(() => import('@/features/search'))
const BrowsePage = lazy(() => import('@/features/browse'))
const AlbumsIndexPage = lazy(() => import('@/features/albums/AlbumsPage'))
const PlaylistsPage = lazy(() => import('@/features/playlists'))
const LoginPage = lazy(() => import('@/features/auth'))
const AdminPage = lazy(() => import('@/features/admin'))
const EditorialPage = lazy(() => import('@/features/editorial'))

export const routes = [
  { path: '/', element: HomePage },
  { path: '/song/:id', element: SongPage },
  { path: '/artist/:id', element: ArtistPage },
  { path: '/album/:id', element: AlbumPage },
  { path: '/search', element: SearchPage },
  { path: '/browse', element: BrowsePage },
  { path: '/albums', element: AlbumsIndexPage },
  { path: '/playlists', element: PlaylistsPage },
  { path: '/login', element: LoginPage },
  { path: '/admin/*', element: AdminPage },
  { path: '/editorial/:slug', element: EditorialPage },
]
