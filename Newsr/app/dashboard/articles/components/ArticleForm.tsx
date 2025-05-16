'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/app/lib/supabase'
import { supabase } from '@/app/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

interface ArticleFormProps {
  article?: Article
  onSuccess?: () => void
}

export default function ArticleForm({ article, onSuccess }: ArticleFormProps) {
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    content: '',
    description: '',
    category: 'general',
    published_at: new Date().toISOString().split('T')[0],
    keywords: [],
    image_url: '',
  })
  const [keywordsInput, setKeywordsInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (article) {
      setFormData({
        ...article,
        // Format date for input field
        published_at: new Date(article.published_at).toISOString().split('T')[0]
      })
      
      // Join keywords for the input field
      if (article.keywords) {
        setKeywordsInput(article.keywords.join(', '))
      }
    }
  }, [article])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordsInput(e.target.value)
    // Parse keywords from comma-separated list
    const keywords = e.target.value.split(',').map(kw => kw.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, keywords }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      // Create a slug if it doesn't exist
      if (!formData.slug) {
        const slug = formData.title
          ?.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
        
        formData.slug = slug
      }
      
      // Format the data for Supabase
      const articleData = {
        ...formData,
        // Add any missing required fields for a new article
        ...(article ? {} : { id: uuidv4(), views: 0, likes: 0 })
      }
      
      // Insert or update the article
      const { error } = article 
        ? await supabase.from('articles').update(articleData).eq('id', article.id)
        : await supabase.from('articles').insert(articleData)
      
      if (error) throw error
      
      setSuccess(true)
      if (onSuccess) onSuccess()
      
      // Clear form if creating a new article
      if (!article) {
        setFormData({
          title: '',
          content: '',
          description: '',
          category: 'general',
          published_at: new Date().toISOString().split('T')[0],
          keywords: [],
          image_url: '',
        })
        setKeywordsInput('')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save article')
      console.error('Error saving article:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
          Article saved successfully!
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category || 'general'}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="general">General</option>
          <option value="technology">Technology</option>
          <option value="politics">Politics</option>
          <option value="business">Business</option>
          <option value="health">Health</option>
          <option value="science">Science</option>
          <option value="entertainment">Entertainment</option>
          <option value="sports">Sports</option>
          <option value="local">Local</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="image_url" className="block text-sm font-medium mb-1">
          Image URL
        </label>
        <input
          type="url"
          id="image_url"
          name="image_url"
          value={formData.image_url || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium mb-1">
          Keywords (comma-separated)
        </label>
        <input
          type="text"
          id="keywords"
          name="keywords"
          value={keywordsInput}
          onChange={handleKeywordsChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="tech, news, innovation"
        />
      </div>
      
      <div>
        <label htmlFor="published_at" className="block text-sm font-medium mb-1">
          Publication Date
        </label>
        <input
          type="date"
          id="published_at"
          name="published_at"
          value={formData.published_at?.toString().split('T')[0] || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          Content *
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content || ''}
          onChange={handleChange}
          required
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : article ? 'Update Article' : 'Create Article'}
        </button>
      </div>
    </form>
  )
} 