'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Eye, ChevronRight, Bookmark } from 'lucide-react'
import { useArticles } from '@/lib/hooks/useArticles'

export default function HeroSection() {
  const { articles, loading } = useArticles({ 
    featured: true, 
    limit: 3 
  })

  // Get the main featured article and secondary articles
  const mainArticle = articles?.[0]
  const secondaryArticles = articles?.slice(1, 3)

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Loading skeleton for the main article
  if (loading || !mainArticle) {
    return (
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main article skeleton */}
          <div className="lg:col-span-2 h-[540px] bg-gray-200 animate-pulse rounded-lg"></div>
          
          {/* Secondary articles skeleton */}
          <div className="space-y-6">
            <div className="h-[260px] bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-[260px] bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Featured Article */}
        <div className="lg:col-span-2 relative group overflow-hidden border-2 border-black">
          <Link href={`/articles/${mainArticle.id}`}>
            <div className="relative h-[540px] overflow-hidden">
              <Image
                src={mainArticle.image_url || '/placeholder-hero.jpg'}
                alt={mainArticle.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="inline-block bg-blue-600 text-white px-3 py-1 text-sm font-medium mb-4">
                  {mainArticle.category?.toUpperCase()}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {mainArticle.title}
                </h2>
                <p className="text-white/90 mb-4 line-clamp-2">
                  {mainArticle.description}
                </p>
                <div className="flex flex-wrap items-center text-white/80 space-x-4">
                  <span className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {formatDate(mainArticle.published_at)}
                  </span>
                  {mainArticle.views && (
                    <span className="flex items-center">
                      <Eye size={16} className="mr-1" />
                      {mainArticle.views.toLocaleString()} views
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Secondary Featured Articles */}
        <div className="space-y-6">
          {secondaryArticles?.map((article) => (
            <Link href={`/articles/${article.id}`} key={article.id}>
              <div className="relative h-[260px] overflow-hidden group border-2 border-black">
                <Image
                  src={article.image_url || '/placeholder.jpg'}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className="inline-block bg-blue-600 text-white px-2 py-1 text-xs font-medium mb-2">
                    {article.category?.toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {article.title}
                  </h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <Clock size={14} className="mr-1" />
                    {formatDate(article.published_at)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {/* View All Articles Link */}
          <Link 
            href="/articles" 
            className="flex items-center justify-center py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium border-2 border-black"
          >
            View All Articles
            <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
