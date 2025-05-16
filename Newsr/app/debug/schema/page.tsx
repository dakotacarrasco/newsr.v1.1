'use client'

import { useState, useEffect } from 'react'

export default function SchemaDebugPage() {
  const [schema, setSchema] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSchema() {
      try {
        const response = await fetch('/api/debug/schema')
        const data = await response.json()
        
        if (data.error) {
          setError(data.error)
        } else {
          setSchema(data)
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSchema()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading schema information...</div>
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
      <h1 className="text-2xl font-bold mb-6">Database Schema Information</h1>
      
      {schema && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Table: {schema.table}</h2>
            <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {schema.count} rows
            </div>
          </div>
          
          <h3 className="font-bold text-lg mb-2">Columns</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Example Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Can be NULL</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schema.columns.map((column: any) => (
                  <tr key={column.name}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{column.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.value === null ? (
                        <span className="italic text-gray-400">null</span>
                      ) : typeof column.value === 'object' ? (
                        <span className="italic">Object</span>
                      ) : (
                        <span className="font-mono">{String(column.value).substring(0, 50)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {column.is_null ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8">
            <h3 className="font-bold text-lg mb-2">Sample Row</h3>
            <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(schema.sample, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
} 