'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('/api/debug/articles')
        const data = await response.json()
        
        if (data.error) {
          setError(data.error)
        } else {
          setArticles(data.articles || [])
          setStats({
            count: data.count,
            totalCount: data.totalCount,
            firstId: data.firstId,
            idExamples: data.idExamples
          })
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const generateArticleUrl = (article: any) => {
    if (!article) return '#'
    
    const category = article.category || 'general'
    const slug = article.slug || article.title?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') || 'article'
    
    return `/topics/${category}/article/${article.id}/${slug}`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading articles...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Articles List</h1>
        <div className="flex gap-2">
          <Link href="/debug/article-lookup" className="text-blue-600 hover:underline">
            Article Lookup Tool
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/debug/schema" className="text-blue-600 hover:underline">
            Schema Info
          </Link>
        </div>
      </div>
      
      {stats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-bold text-lg mb-2">Database Stats</h2>
          <p className="mb-1">Total articles: {stats.totalCount}</p>
          <p className="mb-1">Displaying: {stats.count} most recent</p>
          
          {stats.idExamples.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold mb-1">Example IDs:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {stats.idExamples.map((id: string, index: number) => (
                  <li key={index} className="font-mono text-sm overflow-hidden overflow-ellipsis">
                    <Link href={`/debug/article-lookup?id=${id}`} className="text-blue-600 hover:underline">
                      {id}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                Click an ID to look it up with the debug tool
              </p>
            </div>
          )}
        </div>
      )}
      
      {articles.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
          No articles found in the database.
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <div key={article.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between mb-2">
                <h2 className="text-xl font-bold">{article.title}</h2>
                <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {article.category || 'No category'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-bold">ID:</span> <span className="font-mono">{article.id}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-bold">Topic:</span> {article.topic || 'None'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-bold">Category:</span> {article.category || 'None'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-bold">Slug:</span> {article.slug || 'None'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-bold">Publication Date:</span> {new Date(article.publication_date).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-bold">Created At:</span> {new Date(article.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-bold">Updated At:</span> {new Date(article.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-100 flex justify-between">
                <p className="text-sm text-gray-600 line-clamp-1">{article.summary || article.content?.substring(0, 100) + '...' || 'No content'}</p>
                <Link
                  href={generateArticleUrl(article)}
                  className="text-blue-600 hover:underline text-sm"
                  target="_blank"
                >
                  View article →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 