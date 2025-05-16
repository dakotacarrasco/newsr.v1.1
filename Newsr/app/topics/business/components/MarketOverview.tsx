'use client'

import React from 'react'
import { useTheme } from '@/app/components/ThemeProvider'
import { cn } from '@/app/lib/utils'
import { TopicCard } from '@/app/components/ui/TopicCard'
import { BarChart3 } from 'lucide-react'

interface MarketIndexData {
  name: string
  value: number
  change: number
  changePercent: number
}

export default function MarketOverview() {
  const { theme } = useTheme()
  
  const marketIndices: MarketIndexData[] = [
    { name: 'Dow Jones', value: 34721.91, change: 307.64, changePercent: 0.89 },
    { name: 'S&P 500', value: 4547.17, change: 41.35, changePercent: 0.92 },
    { name: 'NASDAQ', value: 14262.48, change: 199.44, changePercent: 1.42 },
    { name: 'Russell 2000', value: 1895.33, change: 18.09, changePercent: 0.96 },
  ]

  return (
    <TopicCard title="Market Overview" icon={<BarChart3 className="w-5 h-5 text-blue-500" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {marketIndices.map(index => (
          <div 
            key={index.name}
            className={cn(
              "border rounded-lg p-4 transition-colors",
              theme === 'dark' ? "border-gray-700" : "border-gray-200"
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">{index.name}</h3>
              <span className={cn(
                "text-sm font-medium",
                index.change >= 0 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              )}>
                {index.change >= 0 ? '▲' : '▼'}
              </span>
            </div>
            
            <div className="text-2xl font-bold mb-1">
              {index.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            <div className={cn(
              "flex items-center",
              index.change >= 0 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            )}>
              <span className="font-medium">
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
              </span>
              <span className="mx-1">|</span>
              <span>
                {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h3 className="font-bold mb-3">Recent Market News</h3>
        <ul className="space-y-3">
          <li className={cn(
            "border-b pb-3 transition-colors",
            theme === 'dark' ? "border-gray-700" : "border-gray-200"
          )}>
            <a href="#" className={cn(
              "block transition-colors",
              theme === 'dark' 
                ? "hover:text-blue-400" 
                : "hover:text-blue-600"
            )}>
              <span className={cn(
                "text-xs block mb-1 transition-colors",
                theme === 'dark' ? "text-gray-400" : "text-gray-500"
              )}>
                2 hours ago
              </span>
              <span className="font-medium">Federal Reserve Signals Potential Rate Cut in Coming Months</span>
            </a>
          </li>
          <li className={cn(
            "border-b pb-3 transition-colors",
            theme === 'dark' ? "border-gray-700" : "border-gray-200"
          )}>
            <a href="#" className={cn(
              "block transition-colors",
              theme === 'dark' 
                ? "hover:text-blue-400" 
                : "hover:text-blue-600"
            )}>
              <span className={cn(
                "text-xs block mb-1 transition-colors",
                theme === 'dark' ? "text-gray-400" : "text-gray-500"
              )}>
                4 hours ago
              </span>
              <span className="font-medium">Tech Stocks Rally on Strong Earnings Reports</span>
            </a>
          </li>
          <li>
            <a href="#" className={cn(
              "block transition-colors",
              theme === 'dark' 
                ? "hover:text-blue-400" 
                : "hover:text-blue-600"
            )}>
              <span className={cn(
                "text-xs block mb-1 transition-colors",
                theme === 'dark' ? "text-gray-400" : "text-gray-500"
              )}>
                5 hours ago
              </span>
              <span className="font-medium">Oil Prices Stabilize After Recent Volatility</span>
            </a>
          </li>
        </ul>
      </div>
    </TopicCard>
  )
} 