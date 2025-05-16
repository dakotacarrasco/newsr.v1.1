'use client'

import React from 'react'

interface ForexData {
  pair: string
  value: string
  change: string
}

interface CommodityData {
  name: string
  value: string
  change: string
}

interface FinancialDataGridProps {
  forexData: ForexData[]
  commoditiesData: CommodityData[]
}

export default function FinancialDataGrid({ forexData, commoditiesData }: FinancialDataGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
      {/* Forex Data */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Forex</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Currency Pair</th>
                <th className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                <th className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody>
              {forexData.map((item, index) => (
                <tr 
                  key={index} 
                  className={`${index !== forexData.length - 1 ? 'border-b dark:border-gray-700' : ''}`}
                >
                  <td className="py-4 whitespace-nowrap font-medium">{item.pair}</td>
                  <td className="py-4 whitespace-nowrap text-right">{item.value}</td>
                  <td className={`py-4 whitespace-nowrap text-right ${item.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {item.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commodities Data */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Commodities</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Commodity</th>
                <th className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                <th className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody>
              {commoditiesData.map((item, index) => (
                <tr 
                  key={index} 
                  className={`${index !== commoditiesData.length - 1 ? 'border-b dark:border-gray-700' : ''}`}
                >
                  <td className="py-4 whitespace-nowrap font-medium">{item.name}</td>
                  <td className="py-4 whitespace-nowrap text-right">{item.value}</td>
                  <td className={`py-4 whitespace-nowrap text-right ${item.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {item.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 