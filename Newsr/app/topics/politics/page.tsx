'use client'

import PoliticsHero from './components/PoliticsHero'
import FeaturedPoliticalArticles from './components/FeaturedPoliticalArticles'
import PoliticalOpinion from './components/PoliticalOpinion'
import LatestPoliticalNews from './components/LatestPoliticalNews'
import PoliticalPolls from './components/PoliticalPolls'
import PoliticalTopics from './components/PoliticalTopics'
import PresidentialApproval from './components/PresidentialApproval'
import PoliticalTrends from './components/PoliticalTrends'

export default function PoliticsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section with main featured political article */}
      <PoliticsHero />
      
      {/* Featured Political Articles Grid */}
      <FeaturedPoliticalArticles />
      
      {/* Presidential Approval Rating */}
      <PresidentialApproval />
      
      {/* Political Opinion Pieces */}
      <PoliticalOpinion />
      
      {/* Latest Political News */}
      <LatestPoliticalNews />
      
      {/* Political Trends */}
      <PoliticalTrends />
      
      {/* Active Political Polls */}
      <PoliticalPolls />
      
      {/* Political Topics (International, Domestic, Election) */}
      <PoliticalTopics />
    </main>
  )
}
