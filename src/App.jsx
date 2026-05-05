import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoadingScreen from './pages/LoadingScreen'
import Navbar from './components/Navbar'

// Import all your pages
const Home = lazy(() => import('./pages/Home'))
const Explore = lazy(() => import('./pages/Explore'))
const AssetDetail = lazy(() => import('./pages/AssetDetail'))
const Learn = lazy(() => import('./pages/Learn'))
const LearnGuideDetail = lazy(() => import('./pages/LearnGuideDetail'))
const LearnPathDetail = lazy(() => import('./pages/LearnPathDetail'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))
const Profile = lazy(() => import('./pages/Profile'))
const Crypto = lazy(() => import('./pages/Crypto'))

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crypto" element={<Crypto />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/asset/:id" element={<AssetDetail />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:slug" element={<LearnGuideDetail />} />
          <Route path="/learn/path/:slug" element={<LearnPathDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signin" element={<SignIn />} />      {/* ← Your SignIn page */}
          <Route path="/signup" element={<SignUp />} />      {/* ← Your SignUp page */}
          <Route path="/signup/personal" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Suspense>
  )
}

export default App