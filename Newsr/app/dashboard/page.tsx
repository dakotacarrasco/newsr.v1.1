'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bookmark, Clock, ThumbsUp, Loader2, Settings, Newspaper, Bell, LayoutGrid } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/app/components/auth/ProtectedRoute'
import { useAuth } from '@/app/context/AuthContext'
import { useTheme } from '@/app/components/ThemeProvider'

// Define interfaces for the data types
interface SavedArticle {
  id: string
  user_id: string
  article_id: string
  created_at: string
  articles: {
    id: string
    title: string
    slug: string
    [key: string]: any
  }
  [key: string]: any
}

interface ArticleView {
  id: string
  user_id: string
  article_id: string
  viewed_at: string
  articles: {
    id: string
    title: string
    slug: string
    [key: string]: any
  }
  [key: string]: any
}

function DashboardContent() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<ArticleView[]>([])
  const router = useRouter()

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return
      
      setLoading(true)
      
      // Fetch saved articles
      const { data: saved } = await supabase
        .from('saved_articles')
        .select('*, articles(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      // Fetch recently viewed
      const { data: recent } = await supabase
        .from('article_views')
        .select('*, articles(*)')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(5)
      
      setSavedArticles(saved || [])
      setRecentlyViewed(recent || [])
      setLoading(false)
    }
    
    fetchUserData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-white dark:bg-gray-900 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
            </div>
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Saved Articles</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{savedArticles.length}</p>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white mr-3">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Recently Viewed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{recentlyViewed.length}</p>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white mr-3">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Notifications</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">3</p>
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white mr-3">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400">Topics</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">5</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Saved Articles */}
          <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 relative shadow-sm">
            <div className="absolute -top-2 -left-2 h-6 w-6 border-2 border-black dark:border-gray-700 rounded-lg bg-blue-500"></div>
            <div className="absolute -bottom-2 -right-2 h-6 w-6 border-2 border-black dark:border-gray-700 rounded-lg bg-purple-500"></div>
            
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Bookmark className="w-5 h-5 text-blue-500" />
              Saved Articles
            </h2>
            
            {savedArticles.length === 0 ? (
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                <Bookmark className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">You haven't saved any articles yet.</p>
                <Link 
                  href="/"
                  className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Browse articles to save
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedArticles.map((item: any) => (
                  <Link 
                    key={item.id} 
                    href={`/articles/${item.articles.slug}`}
                    className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.articles.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Saved on {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
                
                {savedArticles.length > 0 && (
                  <Link 
                    href="/dashboard/saved"
                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 font-medium"
                  >
                    <span>View all saved articles</span>
                    <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                  </Link>
                )}
              </div>
            )}
          </div>
          
          {/* Recently Viewed */}
          <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 relative shadow-sm">
            <div className="absolute -top-2 -left-2 h-6 w-6 border-2 border-black dark:border-gray-700 rounded-lg bg-purple-500"></div>
            <div className="absolute -bottom-2 -right-2 h-6 w-6 border-2 border-black dark:border-gray-700 rounded-lg bg-blue-500"></div>
            
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Clock className="w-5 h-5 text-purple-500" />
              Recently Viewed
            </h2>
            
            {recentlyViewed.length === 0 ? (
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">You haven't viewed any articles yet.</p>
                <Link 
                  href="/"
                  className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Start reading articles
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentlyViewed.map((item: any) => (
                  <Link 
                    key={item.id} 
                    href={`/articles/${item.articles.slug}`}
                    className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.articles.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Viewed on {new Date(item.viewed_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Recommended For You */}
          <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 relative md:col-span-2 shadow-sm">
            <div className="absolute -top-2 -left-2 h-6 w-6 border-2 border-black dark:border-gray-700 rounded-lg bg-green-500"></div>
            <div className="absolute -bottom-2 -right-2 h-6 w-6 border-2 border-black dark:border-gray-700 rounded-lg bg-orange-500"></div>
            
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <ThumbsUp className="w-5 h-5 text-green-500" />
              Recommended For You
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* This would be populated with actual recommended articles */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm group hover:shadow-md transition-all">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 text-xs font-medium text-white px-2 py-1 bg-blue-500 rounded-full">For You</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Recommended Article {item}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Based on your reading history
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">3 min read</span>
                      <ThumbsUp className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-center">
              <Link
                href="/topics/recommended"
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-gray-700 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <LayoutGrid size={16} />
                View More Recommendations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
} 