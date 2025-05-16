'use client'

import TopicDigest from '@/app/components/TopicDigest'
import TechHero from './components/TechHero'
import TechTrends from './components/TechTrends'
import FeaturedTechArticles from './components/FeaturedTechArticles'
import TechCompanies from './components/TechCompanies'

export default function TechnologyPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <TechHero />
      
      {/* Topic Digest */}
      <TopicDigest category="technology" />
      
      {/* Tech Trends Section */}
      <TechTrends />
      
      {/* Featured Articles */}
      <FeaturedTechArticles />
      
      {/* Tech Companies */}
      <TechCompanies />
    </main>
  )
}
