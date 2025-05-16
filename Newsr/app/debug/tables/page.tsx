'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TablesComparisonPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchId, setSearchId] = useState('')
  const [searchResults, setSearchResults] = useState<any>(null)

  useEffect(() => {
    async function fetchTableInfo() {
      try {
        const response = await fetch('/api/debug/check-tables')
        const result = await response.json()
        
        if (result.error) {
          setError(result.error)
        } else {
          setData(result)
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTableInfo()
  }, [])

  const handleSearch = async () => {
    if (!searchId.trim()) return
    
    try {
      const response = await fetch(`/api/debug/check-tables?id=${searchId}`)
      const result = await response.json()
      
      if (result.error) {
        setError(result.error)
      } else {
        setSearchResults(result.search)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during search')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading table information...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          Error: {error}
        </div>
        <Link href="/debug/articles" className="text-blue-600 hover:underline">
          &larr; Back to Articles List
        </Link>
      </div>
    )
  }

  const formatJson = (obj: any): string => {
    return JSON.stringify(obj, null, 2)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Database Tables Comparison</h1>
        <div className="flex gap-2">
          <Link href="/debug/articles" className="text-blue-600 hover:underline">
            Articles List
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/debug/article-lookup" className="text-blue-600 hover:underline">
            Article Lookup
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/debug/schema" className="text-blue-600 hover:underline">
            Schema Info
          </Link>
        </div>
      </div>

      {/* Article ID Search Tool */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Search for Article in Both Tables</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter article ID..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>
        
        {searchResults && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Search Results for ID: {searchResults.id}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <h4 className="font-bold text-lg mb-2">articles table</h4>
                {searchResults.results.articles.found ? (
                  <div className="text-green-600 font-medium">
                    Found {searchResults.results.articles.count} result(s)!
                    <pre className="mt-4 bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60 text-gray-800">
                      {formatJson(searchResults.results.articles.data)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-red-600">
                    Not found in articles table.
                    {searchResults.results.articles.error && (
                      <p className="text-xs mt-2">{searchResults.results.articles.error}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="border rounded p-4">
                <h4 className="font-bold text-lg mb-2">topic_articles table</h4>
                {searchResults.results.topic_articles.found ? (
                  <div className="text-green-600 font-medium">
                    Found {searchResults.results.topic_articles.count} result(s)!
                    <pre className="mt-4 bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60 text-gray-800">
                      {formatJson(searchResults.results.topic_articles.data)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-red-600">
                    Not found in topic_articles table.
                    {searchResults.results.topic_articles.error && (
                      <p className="text-xs mt-2">{searchResults.results.topic_articles.error}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tables Info */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* articles table */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">articles table</h2>
            
            {data.tables.articles.exists ? (
              <>
                <div className="mb-4">
                  <p className="mb-1">
                    <span className="font-medium">Records:</span> {data.tables.articles.count}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Status:</span> <span className="text-green-600">Available</span>
                  </p>
                </div>
                
                {data.tables.articles.fields && data.tables.articles.fields.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-2">Table Fields:</h3>
                    <ul className="list-disc pl-5">
                      {data.tables.articles.fields.map((field: string) => (
                        <li key={field} className="mb-1">
                          <code className="bg-gray-100 px-1 py-0.5 rounded">{field}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {data.tables.articles.sample && (
                  <div>
                    <h3 className="font-bold mb-2">Sample Record:</h3>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60">
                      {formatJson(data.tables.articles.sample)}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
                Table does not exist or cannot be accessed.
                {data.tables.articles.error && (
                  <p className="text-xs mt-2">{data.tables.articles.error}</p>
                )}
              </div>
            )}
          </div>
          
          {/* topic_articles table */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">topic_articles table</h2>
            
            {data.tables.topic_articles.exists ? (
              <>
                <div className="mb-4">
                  <p className="mb-1">
                    <span className="font-medium">Records:</span> {data.tables.topic_articles.count}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Status:</span> <span className="text-green-600">Available</span>
                  </p>
                </div>
                
                {data.tables.topic_articles.fields && data.tables.topic_articles.fields.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-2">Table Fields:</h3>
                    <ul className="list-disc pl-5">
                      {data.tables.topic_articles.fields.map((field: string) => (
                        <li key={field} className="mb-1">
                          <code className="bg-gray-100 px-1 py-0.5 rounded">{field}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {data.tables.topic_articles.sample && (
                  <div>
                    <h3 className="font-bold mb-2">Sample Record:</h3>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60">
                      {formatJson(data.tables.topic_articles.sample)}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
                Table does not exist or cannot be accessed.
                {data.tables.topic_articles.error && (
                  <p className="text-xs mt-2">{data.tables.topic_articles.error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 