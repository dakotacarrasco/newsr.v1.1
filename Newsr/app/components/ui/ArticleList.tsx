'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Eye, ChevronRight, Bookmark } from 'lucide-react'
import type { Article } from '@/lib/types/article'

interface ArticleListProps {
  title?: string
  articles: Article[] | null
  isLoading?: boolean
  columns?: 1 | 2 | 3 | 4
  layout?: 'grid' | 'list'
  variant?: 'standard' | 'compact'
  showFeatured?: boolean
  showViews?: boolean
  showJustPublished?: boolean
  viewAllLink?: string
  className?: string
}

export function ArticleList({
  title,
  articles,
  isLoading = false,
  columns = 3,
  layout = 'grid',
  variant = 'standard',
  showFeatured = false,
  showViews = false,
  showJustPublished = false,
  viewAllLink,
  className = ''
}: ArticleListProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  // Get time from now
  const getTimeFromNow = (dateString: string) => {
    const published = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours === 1) return '1 hour ago'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return 'Yesterday'
    return formatDate(dateString)
  }

  // Column styles
  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }
  
  // Loading skeleton
  if (isLoading) {
    return (
      <section className={`mb-16 ${className}`}>
        {title && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">{title}</h2>
            <div className="h-1 flex-1 bg-black/10 mx-8" />
            <div className="w-32 h-6 bg-gray-200 animate-pulse"></div>
          </div>
        )}
        
        <div className={`grid ${columnStyles[columns]} gap-6`}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="border-2 border-black bg-white">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 w-16 bg-blue-200 animate-pulse"></div>
                <div className="h-6 w-full bg-gray-200 animate-pulse"></div>
                <div className="h-6 w-3/4 bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 animate-pulse"></div>
                <div className="pt-4 flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }
  
  // Empty state
  if (!articles || articles.length === 0) {
    return null
  }
  
  // Grid Layout
  if (layout === 'grid') {
    return (
      <section className={`mb-16 ${className}`}>
        {title && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">{title}</h2>
            <div className="h-1 flex-1 bg-black/10 mx-8" />
            <span className="text-gray-500">{new Date().toLocaleDateString()}</span>
          </div>
        )}
        
        <div className={`grid ${columnStyles[columns]} gap-6`}>
          {articles.map((article) => (
            <Link href={`/articles/${article.id}`} key={article.id}>
              <article className="border-2 border-black bg-white hover:bg-gray-50 transition-colors h-full">
                <div className="relative h-48">
                  <Image
                    src={article.image_url || '/placeholder.jpg'}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  {showFeatured && article.featured && (
                    <span className="absolute top-3 right-3 bg-yellow-400 text-black px-2 py-1 text-xs font-bold">
                      FEATURED
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <span className="text-blue-600 text-sm border-b-2 border-blue-600">
                    {article.category}
                  </span>
                  <h3 className="text-xl font-bold mt-2 mb-3">{article.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{article.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t-2 border-black">
                    <span>{article.author_id ? `By ${article.author_id}` : 'Editorial Team'}</span>
                    <div className="flex items-center space-x-3">
                      {showViews && article.views && (
                        <span className="flex items-center">
                          <Eye size={14} className="mr-1" />
                          {article.views}
                        </span>
                      )}
                      <span>
                        {showJustPublished 
                          ? getTimeFromNow(article.published_at)
                          : formatDate(article.published_at)
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        
        {viewAllLink && (
          <div className="mt-8 text-center">
            <Link 
              href={viewAllLink} 
              className="inline-flex items-center justify-center px-5 py-2 border-2 border-black bg-white hover:bg-gray-100 font-medium"
            >
              View All <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>
        )}
      </section>
    )
  }
  
  // List Layout
  return (
    <section className={`mb-16 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          <div className="h-1 flex-1 bg-black/10 mx-8" />
          {viewAllLink && (
            <Link href={viewAllLink} className="text-blue-600 hover:underline font-medium">
              View All
            </Link>
          )}
        </div>
      )}
      
      <div className="border-2 border-black divide-y-2 divide-black">
        {articles.map((article) => (
          <Link href={`/articles/${article.id}`} key={article.id} className="block">
            <article className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center">
                {variant === 'standard' && (
                  <div className="relative w-full md:w-40 h-32 md:h-24 mb-4 md:mb-0 md:mr-6 shrink-0">
                    <Image
                      src={article.image_url || '/placeholder.jpg'}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-blue-600 text-sm font-medium mr-4">
                      {article.category}
                    </span>
                    {showJustPublished && (
                      <span className="text-gray-500 text-sm flex items-center">
                        <Clock size={14} className="mr-1" />
                        {getTimeFromNow(article.published_at)}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-1">{article.title}</h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span>{article.author_id ? `By ${article.author_id}` : 'Editorial Team'}</span>
                      {!showJustPublished && (
                        <span>{formatDate(article.published_at)}</span>
                      )}
                    </div>
                    
                    {showViews && article.views && (
                      <span className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        {article.views}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}