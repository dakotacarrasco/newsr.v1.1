'use client'

import { Article } from '@/app/lib/supabase'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Heart, Share2, Eye, User } from 'lucide-react'
import { useState } from 'react'
import { incrementArticleViews, toggleArticleLike } from '@/app/lib/services/articleServices'

interface ArticleDetailTemplateProps {
  article: Article | null
  isLoading: boolean
}

export function ArticleDetailTemplate({ article, isLoading }: ArticleDetailTemplateProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(article?.likes || 0)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-10"></div>
          <div className="h-96 bg-gray-200 rounded mb-10"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
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
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link 
          href="/"
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} className="mr-2" />
          Return to Home
        </Link>
      </div>
    )
  }

  const handleLike = async () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    await toggleArticleLike(article.id, !liked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description || article.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <article className="container mx-auto px-4 py-10">
      {/* Back button */}
      <Link 
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Home
      </Link>
      
      {/* Article header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        
        {article.description && (
          <p className="text-xl text-gray-600 mb-6">{article.description}</p>
        )}
        
        <div className="flex flex-wrap justify-between items-center py-4 border-y border-gray-200">
          <div className="flex items-center space-x-4 mb-2 md:mb-0">
            <div className="flex items-center">
              <User size={14} className="mr-1" />
              <span className="text-sm text-gray-600">
                {article.author_id?.substring(0, 8)}
              </span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span className="text-sm text-gray-600">
                {format(new Date(article.published_at), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center">
              <Eye size={14} className="mr-1" />
              <span className="text-sm text-gray-600">{article.views} views</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                liked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
              <span>{likeCount}</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Article image */}
      {article.image_url && (
        <div className="mb-8 relative h-96 md:h-[500px] overflow-hidden rounded-lg">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform hover:scale-105 duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}
      
      {/* Article content */}
      <div className="prose lg:prose-xl max-w-none">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      
      {/* Tags/Keywords */}
      {article.keywords && article.keywords.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {article.keywords.map((keyword, index) => (
              <Link 
                key={index} 
                href={`/search?q=${keyword}`}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-800"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
} 