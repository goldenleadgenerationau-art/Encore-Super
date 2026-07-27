import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import type { View } from './types'
import { routeMetaForPath, VIEW_TO_PATH } from './lib/seoMeta'
import { Seo } from './components/Seo'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Home } from './components/Home'
import { GigCalculator } from './components/GigCalculator'
import { PaydayDeadline } from './components/PaydayDeadline'
import { CoverageCheck } from './components/CoverageCheck'
import { Scenarios } from './components/Scenarios'
import { RulesExplained } from './components/RulesExplained'
import { Faq } from './components/Faq'
import { Pricing } from './components/Pricing'
import { BandRoster } from './components/BandRoster'
import { Privacy } from './components/Privacy'
import { Terms } from './components/Terms'
import { TestimonialWidget } from './components/TestimonialWidget'

function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const meta = routeMetaForPath(location.pathname)
  const setView = (v: View) => navigate(VIEW_TO_PATH[v])

  return (
    <div className="flex min-h-svh flex-col">
      <Seo meta={meta} />
      <Header view={meta.view} setView={setView} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home setView={setView} />} />
          <Route path="/gig-calculator" element={<GigCalculator setView={setView} />} />
          <Route path="/payday-deadline-tracker" element={<PaydayDeadline setView={setView} />} />
          <Route path="/am-i-covered" element={<CoverageCheck setView={setView} />} />
          <Route path="/scenarios" element={<Scenarios setView={setView} />} />
          <Route path="/rules-explained" element={<RulesExplained setView={setView} />} />
          <Route path="/faq" element={<Faq setView={setView} />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/band-roster" element={<BandRoster />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/terms-of-service" element={<Terms />} />
          <Route path="*" element={<Home setView={setView} />} />
        </Routes>
      </main>
      <Footer setView={setView} />
      <TestimonialWidget />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
