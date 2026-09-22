import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'

const AboutPage = lazy(() => import('./pages/AboutPage'))
const ResumePage = lazy(() => import('./pages/ResumePage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const StartPage = lazy(() => import('./pages/StartPage'))
const StartContinuePage = lazy(() => import('./pages/StartContinuePage'))
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function RouteFallback() {
  return <div className="min-h-screen pt-20" aria-busy="true" aria-live="polite" />
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="start" element={<StartPage />} />
              <Route path="start/continue" element={<StartContinuePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </MotionConfig>
  )
}

export default App
