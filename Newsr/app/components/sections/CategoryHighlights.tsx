'use client'

import React from 'react'
import Link from 'next/link'
import { ArticleList } from '@/app/components/ui/ArticleList'
import { useArticles } from '@/lib/hooks/useArticles'

const categories = [
  { name: 'Technology', slug: 'technology', icon: '💻' },
  { name: 'Business', slug: 'business', icon: '📊' },
  { name: 'Science', slug: 'science', icon: '🔬' },
  { name: 'Health', slug: 'health', icon: '🏥' },
]

export default function CategoryHighlights() {
  const { articles: techArticles, loading: techLoading } = useArticles({
    category: 'technology',
    limit: 3
  })
  
  const { articles: businessArticles, loading: businessLoading } = useArticles({
    category: 'business',
    limit: 3
  })
  
  const { articles: scienceArticles, loading: scienceLoading } = useArticles({
    category: 'science',
    limit: 3
  })
  
  const { articles: healthArticles, loading: healthLoading } = useArticles({
    category: 'health',
    limit: 3
  })

  return (
    <section className="mt-12 space-y-8">
      <h2 className="text-3xl font-bold mb-6">Category Highlights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">{categories[0].icon}</span>
            <h3 className="text-xl font-bold">{categories[0].name}</h3>
          </div>
          <ArticleList
            articles={techArticles}
            isLoading={techLoading}
            layout="list"
            variant="compact"
            columns={1}
          />
          <Link 
            href={`/topics/${categories[0].slug}`}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline block text-right"
          >
            View all {categories[0].name} →
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">{categories[1].icon}</span>
            <h3 className="text-xl font-bold">{categories[1].name}</h3>
          </div>
          <ArticleList
            articles={businessArticles}
            isLoading={businessLoading}
            layout="list"
            variant="compact"
            columns={1}
          />
          <Link 
            href={`/topics/${categories[1].slug}`}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline block text-right"
          >
            View all {categories[1].name} →
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">{categories[2].icon}</span>
            <h3 className="text-xl font-bold">{categories[2].name}</h3>
          </div>
          <ArticleList
            articles={scienceArticles}
            isLoading={scienceLoading}
            layout="list"
            variant="compact"
            columns={1}
          />
          <Link 
            href={`/topics/${categories[2].slug}`}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline block text-right"
          >
            View all {categories[2].name} →
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">{categories[3].icon}</span>
            <h3 className="text-xl font-bold">{categories[3].name}</h3>
          </div>
          <ArticleList
            articles={healthArticles}
            isLoading={healthLoading}
            layout="list"
            variant="compact"
            columns={1}
          />
          <Link 
            href={`/topics/${categories[3].slug}`}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline block text-right"
          >
            View all {categories[3].name} →
          </Link>
        </div>
      </div>
    </section>
  )
} 