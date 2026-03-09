import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LoadingScreen from './pages/LoadingScreen'

const Home = lazy(() => import('./pages/Home'))
const Explore = lazy(() => import('./pages/Explore'))
const AssetDetail = lazy(() => import('./pages/AssetDetail'))
const Learn = lazy(() => import('./pages/Learn'))
const LearnGuideDetail = lazy(() => import('./pages/LearnGuideDetail'))
const LearnPathDetail = lazy(() => import('./pages/LearnPathDetail'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))

function App() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/asset/:id" element={<AssetDetail />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:slug" element={<LearnGuideDetail />} />
          <Route path="/learn/path/:slug" element={<LearnPathDetail />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup/personal" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  )
}

export default App
