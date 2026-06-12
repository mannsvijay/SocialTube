import { lazy, Suspense }  from 'react'
import { Routes, Route }   from 'react-router-dom'
import { ROUTES }          from '@/constants/routes'
import MainLayout          from '@/layouts/MainLayout'
import AuthLayout          from '@/layouts/AuthLayout'
import ProtectedRoute      from '@/routes/ProtectedRoute'
import GuestRoute          from '@/routes/GuestRoute'
import Spinner             from '@/components/ui/Spinner'
import ErrorBoundary       from '@/components/ErrorBoundary'

const Home           = lazy(() => import('@/pages/Home'))
const Watch          = lazy(() => import('@/pages/Watch'))
const Channel        = lazy(() => import('@/pages/Channel'))
const Search         = lazy(() => import('@/pages/Search'))
const Login          = lazy(() => import('@/pages/Auth/Login'))
const Register       = lazy(() => import('@/pages/Auth/Register'))
const Upload         = lazy(() => import('@/pages/Upload'))
const Studio         = lazy(() => import('@/pages/Studio'))
const Playlists      = lazy(() => import('@/pages/Playlists'))
const PlaylistDetail = lazy(() => import('@/pages/PlaylistDetail'))
const LikedVideos    = lazy(() => import('@/pages/LikedVideos'))
const History        = lazy(() => import('@/pages/History'))
const Tweets         = lazy(() => import('@/pages/Tweets'))
const Subscriptions  = lazy(() => import('@/pages/Subscriptions'))
const Settings       = lazy(() => import('@/pages/Settings'))
const NotFound       = lazy(() => import('@/pages/NotFound'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <Spinner size="lg" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>                              {/* ← CHANGE 2 — wrap shuru */}
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* Guest only — redirect to / if already logged in */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN}    element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
            </Route>
          </Route>

          {/* Public — no auth needed */}
          <Route element={<MainLayout />}>
            <Route path={ROUTES.HOME}    element={<Home />} />
            <Route path={ROUTES.WATCH}   element={<Watch />} />
            <Route path={ROUTES.CHANNEL} element={<Channel />} />
            <Route path={ROUTES.SEARCH}  element={<Search />} />
          </Route>

          {/* Protected — must be logged in */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path={ROUTES.UPLOAD}          element={<Upload />} />
              <Route path={ROUTES.STUDIO}          element={<Studio />} />
              <Route path={ROUTES.PLAYLISTS}       element={<Playlists />} />
              <Route path={ROUTES.PLAYLIST_DETAIL} element={<PlaylistDetail />} />
              <Route path={ROUTES.LIKED_VIDEOS}    element={<LikedVideos />} />
              <Route path={ROUTES.HISTORY}         element={<History />} />
              <Route path={ROUTES.TWEETS}          element={<Tweets />} />
              <Route path={ROUTES.SUBSCRIPTIONS}   element={<Subscriptions />} />
              <Route path={ROUTES.SETTINGS}        element={<Settings />} />
            </Route>
          </Route>

          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>                            
  )
}