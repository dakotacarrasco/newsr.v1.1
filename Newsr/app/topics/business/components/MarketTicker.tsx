'use client'

import React, { useEffect, useState } from 'react'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function MarketTicker() {
  const [stocks, setStocks] = useState<StockData[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 174.26, change: 2.45, changePercent: 1.43 },
    { symbol: 'MSFT', name: 'Microsoft', price: 329.37, change: 4.25, changePercent: 1.31 },
    { symbol: 'AMZN', name: 'Amazon', price: 132.17, change: -0.89, changePercent: -0.67 },
    { symbol: 'GOOGL', name: 'Alphabet', price: 124.78, change: 1.56, changePercent: 1.27 },
    { symbol: 'META', name: 'Meta Platforms', price: 287.92, change: 3.78, changePercent: 1.33 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 244.14, change: -5.24, changePercent: -2.10 },
  ])

  // Simulating price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => {
          const changeAmount = (Math.random() * 2 - 1) * (stock.price * 0.002)
          const newPrice = Number((stock.price + changeAmount).toFixed(2))
          const newChange = Number((newPrice - stock.price + stock.change).toFixed(2))
          const newChangePercent = Number(((newChange / stock.price) * 100).toFixed(2))
          
          return {
            ...stock,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent
          }
        })
      )
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md p-4 rounded-lg overflow-hidden">
      <h3 className="text-lg font-bold mb-3">Market Ticker</h3>
      
      <div className="flex overflow-x-auto pb-2 space-x-4">
        {stocks.map(stock => (
          <div 
            key={stock.symbol}
            className="flex-shrink-0 min-w-[160px] border border-gray-200 dark:border-gray-700 rounded p-3"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">{stock.symbol}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{stock.name}</span>
            </div>
            <div className="mt-2">
              <div className="font-medium">${stock.price.toFixed(2)}</div>
              <div className={`text-xs ${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 