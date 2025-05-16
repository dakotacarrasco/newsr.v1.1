'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Clock, Share2, BookmarkPlus } from 'lucide-react'

export default function LifestyleFeatured() {
  // Mock data for featured lifestyle articles
  const featuredArticles = [
    {
      id: 'lifestyle-1',
      title: 'The Minimalist Guide to Sustainable Living',
      excerpt: 'How to embrace minimalism while reducing your environmental impact. Small changes that make a big difference.',
      imageUrl: '/images/lifestyle/sustainable-living.jpg',
      category: 'Sustainability',
      author: 'Emma Richards',
      date: 'October 18, 2023',
      readTime: '5 min read',
      likes: 248
    },
    {
      id: 'lifestyle-2',
      title: 'Modern Meditation Practices for Busy Professionals',
      excerpt: 'Finding zen in a hectic work schedule. Techniques that can be practiced anywhere, even during your commute.',
      imageUrl: '/images/lifestyle/meditation.jpg',
      category: 'Wellness',
      author: 'Dr. James Wilson',
      date: 'October 16, 2023',
      readTime: '7 min read',
      likes: 327
    },
    {
      id: 'lifestyle-3',
      title: 'Global Culinary Trends: Fusion Cuisine Making Waves',
      excerpt: 'Explore how chefs around the world are blending culinary traditions to create innovative dining experiences.',
      imageUrl: '/images/lifestyle/fusion-cuisine.jpg',
      category: 'Food',
      author: 'Sofia Martinez',
      date: 'October 15, 2023',
      readTime: '6 min read',
      likes: 185
    }
  ]

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Featured Lifestyle</h2>
        <Link href="/topics/lifestyle/featured" className="text-blue-600 hover:underline">
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {featuredArticles.map((article, index) => (
          <article key={article.id} className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="relative h-64">
              <div className="h-full w-full bg-gray-200 relative">
                <Image 
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  style={{objectFit: 'cover'}}
                  className="group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-white text-gray-800 shadow-sm">
                  {article.category}
                </span>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md text-gray-700 hover:text-red-500 transition-colors">
                  <Heart size={16} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md text-gray-700 hover:text-blue-500 transition-colors ml-2">
                  <BookmarkPlus size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <Link href={`/articles/${article.id}`}>
                <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
              </Link>
              
              <p className="text-gray-600 text-sm mb-4">
                {article.excerpt}
              </p>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                  <div>
                    <div className="text-sm font-medium">{article.author}</div>
                    <div className="text-xs text-gray-500">{article.date}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-500 text-xs">
                  <div className="flex items-center mr-3">
                    <Clock size={12} className="mr-1" />
                    <span>{article.readTime}</span>
                  </div>
                  <div className="flex items-center">
                    <Heart size={12} className="mr-1 text-red-400" />
                    <span>{article.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
} 