'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Article } from '@/lib/supabase'
import { useTheme } from '@/app/components/ThemeProvider'
import { cn } from '@/app/lib/utils'

export default function HeroSection() {
  const [heroArticle, setHeroArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const { theme } = useTheme()

  useEffect(() => {
    async function fetchHeroArticle() {
      setLoading(true)
      let debugText = ''
      
      // Try to get any article
      const { data: allArticles, error: allError } = await supabase
        .from('articles')
        .select('*')
        .limit(1)
      
      if (allError) {
        debugText += `Error fetching any articles: ${allError.message}\n`
        console.error('Error fetching any articles:', allError)
      } else if (!allArticles || allArticles.length === 0) {
        debugText += 'No articles found in the database.\n'
        console.log('No articles found in the database')
      } else {
        debugText += `Found ${allArticles.length} articles in database.\n`
        console.log(`Found ${allArticles.length} articles in database.`)
      }
      
      // First try to get an article with section='hero'
      const { data: heroData, error: heroError } = await supabase
        .from('articles')
        .select('*')
        .eq('section', 'hero')
        .order('published_at', { ascending: false })
        .limit(1)
      
      if (heroError) {
        debugText += `Error fetching hero articles: ${heroError.message}\n`
        console.error('Error fetching hero articles:', heroError)
      } else if (!heroData || heroData.length === 0) {
        debugText += 'No articles with section="hero" found.\n'
        console.log('No articles with section="hero" found')
      } else {
        debugText += `Found ${heroData.length} hero articles.\n`
        console.log(`Found ${heroData.length} hero articles:`, heroData)
        setHeroArticle(heroData[0])
        setLoading(false)
        setDebugInfo(debugText)
        return
      }
      
      // Try to get any featured article
      const { data: featuredData, error: featuredError } = await supabase
        .from('articles')
        .select('*')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
      
      if (featuredError) {
        debugText += `Error fetching featured articles: ${featuredError.message}\n`
        console.error('Error fetching featured articles:', featuredError)
      } else if (!featuredData || featuredData.length === 0) {
        debugText += 'No featured articles found.\n'
        console.log('No featured articles found')
      } else {
        debugText += `Found ${featuredData.length} featured articles.\n`
        console.log(`Found ${featuredData.length} featured articles:`, featuredData)
        setHeroArticle(featuredData[0])
        setLoading(false)
        setDebugInfo(debugText)
        return
      }
      
      // If still no article is found, get the most recent article
      const { data: recentData, error: recentError } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(1)
      
      if (recentError) {
        debugText += `Error fetching recent articles: ${recentError.message}\n`
        console.error('Error fetching recent articles:', recentError)
      } else if (!recentData || recentData.length === 0) {
        debugText += 'No recent articles found.\n'
        console.log('No recent articles found')
      } else {
        debugText += `Found ${recentData.length} recent articles.\n`
        console.log(`Found ${recentData.length} recent articles:`, recentData)
        setHeroArticle(recentData[0])
      }
      
      setLoading(false)
      setDebugInfo(debugText)
    }

    fetchHeroArticle()
  }, [])

  if (loading) {
    return (
      <div className={cn(
        "relative h-[600px] border-2 mb-12 animate-pulse transition-colors",
        theme === 'dark' 
          ? "border-gray-700 bg-gray-800" 
          : "border-gray-200 bg-gray-100"
      )}>
        <div className={cn(
          "h-full transition-colors",
          theme === 'dark' ? "bg-gray-700" : "bg-gray-200"
        )}></div>
      </div>
    )
  }

  if (!heroArticle) {
    return (
      <div className={cn(
        "relative h-[600px] border-2 mb-12 flex items-center justify-center transition-colors",
        theme === 'dark' 
          ? "border-gray-700 bg-gray-800" 
          : "border-black bg-white"
      )}>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Welcome to Newsr</h2>
          <p className={cn(
            "transition-colors",
            theme === 'dark' ? "text-gray-300" : "text-gray-600"
          )}>
            No featured articles available at the moment. Check back soon for the latest news and updates.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className={cn(
              "mt-4 p-4 text-left text-xs whitespace-pre-wrap transition-colors",
              theme === 'dark' 
                ? "bg-gray-700 text-gray-300" 
                : "bg-gray-100 text-gray-700"
            )}>
              <strong>Debug Info:</strong>
              <br />
              {debugInfo}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Link href={`/articles/${heroArticle.id}`}>
      <article className={cn(
        "relative h-[600px] group overflow-hidden mb-12 hover:shadow-xl transition-all duration-300",
        theme === 'dark' 
          ? "border-2 border-gray-700 bg-gray-800" 
          : "border-2 border-black bg-white"
      )}>
        <div className="absolute inset-0">
          <Image
            src={heroArticle.image_url || '/placeholder.jpg'}
            alt={heroArticle.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
          <div className="mb-3">
            <span className={cn(
              "inline-block px-3 py-1.5 text-sm font-bold uppercase tracking-wider shadow-md transition-colors",
              theme === 'dark' 
                ? "bg-gray-800 text-white" 
                : "bg-white text-black"
            )}>
              {heroArticle.category}
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">{heroArticle.title}</h1>
          <p className="text-xl mb-6 text-white/90 max-w-3xl">{heroArticle.description}</p>
          
          <div className="flex items-center text-white/80 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <span>{new Date(heroArticle.published_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </div>
      </article>
    </Link>
  )
} 