'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Eye, ArrowLeft, Bookmark, Share2 } from 'lucide-react'
import { Article } from '@/app/lib/supabase'
import { ArticleSkeleton } from '@/app/components/shared/Skeletons'
import { formatViewCount } from '@/app/lib/utils/formatters'
import { getArticleById, incrementArticleViews, toggleArticleLike } from '@/app/lib/supabase'
import SaveArticleButton from '@/app/components/SaveArticleButton'
import { supabase } from '@/app/lib/supabase/client'

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadArticle() {
      if (!slug) return
      
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Fetch the article data
      const articleData = await getArticleById(slug as string)
      
      if (articleData) {
        setArticle(articleData)
        setLikeCount(articleData.likes || 0)
        
        // Increment view count
        await incrementArticleViews(slug as string)
        
        // Check if article is bookmarked (could be from localStorage or user profile)
        const bookmarked = localStorage.getItem(`bookmark-${slug}`) === 'true'
        setIsBookmarked(bookmarked)
        
        // Check if article is liked (could be from localStorage or user profile)
        const liked = localStorage.getItem(`like-${slug}`) === 'true'
        setIsLiked(liked)
      }
      
      setLoading(false)
    }
    
    loadArticle()
  }, [slug])

  const toggleBookmark = () => {
    const newStatus = !isBookmarked
    setIsBookmarked(newStatus)
    
    // Save bookmark status to localStorage (in a real app, you might save to user profile)
    localStorage.setItem(`bookmark-${slug}`, newStatus.toString())
  }

  const toggleLike = async () => {
    const newStatus = !isLiked
    setIsLiked(newStatus)
    setLikeCount(prevCount => newStatus ? prevCount + 1 : prevCount - 1)
    
    // Save like status to localStorage
    localStorage.setItem(`like-${slug}`, newStatus.toString())
    
    // Update like count in database
    await toggleArticleLike(slug as string, newStatus)
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <ArticleSkeleton />
      </main>
    )
  }

  if (!article) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to homepage
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Back button */}
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to homepage</span>
        </Link>
      </div>

      {/* Article header */}
      <header className="mb-8 border-2 border-black bg-white p-8 relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute -top-4 -left-4 bg-red-500 h-8 w-8 border-2 border-black"></div>
        
        <div className="mb-6">
          <span className="text-sm font-medium inline-block px-2 py-1 bg-gray-100 rounded-sm mb-4">
            {article.category}
          </span>
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <p className="text-xl text-gray-600">{article.description}</p>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t-2 border-black">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatViewCount(article.views)} views
            </span>
            <button 
              onClick={toggleLike}
              className={`flex items-center gap-1 ${isLiked ? 'text-red-600' : ''}`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill={isLiked ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {formatViewCount(likeCount)}
            </button>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <SaveArticleButton articleId={slug as string} className="px-2 py-1" />
            )}
            <button className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </header>

      {/* Featured image */}
      <div className="mb-12 relative h-[400px] border-2 border-black overflow-hidden">
        <Image
          src={article.image_url || '/placeholder.jpg'}
          alt={article.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Keywords */}
      {article.keywords && article.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {article.keywords.map((keyword, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      {/* Article content */}
      <article className="prose prose-lg max-w-none border-2 border-black bg-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div dangerouslySetInnerHTML={{ __html: formatContent(article.content) }} />
      </article>

      {/* Author info */}
      <div className="mt-12 border-2 border-black bg-white p-6 flex items-center gap-6">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 relative overflow-hidden">
          <Image
            src="/placeholder-author.jpg"
            alt="Author"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-bold text-lg">Written by Editorial Team</h3>
          <p className="text-gray-600">Our editorial team brings you the latest news and analysis on politics, technology, and global affairs.</p>
        </div>
      </div>

      {/* Related articles section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <article key={i} className="border-2 border-black bg-white hover:bg-stone-50 transition-colors">
              <div className="relative h-48">
                <Image
                  src={`/placeholder-${i}.jpg`}
                  alt="Related article"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <span className="text-sm text-blue-600 border-b-2 border-blue-600">Politics</span>
                <h3 className="text-xl font-bold mt-2 mb-3">The Changing Landscape of International Relations</h3>
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t-2 border-black">
                  <span>Politics Desk</span>
                  <span>4 min read</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

// Helper function to format content with Markdown
function formatContent(content: string): string {
  // This is a simple implementation - in a real app you would use a proper Markdown parser
  return content
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/- (.*)/g, '<li>$1</li>')
    .replace(/<li>(.*?)<\/li>/g, (match) => `<ul>${match}</ul>`)
    .replace(/<ul><li>(.*?)<\/li><\/ul>/g, '<ul><li>$1</li></ul>')
    .replace(/\d\. (.*)/g, '<li>$1</li>')
    .replace(/<li>(.*?)<\/li>/g, (match) => `<ol>${match}</ol>`)
    .replace(/<ol><li>(.*?)<\/li><\/ol>/g, '<ol><li>$1</li></ol>')
}
