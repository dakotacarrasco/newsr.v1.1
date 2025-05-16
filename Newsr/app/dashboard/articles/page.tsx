'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/app/lib/supabase'
import { supabase } from '@/app/lib/supabase/client'
import ArticleForm from './components/ArticleForm'
import { format } from 'date-fns'
import { Pencil, Trash2, Plus, RefreshCw } from 'lucide-react'

export default function ArticlesManagement() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [actionType, setActionType] = useState<'create' | 'edit'>('create')

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
      
      if (error) throw error
      setArticles(data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const handleEdit = (article: Article) => {
    setSelectedArticle(article)
    setActionType('edit')
    setShowForm(true)
  }

  const handleCreate = () => {
    setSelectedArticle(null)
    setActionType('create')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return
    
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Update the local state
      setArticles(articles.filter(article => article.id !== id))
    } catch (error) {
      console.error('Error deleting article:', error)
    }
  }

  const handleFormSuccess = () => {
    fetchArticles()
    setShowForm(false)
  }

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Article Management</h1>
        <p className="text-gray-600 mt-2">Create, edit, and manage your articles</p>
      </header>
      
      {showForm ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {actionType === 'create' ? 'Create New Article' : 'Edit Article'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
          <ArticleForm 
            article={actionType === 'edit' ? selectedArticle || undefined : undefined}
            onSuccess={handleFormSuccess}
          />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Plus size={16} />
              Create New Article
            </button>
            <button
              onClick={fetchArticles}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No articles found. Create your first article to get started.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(article.published_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(article)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 