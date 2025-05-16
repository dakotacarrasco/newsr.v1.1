'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Article } from '@/lib/supabase'

export default function LatestNews() {
  const [news, setNews] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLatestNews() {
      setLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(4)

      if (data && !error) {
        setNews(data)
      }
      setLoading(false)
    }

    fetchLatestNews()
  }, [])

  if (loading) {
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Latest News</h2>
          <div className="h-1 flex-1 bg-black/10 mx-8" />
          <Link href="/latest" className="text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-24 h-24 bg-gray-200 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 w-1/4 mb-3"></div>
                <div className="h-6 bg-gray-200 w-full mb-2"></div>
                <div className="h-4 bg-gray-200 w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (news.length === 0) {
    return null
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Latest News</h2>
        <div className="h-1 flex-1 bg-black/10 mx-8" />
        <Link href="/latest" className="text-blue-600 hover:underline">
          View all
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {news.map((article) => (
          <Link href={`/articles/${article.id}`} key={article.id}>
            <article className="flex gap-4 group">
              <div className="w-24 h-24 relative flex-shrink-0 border-2 border-black overflow-hidden">
                <Image
                  src={article.image_url || '/placeholder.jpg'}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1">
                <span className="text-xs text-blue-600 border-b border-blue-600">
                  {article.category}
                </span>
                <h3 className="font-bold mt-1 mb-1 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center text-xs text-gray-500 gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(article.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
} 