'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { fetchTopicArticleById, fetchRelatedTopicArticles, TopicArticle } from '@/app/lib/services/topicServices'
import { ChevronLeft, Clock, Link as LinkIcon, ExternalLink, Share2 } from 'lucide-react'
import { format } from 'date-fns'

export default function TopicArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<TopicArticle | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<TopicArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticle() {
      if (!params.id || typeof params.id !== 'string') return
      
      setLoading(true)
      try {
        const data = await fetchTopicArticleById(params.id)
        setArticle(data)
        
        if (data) {
          const related = await fetchRelatedTopicArticles(
            data.category,
            data.topic,
            data.id,
            3
          )
          setRelatedArticles(related)
        }
      } catch (error) {
        console.error('Error loading article:', error)
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [params.id, params.category])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link 
          href={`/topics/${params.category}`}
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to {params.category}
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href={`/topics/${article.category}`}
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <article className="lg:col-span-8">
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{article.title}</h1>
            {article.summary && (
              <p className="text-xl text-gray-600 mb-4">
                {article.summary}
              </p>
            )}
            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                <time dateTime={article.publication_date}>
                  {format(new Date(article.publication_date), 'MMMM d, yyyy')}
                </time>
              </div>
              {article.source_name && (
                <div className="flex items-center">
                  <LinkIcon size={14} className="mr-1" />
                  <span>Source: {article.source_name}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {article.topic}
                </span>
              </div>
            </div>
          </header>
          
          {article.image_url && (
            <div className="mb-8 relative aspect-video w-full rounded-lg overflow-hidden">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover"
              />
              {article.image_prompt && (
                <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2">
                  Prompt: {article.image_prompt}
                </div>
              )}
            </div>
          )}
          
          <div className="prose prose-lg max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {article.source_url && (
            <div className="mt-8 pt-4 border-t border-gray-200">
              <Link 
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:underline"
              >
                Read original source
                <ExternalLink size={14} className="ml-1" />
              </Link>
            </div>
          )}
          
          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">
                Category: 
                <Link 
                  href={`/topics/${article.category}`}
                  className="ml-1 text-blue-600 hover:underline"
                >
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </Link>
              </span>
            </div>
            <button className="inline-flex items-center text-gray-600 hover:text-blue-600">
              <Share2 size={18} className="mr-1" />
              Share
            </button>
          </div>
        </article>
        
        <aside className="lg:col-span-4">
          <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Related Articles</h2>
            
            {relatedArticles.length === 0 ? (
              <p className="text-gray-600 text-sm">No related articles found.</p>
            ) : (
              <div className="space-y-4">
                {relatedArticles.map((relatedArticle) => (
                  <Link 
                    key={relatedArticle.id} 
                    href={`/topics/${relatedArticle.category}/${relatedArticle.id}`}
                    className="block"
                  >
                    <div className="group">
                      {relatedArticle.image_url && (
                        <div className="relative h-32 w-full mb-2 rounded overflow-hidden">
                          <Image
                            src={relatedArticle.image_url}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(relatedArticle.publication_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  )
} 