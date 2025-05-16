'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Article } from '@/lib/supabase'

export default function FeaturedArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedArticles() {
      setLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('featured', true)
        .eq('hero', false) // Exclude the hero article
        .order('published_at', { ascending: false })
        .limit(3)

      if (data && !error) {
        setArticles(data)
      }
      setLoading(false)
    }

    fetchFeaturedArticles()
  }, [])

  if (loading) {
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Today</h2>
          <div className="h-1 flex-1 bg-black/10 mx-8" />
          <span className="text-gray-500">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-2 border-black bg-white animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 w-full mb-3"></div>
                <div className="h-4 bg-gray-200 w-full mb-2"></div>
                <div className="h-4 bg-gray-200 w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Featured Today</h2>
        <div className="h-1 flex-1 bg-black/10 mx-8" />
        <span className="text-gray-500">{new Date().toLocaleDateString()}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              </div>
              <div className="p-6">
                <span className="text-blue-600 text-sm border-b-2 border-blue-600">
                  {article.category}
                </span>
                <h3 className="text-xl font-bold mt-2 mb-3">{article.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{article.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t-2 border-black">
                  <span>{article.author_id ? `Author #${article.author_id}` : 'Editorial Team'}</span>
                  <span>{new Date(article.published_at).toLocaleDateString()}</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
} 