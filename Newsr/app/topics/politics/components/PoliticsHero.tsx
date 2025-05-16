'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function PoliticsHero() {
  const [isHovered, setIsHovered] = useState(false)
  
  // Mock featured article data
  const featuredArticle = {
    id: 'pol-1',
    title: 'Latest Congressional Bill on Infrastructure Passes with Bipartisan Support',
    excerpt: 'The Senate approved a $1.2 trillion infrastructure bill with support from both parties, marking a significant legislative victory that will fund improvements to roads, bridges, and broadband internet access across the nation.',
    imageUrl: '/images/politics/infrastructure.jpg',
    category: 'Legislation',
    date: 'August 10, 2023',
    author: 'Michael Reynolds',
    readTime: '6 min read'
  }
  
  return (
    <section className="mb-12">
      <div 
        className="relative rounded-lg overflow-hidden" 
        style={{ height: '500px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Placeholder image if actual image is not available */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800/0 via-gray-800/60 to-gray-900/90 z-10" />
        <div className="h-full w-full bg-gray-300 relative">
          <Image 
            src={featuredArticle.imageUrl}
            alt={featuredArticle.title}
            fill
            style={{objectFit: 'cover'}}
            priority
            onError={(e) => {
              // Fallback to a placeholder color if image fails to load
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="flex items-center mb-3">
            <span className="bg-blue-600 text-white px-3 py-1 text-sm font-medium rounded-full">
              {featuredArticle.category}
            </span>
            <span className="ml-3 text-gray-200 text-sm">
              {featuredArticle.date} • {featuredArticle.readTime}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {featuredArticle.title}
          </h1>
          
          <p className="text-gray-200 mb-4 max-w-3xl">
            {featuredArticle.excerpt}
          </p>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-400 mr-3"></div>
            <span className="text-gray-200 text-sm font-medium">
              By {featuredArticle.author}
            </span>
          </div>
          
          <Link 
            href={`/articles/${featuredArticle.id}`} 
            className={`mt-4 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition-transform ${isHovered ? 'transform translate-y-0' : 'transform translate-y-1 opacity-0'}`}
          >
            Read Full Story
          </Link>
        </div>
      </div>
    </section>
  )
} 