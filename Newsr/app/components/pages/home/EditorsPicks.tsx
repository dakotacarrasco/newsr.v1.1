'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Award, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Article } from '@/lib/supabase'

export default function EditorsPicks() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    async function fetchEditorsPicks() {
      setLoading(true)
      let debugText = ''
      
      // First try to get articles with section='editors_pick'
      const { data: editorsData, error: editorsError } = await supabase
        .from('articles')
        .select('*')
        .eq('section', 'editors_pick')
        .order('published_at', { ascending: false })
        .limit(4)
      
      if (editorsError) {
        debugText += `Error fetching editors_pick articles: ${editorsError.message}\n`
        console.error('Error fetching editors_pick articles:', editorsError)
      } else if (!editorsData || editorsData.length === 0) {
        debugText += 'No articles with section="editors_pick" found.\n'
        console.log('No articles with section="editors_pick" found')
      } else {
        debugText += `Found ${editorsData.length} editors_pick articles.\n`
        console.log(`Found ${editorsData.length} editors_pick articles:`, editorsData)
        setArticles(editorsData)
        setLoading(false)
        setDebugInfo(debugText)
        return
      }
      
      // Fallback to featured articles
      const { data: featuredData, error: featuredError } = await supabase
        .from('articles')
        .select('*')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(4)
      
      if (featuredError) {
        debugText += `Error fetching featured articles: ${featuredError.message}\n`
        console.error('Error fetching featured articles:', featuredError)
      } else if (!featuredData || featuredData.length === 0) {
        debugText += 'No featured articles found.\n'
        console.log('No featured articles found')
      } else {
        debugText += `Found ${featuredData.length} featured articles.\n`
        console.log(`Found ${featuredData.length} featured articles:`, featuredData)
        setArticles(featuredData)
        setLoading(false)
        setDebugInfo(debugText)
        return
      }
      
      // Final fallback to any recent articles
      const { data: recentData, error: recentError } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(4)
      
      if (recentError) {
        debugText += `Error fetching recent articles: ${recentError.message}\n`
        console.error('Error fetching recent articles:', recentError)
      } else if (!recentData || recentData.length === 0) {
        debugText += 'No recent articles found.\n'
        console.log('No recent articles found')
      } else {
        debugText += `Found ${recentData.length} recent articles.\n`
        console.log(`Found ${recentData.length} recent articles:`, recentData)
        setArticles(recentData)
      }
      
      setLoading(false)
      setDebugInfo(debugText)
    }

    fetchEditorsPicks()
  }, [])

  if (loading) {
    return (
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-8">
          <Award className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold">Editor's Picks</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-2 border-black bg-white animate-pulse h-64"></div>
          ))}
        </div>
      </section>
    )
  }

  if (articles.length === 0) {
    return (
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-8">
          <Award className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold">Editor's Picks</h2>
        </div>
        <div className="border-2 border-black bg-white p-8 text-center">
          <p className="text-gray-600">No editor's picks available at the moment.</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 text-left text-xs text-gray-700 whitespace-pre-wrap">
              <strong>Debug Info:</strong>
              <br />
              {debugInfo}
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold">Editor's Picks</h2>
        </div>
        <Link href="/editors-picks" className="flex items-center text-sm font-medium hover:underline">
          View all picks
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {articles.map((article) => (
          <Link href={`/articles/${article.id}`} key={article.id}>
            <article className="border-2 border-black bg-white hover:bg-gray-50 transition-colors h-full group">
              <div className="relative h-40">
                <Image
                  src={article.image_url || '/placeholder.jpg'}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-0 right-0 bg-white px-2 py-1 text-xs font-bold">
                  {article.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.description}</p>
                <div className="text-xs text-gray-500">
                  {new Date(article.published_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
} 