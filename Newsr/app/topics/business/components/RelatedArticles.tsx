'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function RelatedArticles() {
  const articles = [
    {
      id: 'economic-forecast-2023',
      title: 'Economic Forecast for 2023: What Experts Predict',
      image: '/placeholder.jpg',
      category: 'Economy',
      date: '2023-11-20',
    },
    {
      id: 'supply-chain-innovations',
      title: 'Supply Chain Innovations Reshaping Global Commerce',
      image: '/placeholder.jpg',
      category: 'Global Trade',
      date: '2023-11-19',
    },
    {
      id: 'startup-funding-trends',
      title: 'Startup Funding Trends: Where Venture Capital is Flowing',
      image: '/placeholder.jpg',
      category: 'Venture Capital',
      date: '2023-11-18',
    },
    {
      id: 'sustainability-business',
      title: 'The Business Case for Sustainability: Profits and Purpose',
      image: '/placeholder.jpg',
      category: 'Sustainability',
      date: '2023-11-17',
    }
  ]
  
  return (
    <section className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">You May Also Like</h2>
        <Link 
          href="/topics/business"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          More Business News
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.map(article => (
          <Link 
            key={article.id}
            href={`/articles/${article.id}`}
            className="group"
          >
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-40">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {article.category}
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h3>
                <time className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(article.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
} 