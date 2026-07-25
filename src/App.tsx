import { useState } from 'react'
import type { View } from './types'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Home } from './components/Home'
import { GigCalculator } from './components/GigCalculator'
import { PaydayDeadline } from './components/PaydayDeadline'
import { CoverageCheck } from './components/CoverageCheck'
import { Scenarios } from './components/Scenarios'
import { RulesExplained } from './components/RulesExplained'
import { Pricing } from './components/Pricing'
import { BandRoster } from './components/BandRoster'
import { Privacy } from './components/Privacy'
import { Terms } from './components/Terms'

function App() {
  const [view, setView] = useState<View>('home')

  return (
    <div className="flex min-h-svh flex-col">
      <Header view={view} setView={setView} />
      <main className="flex-1">
        {view === 'home' && <Home setView={setView} />}
        {view === 'calculator' && <GigCalculator setView={setView} />}
        {view === 'deadline' && <PaydayDeadline setView={setView} />}
        {view === 'coverage' && <CoverageCheck setView={setView} />}
        {view === 'scenarios' && <Scenarios />}
        {view === 'rules' && <RulesExplained setView={setView} />}
        {view === 'pricing' && <Pricing />}
        {view === 'roster' && <BandRoster />}
        {view === 'privacy' && <Privacy />}
        {view === 'terms' && <Terms />}
      </main>
      <Footer setView={setView} />
    </div>
  )
}

export default App
