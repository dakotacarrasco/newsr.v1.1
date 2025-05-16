'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, User } from 'lucide-react'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { fetchTopicArticles, TopicArticle } from '@/app/lib/services/topicServices'

export default function BusinessArticles() {
  const [articles, setArticles] = useState<TopicArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await fetchTopicArticles('business', 4)
        setArticles(data)
      } catch (error) {
        console.error('Error loading business articles:', error)
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
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
    )
  }

  if (articles.length === 0) {
    return <div className="py-10 text-center">No business articles found.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {articles.map((article) => (
        <Link key={article.id} href={`/topics/business/${article.id}`}>
          <article className="bg-white dark:bg-gray-800 border overflow-hidden h-full hover:shadow-sm transition-shadow duration-300">
            <div className="relative h-48">
              <Image
                src={article.image_url || '/placeholder.jpg'}
                alt={article.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-0 left-0 bg-green-600 text-white px-2 py-1 text-xs">
                {article.topic}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                {article.summary || article.content.substring(0, 150) + '...'}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                <span>{article.source_name || 'Newsr'}</span>
                <time dateTime={article.publication_date}>
                  {format(new Date(article.publication_date), 'MMM d, yyyy')}
                </time>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
} 