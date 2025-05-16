'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Clock, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchFeaturedTopicArticles, TopicArticle } from '@/app/lib/services/topicServices'
import { format } from 'date-fns'

export default function FeaturedTechArticles() {
  const [articles, setArticles] = useState<TopicArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await fetchFeaturedTopicArticles('technology', 3)
        setArticles(data)
      } catch (error) {
        console.error('Error loading tech articles:', error)
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [])

  // Fallback to display when loading or no articles found
  if (loading) {
    return <div className="py-10 text-center">Loading featured articles...</div>
  }

  if (articles.length === 0) {
    return <div className="py-10 text-center">No featured technology articles found.</div>
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Articles</h2>
        <Link href="/topics/technology/featured" className="text-blue-600 hover:underline flex items-center">
          View All
          <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article 
            key={article.id} 
            className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative h-48">
              <div className="h-full w-full bg-gray-200 relative">
                <Image 
                  src={article.image_url || '/images/placeholder.jpg'}
                  alt={article.title}
                  fill
                  style={{objectFit: 'cover'}}
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div className="absolute top-3 left-3">
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                <Link href={`/topics/${article.category}/${article.id}`} className="hover:text-blue-600 transition-colors">
                  {article.title}
                </Link>
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.summary || article.content.substring(0, 150) + '...'}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center">
                  <UserRound size={12} className="mr-1" />
                  <span>{article.source_name || 'Newsr'}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  <span>{format(new Date(article.publication_date), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
} 