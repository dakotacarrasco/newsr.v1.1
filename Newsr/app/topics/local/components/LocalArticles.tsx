'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { fetchLocalArticlesByCity, LocalArticle } from '@/app/lib/services/localServices'

interface LocalArticlesProps {
  city: string;
  limit?: number;
}

export default function LocalArticles({ city, limit = 4 }: LocalArticlesProps) {
  const [articles, setArticles] = useState<LocalArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      try {
        // fetchLocalArticlesByCity returns { articles, total }
        const result = await fetchLocalArticlesByCity(city, { limit })
        setArticles(result.articles)
      } catch (error) {
        console.error(`Error loading articles for ${city}:`, error)
        setArticles([]) // Ensure we always have an array
      } finally {
        setLoading(false)
      }
    }

    if (city) {
      loadArticles()
    }
  }, [city, limit])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(limit)].map((_, i) => (
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

  if (!articles || articles.length === 0) {
    return (
      <div className="py-10 text-center">
        No articles found for {city}. 
        <p className="text-sm text-gray-500 mt-2">
          Check back soon for local news in this area.
        </p>
      </div>
    )
  }

  // Format the date safely in case of invalid date strings
  const formatDateSafe = (dateString?: string) => {
    if (!dateString) return 'No date';
    
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch (error) {
      console.error('Invalid date format:', dateString);
      return 'Invalid date';
    }
  }

  // Ensure we have valid image URLs and use consistent placeholders
  const getImageUrl = (url?: string) => {
    if (!url) return '/images/placeholder.jpg';
    
    // If it's a relative URL missing the leading slash
    if (!url.startsWith('http') && !url.startsWith('/')) {
      return `/${url}`;
    }
    
    return url;
  }

  // Clean up content by removing headers and special sections
  const cleanContent = (content: string): string => {
    if (!content) return '';
    
    // Remove summary, AP source headers, conclusion sections, and any text in double asterisks
    let cleaned = content
      .replace(/\*\*Summary:?\*\*.*?(\n\n|\n|$)/g, '')
      .replace(/\*\*Conclusion:?\*\*.*?(\n\n|\n|$)/g, '')
      .replace(/\*\*[A-Z\s]+\([A-Z]+\)\*\*\s—/g, '')
      .replace(/\*\*.*?\*\*/g, '') // Remove anything in double asterisks
      .replace(/news\s*\n/g, '')
      .replace(/Read original article/g, '');
    
    // Further clean up any other special formatting
    cleaned = cleaned.trim();
    
    // Return a preview with reasonable length
    return cleaned.length > 150 ? cleaned.substring(0, 150) + '...' : cleaned;
  };

  // Generate a URL-friendly slug from the title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
      .trim();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/topics/local/articles/${article.id}/${generateSlug(article.title)}`}
          className="block"
        >
          <article className="bg-white dark:bg-gray-800 border overflow-hidden h-full hover:shadow-sm transition-shadow duration-300">
            {article.image_url && (
              <div className="relative h-48">
                <Image
                  src={getImageUrl(article.image_url)}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
                {article.category && article.category.toLowerCase() !== 'news' && (
                  <div className="absolute top-0 left-0 bg-blue-600 text-white px-2 py-1 text-xs">
                    {article.category}
                  </div>
                )}
              </div>
            )}
            
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2 line-clamp-2">{article.title ? article.title.replace(/\*\*.*?\*\*/g, '') : ''}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                {article.content ? cleanContent(article.content) : (article.summary || article.description || 'No description available')}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                <time dateTime={article.published_at || article.publication_date}>
                  {formatDateSafe(article.published_at || article.publication_date)}
                </time>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
} 