import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { supabase } from '@/app/lib/supabase/client'

interface SaveArticleButtonProps {
  articleId: string
  className?: string
}

export default function SaveArticleButton({ articleId, className = '' }: SaveArticleButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in and if the article is saved
    const checkSavedStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        
        // Check if this article is already saved for this user
        const { data, error } = await supabase
          .from('saved_articles')
          .select('*')
          .eq('user_id', user.id)
          .eq('article_id', articleId)
          .single()
        
        if (data && !error) {
          setIsSaved(true)
        }
      } else {
        // Handle case for non-logged in users (could use localStorage)
        const saved = localStorage.getItem(`saved_${articleId}`) === 'true'
        setIsSaved(saved)
      }
    }
    
    checkSavedStatus()
  }, [articleId])

  const toggleSave = async () => {
    setIsLoading(true)
    
    try {
      if (userId) {
        // User is logged in, save to database
        if (isSaved) {
          // Remove from saved
          await supabase
            .from('saved_articles')
            .delete()
            .eq('user_id', userId)
            .eq('article_id', articleId)
        } else {
          // Add to saved
          await supabase
            .from('saved_articles')
            .insert([
              { user_id: userId, article_id: articleId }
            ])
        }
      } else {
        // User is not logged in, save to localStorage
        localStorage.setItem(`saved_${articleId}`, (!isSaved).toString())
      }
      
      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Error toggling save status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={toggleSave}
      disabled={isLoading}
      className={`flex items-center gap-1 ${isSaved ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600 transition-colors ${className}`}
    >
      <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
      {isSaved ? 'Saved' : 'Save'}
    </button>
  )
} 