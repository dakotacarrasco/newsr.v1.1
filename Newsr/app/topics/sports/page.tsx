'use client'

import SportsHero from './components/SportsHero'
import SportCategories from './components/SportCategories'
import TopSportsNews from './components/TopSportsNews'
import UpcomingEvents from './components/UpcomingEvents'

export default function SportsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero section with featured sports story and live scores */}
      <SportsHero />
      
      {/* Top sports news */}
      <TopSportsNews />
      
      {/* Sports categories */}
      <SportCategories />
      
      {/* Upcoming sports events */}
      <UpcomingEvents />
    </main>
  )
}
