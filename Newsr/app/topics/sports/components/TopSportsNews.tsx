'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, ImageIcon } from 'lucide-react'
import { useState } from 'react'

export default function TopSportsNews() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }))
  }
  
  // Mock top sports news data
  const topNewsArticles = [
    {
      id: 'sports-news-1',
      title: 'Messi Confirms Final Season with Inter Miami as World Cup Looms',
      excerpt: 'The Argentine superstar has announced his intention to retire from club football after the upcoming MLS season, focusing on one last World Cup campaign with Argentina.',
      imageUrl: '/images/sports/messi-miami.jpg',
      category: 'Football',
      date: 'October 19, 2023',
      readTime: '4 min read'
    },
    {
      id: 'sports-news-2',
      title: 'Olympic Committee Unveils New Sports for 2028 Los Angeles Games',
      excerpt: 'Cricket, flag football, and squash have been added to the Olympic program for the 2028 Games in Los Angeles, reflecting growing global interest in these sports.',
      imageUrl: '/images/sports/la-olympics.jpg',
      category: 'Olympics',
      date: 'October 18, 2023',
      readTime: '5 min read'
    },
    {
      id: 'sports-news-3',
      title: 'Hamilton Signs Two-Year Extension with Mercedes F1 Team',
      excerpt: 'The seven-time Formula 1 champion has committed to Mercedes until 2026, silencing rumors of retirement and setting the stage for continued title challenges.',
      imageUrl: '/images/sports/hamilton-mercedes.jpg',
      category: 'Motorsport',
      date: 'October 17, 2023',
      readTime: '3 min read'
    },
    {
      id: 'sports-news-4',
      title: 'WNBA Expansion Draft: Chicago and Nashville Teams Make First Selections',
      excerpt: 'The WNBA\'s two newest franchises have begun building their rosters with promising draft picks and veteran talents from existing teams.',
      imageUrl: '/images/sports/wnba-draft.jpg',
      category: 'Basketball',
      date: 'October 16, 2023',
      readTime: '6 min read'
    }
  ]

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Top Sports Stories</h2>
        <Link href="/topics/sports/news" className="text-blue-600 hover:underline flex items-center">
          More Sports News
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topNewsArticles.slice(0, 2).map((article) => (
          <article key={article.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
            <div className="relative h-60">
              <div className="h-full w-full bg-gray-200 relative">
                {!imageErrors[article.id] ? (
                  <Image 
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    style={{objectFit: 'cover'}}
                    onError={() => handleImageError(article.id)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                      <div className="text-gray-400 font-medium mt-2">
                        {article.category}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute top-4 left-4">
                <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded">
                  {article.category}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-xl font-bold mb-2">
                <Link href={`/articles/${article.id}`} className="hover:text-blue-600 transition-colors">
                  {article.title}
                </Link>
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                {article.excerpt}
              </p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{article.date}</span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {article.readTime}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {topNewsArticles.slice(2, 4).map((article) => (
          <article key={article.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 flex flex-col md:flex-row">
            <div className="md:w-1/3 relative">
              <div className="h-full w-full bg-gray-200 relative" style={{ minHeight: '160px' }}>
                {!imageErrors[article.id] ? (
                  <Image 
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    style={{objectFit: 'cover'}}
                    onError={() => handleImageError(article.id)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      <div className="text-gray-400 text-xs font-medium mt-1">
                        {article.category}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-2/3 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-red-600">
                  {article.category}
                </span>
                <span className="text-xs text-gray-500">
                  {article.date}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2">
                <Link href={`/articles/${article.id}`} className="hover:text-blue-600 transition-colors">
                  {article.title}
                </Link>
              </h3>
              
              <p className="text-gray-600 text-sm line-clamp-2">
                {article.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
} 