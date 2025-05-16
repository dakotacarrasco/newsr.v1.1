'use client'

import { ArticleDetailTemplate } from '@/app/components/templates/ArticleDetailTemplate'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase/client'
import { incrementArticleViews } from '@/app/lib/services/articleServices'
import { Article } from '@/app/lib/supabase'

interface ArticleDetailPageProps {
  params: {
    slug: string
  }
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    async function fetchArticle() {
      try {
        setIsLoading(true)
        
        // First try to get by ID
        let { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', params.slug)
          .single()
        
        // If not found, try by slug
        if (!data) {
          const result = await supabase
            .from('articles')
            .select('*')
            .eq('slug', params.slug)
            .single()
          
          data = result.data
          error = result.error
        }
        
        if (error) {
          console.error('Error fetching article:', error)
          return
        }
        
        if (!data) {
          router.push('/404')
          return
        }
        
        setArticle(data)
        
        // Increment view count
        if (data.id) {
          incrementArticleViews(data.id)
        }
      } catch (err) {
        console.error('Error fetching article:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchArticle()
  }, [params.slug, router])
  
  return <ArticleDetailTemplate article={article} isLoading={isLoading} />
} 