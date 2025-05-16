'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Bookmark, Share2, ThumbsUp } from 'lucide-react'

export default function TrendingCulture() {
  // Mock trending culture articles
  const trendingArticles = [
    {
      id: 'trend-1',
      title: 'The Revival of Indie Cinema Post-Pandemic',
      excerpt: 'Independent filmmakers are experiencing a renaissance as audiences seek authentic storytelling and unique perspectives.',
      category: 'Film',
      author: 'David Chen',
      date: 'October 15, 2023',
      readTime: '6 min read',
      imageUrl: '/images/culture/indie-cinema.jpg',
      likes: 534,
      comments: 87
    },
    {
      id: 'trend-2',
      title: 'How Web3 is Transforming Art Ownership and Creation',
      excerpt: 'Blockchain technology is revolutionizing how artists create, sell and protect their work in the digital age.',
      category: 'Digital Art',
      author: 'Maya Johnson',
      date: 'October 14, 2023',
      readTime: '8 min read',
      imageUrl: '/images/culture/digital-art.jpg',
      likes: 412,
      comments: 56
    },
    {
      id: 'trend-3',
      title: 'The Global Rise of K-Pop and Its Cultural Impact',
      excerpt: 'South Korean pop music continues to break barriers and reshape the global music industry.',
      category: 'Music',
      author: 'Jin Park',
      date: 'October 13, 2023',
      readTime: '7 min read',
      imageUrl: '/images/culture/kpop.jpg',
      likes: 876,
      comments: 124
    }
  ]

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending in Culture</h2>
        <Link 
          href="/topics/culture/trending" 
          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 inline-flex items-center font-medium"
        >
          View All
          <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trendingArticles.map((article, index) => (
          <article 
            key={article.id}
            className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <Image 
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity"></div>
              <div className="absolute top-3 left-3">
                <span className="bg-purple-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {article.category}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 text-gray-900 dark:text-white">
                <Link href={`/articles/${article.id}`}>
                  {article.title}
                </Link>
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {article.excerpt}
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 mr-2"></div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{article.author}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{article.readTime}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 text-xs">
                  <button className="flex items-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                    <span>{article.likes}</span>
                  </button>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span>{article.comments}</span>
                  </span>
                </div>
                
                <div className="flex space-x-2 text-gray-500 dark:text-gray-400">
                  <button className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Link
          href="/topics/culture/trending"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Explore More Cultural Stories
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </section>
  )
} 