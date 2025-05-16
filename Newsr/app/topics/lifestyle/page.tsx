'use client'

import LifestyleFeatured from './components/LifestyleFeatured'
import LifestyleCategories from './components/LifestyleCategories'
import SeasonalContent from './components/SeasonalContent'

export default function LifestylePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero section with featured lifestyle content */}
      <LifestyleFeatured />
      
      {/* Seasonal content section */}
      <SeasonalContent />
      
      {/* Lifestyle categories */}
      <LifestyleCategories />
    </main>
  )
} 