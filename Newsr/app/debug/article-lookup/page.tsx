'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function ArticleLookupPage() {
  const [articleId, setArticleId] = useState('')
  const [articleSlug, setArticleSlug] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('lookup')
  
  const handleLookup = async () => {
    if (!articleId && !articleSlug) return
    
    setLoading(true)
    try {
      let url = `/api/debug/article?`
      if (articleId) url += `id=${encodeURIComponent(articleId)}`
      if (articleSlug) {
        if (articleId) url += '&'
        url += `slug=${encodeURIComponent(articleSlug)}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error looking up article:', error)
      setResults({ error: 'Failed to fetch article data' })
    } finally {
      setLoading(false)
    }
  }

  const handleRepair = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/repair-articles')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error repairing articles:', error)
      setResults({ error: 'Failed to repair articles' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleMigrate = async (execute = false) => {
    setLoading(true)
    try {
      const url = `/api/debug/migrate-articles${execute ? '?execute=true' : ''}`
      const response = await fetch(url)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error migrating articles:', error)
      setResults({ error: 'Failed to migrate articles' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleCheckTables = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/check-tables')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error checking tables:', error)
      setResults({ error: 'Failed to check tables' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:underline">
          <ChevronLeft size={16} className="mr-1" />
          Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Article Debugging Tools</h1>
      
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 ${activeTab === 'lookup' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('lookup')}
          >
            Article Lookup
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'tables' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('tables')}
          >
            Check Tables
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'repair' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('repair')}
          >
            Repair Articles
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'migrate' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('migrate')}
          >
            Migrate Articles
          </button>
        </div>
      </div>
      
      {activeTab === 'lookup' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Article Lookup</h2>
          <p className="text-gray-600 mb-6">Look up an article by ID or slug in both tables</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="article-id" className="block text-sm font-medium text-gray-700 mb-1">
                Article ID
              </label>
              <input
                type="text"
                id="article-id"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. 842936ec-ae53-419b-9b23-9c32f2e0c767"
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="article-slug" className="block text-sm font-medium text-gray-700 mb-1">
                Article Slug (optional)
              </label>
              <input
                type="text"
                id="article-slug"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. breakups-are-big-business"
                value={articleSlug}
                onChange={(e) => setArticleSlug(e.target.value)}
              />
            </div>
          </div>
          
          <button
            onClick={handleLookup}
            disabled={loading || (!articleId && !articleSlug)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Look Up Article'}
          </button>
        </div>
      )}
      
      {activeTab === 'tables' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Check Database Tables</h2>
          <p className="text-gray-600 mb-6">Compare the articles and topic_articles tables</p>
          
          <button
            onClick={handleCheckTables}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Check Tables'}
          </button>
        </div>
      )}
      
      {activeTab === 'repair' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Repair Articles</h2>
          <p className="text-gray-600 mb-6">Fix missing slugs and validate article data</p>
          
          <button
            onClick={handleRepair}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Repair Articles'}
          </button>
        </div>
      )}
      
      {activeTab === 'migrate' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Migrate Articles</h2>
          <p className="text-gray-600 mb-6">Move articles from the legacy table to topic_articles</p>
          
          <div className="flex gap-4">
            <button
              onClick={() => handleMigrate(false)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Preview Migration'}
            </button>
            
            <button
              onClick={() => handleMigrate(true)}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Execute Migration'}
            </button>
          </div>
        </div>
      )}
      
      {results && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Results</h2>
          
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px] text-sm">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 