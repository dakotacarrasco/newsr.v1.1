'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, Calendar, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '@/app/components/ThemeProvider'
import { cn } from '@/app/lib/utils'

export default function SportsHero() {
  const [imageError, setImageError] = useState(false)
  const { theme } = useTheme()

  // Mock data for featured sports article
  const featuredArticle = {
    id: 'sports-hero-1',
    title: 'Lakers Secure Dramatic Overtime Victory Against Celtics in Game 7',
    excerpt: 'In a thrilling conclusion to the NBA Finals, the Los Angeles Lakers claimed their 18th championship after an overtime battle against their long-time rivals. LeBron James secured his legacy with a triple-double performance.',
    imageUrl: '/images/sports/lakers-celtics.jpg',
    category: 'Basketball',
    competition: 'NBA Finals',
    author: 'Mike Johnson',
    publishedAt: 'October 20, 2023',
    readTime: '5 min read'
  }
  
  // Live scores data
  const liveScores = [
    {
      competition: 'Premier League',
      homeTeam: 'Arsenal',
      awayTeam: 'Liverpool',
      homeScore: 2,
      awayScore: 2,
      status: 'LIVE',
      minute: '78',
      link: '/scores/premier-league/arsenal-liverpool'
    },
    {
      competition: 'La Liga',
      homeTeam: 'Barcelona',
      awayTeam: 'Real Madrid',
      homeScore: 1,
      awayScore: 0,
      status: 'LIVE',
      minute: '65',
      link: '/scores/la-liga/barcelona-real-madrid'
    },
    {
      competition: 'NFL',
      homeTeam: 'Chiefs',
      awayTeam: 'Bills',
      homeScore: 24,
      awayScore: 17,
      status: '4th Quarter',
      minute: '',
      link: '/scores/nfl/chiefs-bills'
    }
  ]

  return (
    <section className="mb-12">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main featured article */}
        <div className="lg:w-8/12 relative rounded-xl overflow-hidden shadow-lg transition-shadow">
          <div className="relative h-[400px] lg:h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
            <div className="h-full w-full bg-gray-200 dark:bg-gray-800 relative">
              {!imageError ? (
                <Image 
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  fill
                  priority
                  style={{objectFit: 'cover'}}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-colors">
                  <div className="text-gray-400 dark:text-gray-500 text-2xl font-bold transition-colors">
                    {featuredArticle.category}
                  </div>
                </div>
              )}
            </div>
            
            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-red-600 text-white px-3 py-1 text-sm font-medium rounded transition-colors">
                  {featuredArticle.category}
                </span>
                <span className="bg-blue-600 text-white px-3 py-1 text-sm font-medium rounded transition-colors">
                  {featuredArticle.competition}
                </span>
                <span className="text-gray-300 text-sm flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {featuredArticle.publishedAt}
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                {featuredArticle.title}
              </h1>
              
              <p className="text-gray-200 mb-4 max-w-3xl">
                {featuredArticle.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-300">
                  <span className="text-sm">By {featuredArticle.author}</span>
                  <span className="mx-3">•</span>
                  <span className="text-sm flex items-center">
                    <Clock size={14} className="mr-1" />
                    {featuredArticle.readTime}
                  </span>
                </div>
                
                <Link 
                  href={`/articles/${featuredArticle.id}`}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center text-sm font-medium transition-colors"
                >
                  Read Full Story
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Live scores sidebar */}
        <div className="lg:w-4/12">
          <div className={cn(
            "rounded-xl shadow-md overflow-hidden border transition-colors",
            theme === 'dark' 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          )}>
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
              <h2 className="text-lg font-bold">Live Scores</h2>
            </div>
            
            <div className={cn(
              "divide-y transition-colors", 
              theme === 'dark' ? "divide-gray-700" : "divide-gray-200"
            )}>
              {liveScores.map((score, index) => (
                <Link 
                  key={index} 
                  href={score.link}
                  className={cn(
                    "block p-4 transition-colors",
                    theme === 'dark' 
                      ? "hover:bg-gray-700" 
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                      "text-xs font-medium",
                      theme === 'dark' ? "text-gray-400" : "text-gray-500"
                    )}>
                      {score.competition}
                    </span>
                    <span className={cn(
                      "text-xs font-medium",
                      score.status === 'LIVE' 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-blue-600 dark:text-blue-400"
                    )}>
                      {score.status} {score.minute && `• ${score.minute}'`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium">{score.homeTeam}</div>
                      <div className="font-medium">{score.awayTeam}</div>
                    </div>
                    
                    <div className="w-10 text-center">
                      <div className="font-bold">{score.homeScore}</div>
                      <div className="font-bold">{score.awayScore}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className={cn(
              "p-4 text-center transition-colors",
              theme === 'dark' ? "bg-gray-700" : "bg-gray-50"
            )}>
              <Link href="/scores" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium transition-colors">
                View All Scores
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 