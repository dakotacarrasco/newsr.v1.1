'use client'

import { useEffect, useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { fetchMarketIndices, getFallbackIndices, StockData } from '@/app/lib/services/stockServices'

interface MarketIndicesProps {
  className?: string
}

export default function MarketIndices({ className = '' }: MarketIndicesProps) {
  const [indices, setIndices] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getIndicesData = async () => {
      try {
        setLoading(true)
        const data = await fetchMarketIndices()
        
        if (data.length > 0) {
          setIndices(data)
        } else {
          // Use fallback data if the API call fails
          setIndices(getFallbackIndices())
        }
      } catch (error) {
        console.error('Error fetching market indices:', error)
        setIndices(getFallbackIndices())
      } finally {
        setLoading(false)
      }
    }

    getIndicesData()
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(getIndicesData, 5 * 60 * 1000)
    
    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return (
      <div className={`grid grid-cols-3 gap-4 ${className}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg p-4 shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {indices.map((index) => (
        <div 
          key={index.name} 
          className="bg-white rounded-lg p-4 shadow"
        >
          <h3 className="text-lg font-semibold">{index.name}</h3>
          <div className="text-2xl font-bold my-1">{index.price}</div>
          <div 
            className={`flex items-center text-sm ${
              index.positive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {index.positive ? (
              <ArrowUp size={16} className="mr-1" />
            ) : (
              <ArrowDown size={16} className="mr-1" />
            )}
            <span>{index.change}</span>
            <span className="ml-1">{index.changePercent}</span>
          </div>
        </div>
      ))}
    </div>
  )
} 