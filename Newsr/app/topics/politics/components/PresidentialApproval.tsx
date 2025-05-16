'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function PresidentialApproval() {
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m')
  
  // Mock approval rating data
  const approvalData = {
    '1m': {
      dates: ['Jul 8', 'Jul 15', 'Jul 22', 'Jul 29', 'Aug 5'],
      approve: [46, 47, 46, 48, 47],
      disapprove: [49, 48, 49, 47, 48],
      undecided: [5, 5, 5, 5, 5]
    },
    '3m': {
      dates: ['May 5', 'May 19', 'Jun 2', 'Jun 16', 'Jul 1', 'Jul 15', 'Aug 1'],
      approve: [45, 46, 44, 45, 47, 46, 47],
      disapprove: [50, 49, 51, 50, 48, 49, 48],
      undecided: [5, 5, 5, 5, 5, 5, 5]
    },
    '6m': {
      dates: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      approve: [42, 43, 44, 45, 46, 47, 47],
      disapprove: [53, 52, 51, 50, 49, 48, 48],
      undecided: [5, 5, 5, 5, 5, 5, 5]
    },
    '1y': {
      dates: ['Aug 22', 'Oct 22', 'Dec 22', 'Feb 23', 'Apr 23', 'Jun 23', 'Aug 23'],
      approve: [40, 41, 42, 43, 44, 46, 47],
      disapprove: [55, 54, 53, 52, 51, 49, 48],
      undecided: [5, 5, 5, 5, 5, 5, 5]
    }
  }
  
  const currentData = approvalData[timeRange]
  const latestApprove = currentData.approve[currentData.approve.length - 1]
  const latestDisapprove = currentData.disapprove[currentData.disapprove.length - 1]
  const netApproval = latestApprove - latestDisapprove
  const trendDirection = 
    currentData.approve[currentData.approve.length - 1] > 
    currentData.approve[currentData.approve.length - 2] 
      ? 'up' 
      : 'down'
  
  // Chart dimensions
  const chartHeight = 180
  const chartWidth = 100 // percentage
  
  // Function to calculate height percentage for data points
  const getPointHeight = (value: number) => {
    return (value / 100) * chartHeight
  }
  
  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Presidential Approval Rating</h2>
        <Link href="/topics/politics/approval" className="text-blue-600 hover:underline">
          View Historical Data
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{latestApprove}%</span>
              <span className="text-lg text-gray-500">Approve</span>
              <span className={`text-sm font-medium ${trendDirection === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trendDirection === 'up' ? '↑' : '↓'} 
                {Math.abs(currentData.approve[currentData.approve.length - 1] - 
                currentData.approve[currentData.approve.length - 2])}%
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-700">{latestDisapprove}%</span>
              <span className="text-base text-gray-500">Disapprove</span>
            </div>
            <div className="mt-2 text-sm">
              <span className={`font-medium ${netApproval >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netApproval >= 0 ? '+' : ''}{netApproval}% Net Approval
              </span>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-100 rounded-lg p-1 inline-flex text-sm">
              <button 
                className={`px-3 py-1 rounded-md ${timeRange === '1m' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                onClick={() => setTimeRange('1m')}
              >
                1M
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${timeRange === '3m' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                onClick={() => setTimeRange('3m')}
              >
                3M
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${timeRange === '6m' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                onClick={() => setTimeRange('6m')}
              >
                6M
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${timeRange === '1y' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                onClick={() => setTimeRange('1y')}
              >
                1Y
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 relative" style={{ height: `${chartHeight}px` }}>
          {/* Chart visualization */}
          <div className="w-full h-full relative">
            {/* Horizontal grid lines */}
            <div className="absolute w-full border-t border-gray-200" style={{ top: '25%' }}></div>
            <div className="absolute w-full border-t border-gray-200" style={{ top: '50%' }}></div>
            <div className="absolute w-full border-t border-gray-200" style={{ top: '75%' }}></div>
            
            {/* Y-axis labels */}
            <div className="absolute -left-6 text-xs text-gray-500" style={{ top: '0%' }}>100%</div>
            <div className="absolute -left-6 text-xs text-gray-500" style={{ top: '25%' }}>75%</div>
            <div className="absolute -left-6 text-xs text-gray-500" style={{ top: '50%' }}>50%</div>
            <div className="absolute -left-6 text-xs text-gray-500" style={{ top: '75%' }}>25%</div>
            <div className="absolute -left-6 text-xs text-gray-500" style={{ top: '100%', transform: 'translateY(-50%)' }}>0%</div>
            
            {/* Approval line */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
              <polyline
                points={currentData.approve.map((value, index) => 
                  `${(index / (currentData.approve.length - 1)) * chartWidth}, ${chartHeight - getPointHeight(value)}`
                ).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              {/* Dots for approval data points */}
              {currentData.approve.map((value, index) => (
                <circle
                  key={`approve-${index}`}
                  cx={`${(index / (currentData.approve.length - 1)) * chartWidth}`}
                  cy={chartHeight - getPointHeight(value)}
                  r="3"
                  fill="#3b82f6"
                />
              ))}
            </svg>
            
            {/* Disapproval line */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
              <polyline
                points={currentData.disapprove.map((value, index) => 
                  `${(index / (currentData.disapprove.length - 1)) * chartWidth}, ${chartHeight - getPointHeight(value)}`
                ).join(' ')}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
              />
              {/* Dots for disapproval data points */}
              {currentData.disapprove.map((value, index) => (
                <circle
                  key={`disapprove-${index}`}
                  cx={`${(index / (currentData.disapprove.length - 1)) * chartWidth}`}
                  cy={chartHeight - getPointHeight(value)}
                  r="3"
                  fill="#ef4444"
                />
              ))}
            </svg>
          </div>
          
          {/* X-axis dates */}
          <div className="flex justify-between text-xs text-gray-500 mt-4">
            {currentData.dates.map((date, index) => (
              <div key={index}>{date}</div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-center gap-8">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">Approve</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm">Disapprove</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            <span className="text-sm">Undecided ({currentData.undecided[currentData.undecided.length - 1]}%)</span>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 text-xs text-center text-gray-500">
          Data source: National Polling Average • Last updated: August 8, 2023
        </div>
      </div>
    </section>
  )
} 