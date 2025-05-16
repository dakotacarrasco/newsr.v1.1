'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Search, TrendingUp, Monitor } from 'lucide-react'
import { useState } from 'react'

export default function TechHero() {
  const [searchQuery, setSearchQuery] = useState('')
  const [imageError, setImageError] = useState(false)
  
  // Featured article data
  const featuredArticle = {
    id: 'tech-hero-1',
    title: 'AI Revolution: How Machine Learning is Transforming Industries',
    excerpt: 'From healthcare to finance, artificial intelligence is reshaping how businesses operate. We explore the latest breakthroughs and what they mean for the future.',
    imageUrl: '/images/technology/hero/tech-hero.jpg',
    category: 'Artificial Intelligence',
    author: 'Dr. Sarah Chen',
    publishedAt: 'October 15, 2023',
    readTime: '8 min read'
  }
  
  // Trending topics in technology
  const trendingTopics = [
    'Quantum Computing',
    'AI Ethics',
    'Web3',
    'Green Tech',
    'Cybersecurity'
  ]

  return (
    <section className="mb-12">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Hero Article */}
        <div className="lg:w-8/12 relative overflow-hidden rounded-xl border border-gray-200 shadow-lg">
          <Link href={`/articles/${featuredArticle.id}`} className="block relative">
            <div className="relative h-80 lg:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-black/90 z-10" />
              <div className="h-full w-full bg-gray-200 relative">
                {!imageError ? (
                  <Image 
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    fill
                    priority
                    style={{ objectFit: 'cover' }}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Monitor className="h-16 w-16 text-blue-300 mb-3" />
                    <span className="text-blue-500 font-medium">Technology</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <div className="flex items-center mb-3">
                <span className="bg-blue-600 text-white px-3 py-1 text-sm font-medium rounded">
                  {featuredArticle.category}
                </span>
                <span className="ml-3 text-gray-300 text-sm">
                  {featuredArticle.publishedAt} • {featuredArticle.readTime}
                </span>
              </div>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                {featuredArticle.title}
              </h1>
              
              <p className="text-gray-300 mb-4 max-w-3xl text-sm md:text-base">
                {featuredArticle.excerpt}
              </p>
              
              <div className="flex items-center text-white">
                <span className="text-sm font-medium">
                  By {featuredArticle.author}
                </span>
                <span className="ml-auto text-white flex items-center text-sm hover:underline">
                  Read Full Article 
                  <ArrowRight size={14} className="ml-2" />
                </span>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Right column: search and trending */}
        <div className="lg:w-4/12 flex flex-col gap-6">
          {/* Search box */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Search Technology News</h2>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="AI, blockchain, quantum..."
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500">
                <Search size={20} />
              </button>
            </div>
          </div>
          
          {/* Trending topics */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-grow">
            <div className="flex items-center mb-4">
              <TrendingUp size={20} className="text-red-500 mr-2" />
              <h2 className="text-xl font-bold">Trending in Tech</h2>
            </div>
            
            <ul className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <li key={index}>
                  <Link 
                    href={`/topics/technology/${topic.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                  >
                    <span className="font-medium">{topic}</span>
                    <ArrowRight size={16} className="text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <Link href="/topics/technology/trending" className="text-blue-600 text-sm font-medium hover:underline">
                View All Trending Topics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 