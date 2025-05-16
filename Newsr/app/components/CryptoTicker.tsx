'use client'

import { useEffect, useState } from 'react'
import { ArrowUp, ArrowDown, Bitcoin, Coins } from 'lucide-react'
import { fetchMultipleCryptos, getFallbackCryptoData, CryptoData } from '@/app/lib/services/stockServices'

interface CryptoTickerProps {
  className?: string
  refreshInterval?: number
}

export default function CryptoTicker({ 
  className = '',
  refreshInterval = 2 * 60 * 1000 // 2 minutes default
}: CryptoTickerProps) {
  const [cryptos, setCryptos] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const getCryptoData = async () => {
      try {
        setLoading(true)
        const data = await fetchMultipleCryptos()
        
        if (data.length > 0) {
          setCryptos(data)
          setLastUpdated(new Date())
        } else {
          // Use fallback data if the API call fails
          setCryptos(getFallbackCryptoData())
        }
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        setCryptos(getFallbackCryptoData())
      } finally {
        setLoading(false)
      }
    }

    getCryptoData()
    
    // Refresh data more frequently for crypto (prices change rapidly)
    const intervalId = setInterval(getCryptoData, refreshInterval)
    
    return () => clearInterval(intervalId)
  }, [refreshInterval])

  if (loading && cryptos.length === 0) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
        {[1, 2].map(i => (
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
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        {cryptos.map((crypto) => (
          <div 
            key={crypto.symbol} 
            className="bg-white rounded-lg p-4 shadow border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {crypto.symbol === 'BTC' ? (
                  <Bitcoin className="w-8 h-8 text-amber-500 mr-3" />
                ) : (
                  <Coins className="w-8 h-8 text-blue-500 mr-3" />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{crypto.name}</h3>
                  <div className="text-sm text-gray-500">{crypto.symbol}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Market Cap: {crypto.marketCap}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold my-1">{crypto.price}</div>
              <div 
                className={`flex items-center text-sm ${
                  crypto.positive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {crypto.positive ? (
                  <ArrowUp size={16} className="mr-1" />
                ) : (
                  <ArrowDown size={16} className="mr-1" />
                )}
                <span>{crypto.change}</span>
                <span className="ml-1">({crypto.changePercent})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {lastUpdated && (
        <div className="text-xs text-right text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
} 