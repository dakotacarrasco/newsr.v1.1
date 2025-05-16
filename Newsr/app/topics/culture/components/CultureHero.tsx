'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Calendar } from 'lucide-react'

export default function CultureHero() {
  // Featured article data
  const featuredArticle = {
    id: 'culture-1',
    title: 'How Global Art Movements Are Reshaping Modern Cultural Identity',
    excerpt: 'As boundaries blur between traditional and contemporary, a new generation of artists is challenging conventional notions of cultural heritage and creating powerful new global narratives.',
    imageUrl: '/images/culture/global-art-movements.jpg',
    author: 'Elena Rodriguez',
    category: 'Art & Design',
    date: 'October 15, 2023',
    readTime: '7 min read'
  }
  
  // Featured events
  const featuredEvents = [
    {
      id: 'event-1',
      title: 'International Film Festival',
      date: 'November 5-12, 2023',
      location: 'New York City',
      category: 'Film',
      imageUrl: '/images/culture/film-festival.jpg'
    },
    {
      id: 'event-2',
      title: 'Modern Art Exhibition',
      date: 'October 28 - December 15, 2023',
      location: 'London',
      category: 'Art',
      imageUrl: '/images/culture/art-exhibition.jpg'
    },
    {
      id: 'event-3',
      title: 'World Music Celebration',
      date: 'November 18-20, 2023',
      location: 'Berlin',
      category: 'Music',
      imageUrl: '/images/culture/music-celebration.jpg'
    }
  ]

  return (
    <section className="mb-12">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Featured article */}
        <div className="lg:w-7/12 relative">
          <div className="relative h-[400px] lg:h-[500px] overflow-hidden rounded-xl shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
            <div className="h-full w-full bg-gray-200 dark:bg-gray-700 relative">
              <Image 
                src={featuredArticle.imageUrl}
                alt={featuredArticle.title}
                fill
                priority
                style={{objectFit: 'cover'}}
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <span className="inline-block bg-purple-600 text-white px-3 py-1 text-sm font-medium rounded-full mb-3">
                {featuredArticle.category}
              </span>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                {featuredArticle.title}
              </h1>
              
              <p className="text-gray-300 mb-4 max-w-2xl">
                {featuredArticle.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-300">
                  <span className="text-sm">By {featuredArticle.author}</span>
                  <span className="mx-3">•</span>
                  <span className="text-sm flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {featuredArticle.date}
                  </span>
                </div>
                
                <Link 
                  href={`/articles/${featuredArticle.id}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center text-sm font-medium transition-colors"
                >
                  Read Article
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured events */}
        <div className="lg:w-5/12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 h-full">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
              <h2 className="text-lg font-bold">Featured Cultural Events</h2>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {featuredEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-gray-200 dark:bg-gray-700">
                      <Image 
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        style={{objectFit: 'cover'}}
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 block">
                        {event.category}
                      </span>
                      
                      <h3 className="font-bold text-base mb-1 text-gray-900 dark:text-white">
                        <Link href={`/events/culture/${event.id}`} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          {event.title}
                        </Link>
                      </h3>
                      
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={12} className="mr-1" />
                        <span>{event.date}</span>
                      </div>
                      
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {event.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900 text-center">
              <Link 
                href="/events/culture" 
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 inline-flex items-center font-medium text-sm"
              >
                View All Cultural Events
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 