'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Landmark, Briefcase, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Article } from '@/lib/supabase'

interface CategoryArticles {
  politics: Article[]
  business: Article[]
  sports: Article[]
}

export default function CategoryHighlights() {
  const [categoryArticles, setCategoryArticles] = useState<CategoryArticles>({
    politics: [],
    business: [],
    sports: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategoryArticles() {
      setLoading(true)
      
      // Fetch articles for each category
      const categories = ['politics', 'business', 'sports']
      const results: CategoryArticles = {
        politics: [],
        business: [],
        sports: []
      }
      
      for (const category of categories) {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('category', category)
          .order('published_at', { ascending: false })
          .limit(3)
        
        if (data && !error) {
          results[category as keyof CategoryArticles] = data
        }
      }
      
      setCategoryArticles(results)
      setLoading(false)
    }

    fetchCategoryArticles()
  }, [])

  const categories = [
    { 
      key: 'politics', 
      name: 'Politics', 
      icon: Landmark, 
      color: 'text-red-500',
      borderColor: 'border-red-500'
    },
    { 
      key: 'business', 
      name: 'Business', 
      icon: Briefcase, 
      color: 'text-blue-500',
      borderColor: 'border-blue-500'
    },
    { 
      key: 'sports', 
      name: 'Sports', 
      icon: Trophy, 
      color: 'text-green-500',
      borderColor: 'border-green-500'
    }
  ]

  if (loading) {
    return (
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Category Highlights</h2>
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.key} className="animate-pulse">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="h-6 bg-gray-200 w-32"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-2 border-black bg-white">
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
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-8">Category Highlights</h2>
      
      <div className="space-y-12">
        {categories.map((category) => {
          const articles = categoryArticles[category.key as keyof CategoryArticles]
          if (!articles || articles.length === 0) return null
          
          const Icon = category.icon
          
          return (
            <div key={category.key}>
              <div className="flex items-center gap-2 mb-6">
                <Icon className={`w-6 h-6 ${category.color}`} />
                <h3 className="text-xl font-bold">{category.name}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map(article => (
                  <Link href={`/articles/${article.id}`} key={article.id}>
                    <article className="border-2 border-black bg-white hover:bg-gray-50 transition-colors">
                      <div className="relative h-48">
                        <Image
                          src={article.image_url || '/placeholder.jpg'}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <span className={`text-sm ${category.color} border-b-2 ${category.borderColor}`}>
                          {category.name}
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
            </div>
          )
        })}
      </div>
    </section>
  )
} 