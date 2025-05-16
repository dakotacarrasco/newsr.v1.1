'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Music, Film, Palette, Theater, ChevronRight } from 'lucide-react'
import { fetchTopicArticles, TopicArticle, generateSlug } from '@/app/lib/services/topicServices'
import TopicDigest from '@/app/components/TopicDigest'
import { format } from 'date-fns'

export default function CulturePage() {
  const [articles, setArticles] = useState<TopicArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await fetchTopicArticles('culture', 6)
        setArticles(data)
      } catch (error) {
        console.error('Error loading culture articles:', error)
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [])

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-8">
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
          <Image 
            src="/culture-banner.jpg" 
            alt="Culture Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Culture</h1>
            <p className="text-white/90 max-w-md">
              Explore the world of arts, entertainment, literature, and cultural trends that shape our society.
            </p>
          </div>
        </div>
      </section>
      
      {/* Topic Digest */}
      <TopicDigest category="culture" />
      
      {/* Categories */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/topics/culture/arts" className="bg-white dark:bg-gray-800 p-4 text-center rounded-xl border border-purple-100 hover:bg-purple-50 hover:border-purple-200 transition-colors">
            <Palette className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <span className="font-medium">Arts</span>
          </Link>
          <Link href="/topics/culture/music" className="bg-white dark:bg-gray-800 p-4 text-center rounded-xl border border-purple-100 hover:bg-purple-50 hover:border-purple-200 transition-colors">
            <Music className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <span className="font-medium">Music</span>
          </Link>
          <Link href="/topics/culture/film" className="bg-white dark:bg-gray-800 p-4 text-center rounded-xl border border-purple-100 hover:bg-purple-50 hover:border-purple-200 transition-colors">
            <Film className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <span className="font-medium">Film & TV</span>
          </Link>
          <Link href="/topics/culture/books" className="bg-white dark:bg-gray-800 p-4 text-center rounded-xl border border-purple-100 hover:bg-purple-50 hover:border-purple-200 transition-colors">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <span className="font-medium">Books</span>
          </Link>
        </div>
      </section>
      
      {/* Latest Articles */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest in Culture</h2>
          <Link href="/topics/culture/all" className="text-purple-600 hover:underline flex items-center">
            View All
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-5/6 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="py-10 text-center">No culture articles found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              // Create a slug for the article if it doesn't exist
              const articleSlug = article.slug || generateSlug(article.title || article.topic || 'article');
              const articleUrl = `/topics/culture/article/${article.id}/${articleSlug || article.id}`;
              
              return (
                <Link key={article.id} href={articleUrl}>
                  <article className="bg-white dark:bg-gray-800 border overflow-hidden h-full hover:shadow-sm transition-shadow duration-300">
                    <div className="relative h-48">
                      <Image
                        src={article.image_url || '/placeholder.jpg'}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-0 left-0 bg-purple-600 text-white px-2 py-1 text-xs">
                        {article.topic}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold mb-2 line-clamp-2">{article.headline || article.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                        {article.summary || article.content.substring(0, 150) + '...'}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span>{format(new Date(article.publication_date), 'MMMM d, yyyy')}</span>
                        <span>{article.topic}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  )
} 