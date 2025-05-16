'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { TrendingUp, ArrowUpRight, Zap, ChevronRight } from 'lucide-react'
import { useTheme } from '@/app/components/ThemeProvider'
import { TopicCard, TopicSection } from '@/app/components/ui/TopicCard'
import { cn } from '@/app/lib/utils'

// Simplified fallback chart when recharts isn't available
const SimplePieChart = ({ data }: { data: any[] }) => {
  return (
    <div className="flex items-center justify-center h-[200px]">
      <div className="relative w-[200px] h-[200px]">
        {data.map((entry, index) => {
          const rotation = index * (360 / data.length)
          return (
            <div 
              key={index}
              className="absolute top-0 left-0 w-full h-full"
              style={{ 
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((rotation + 360 / data.length) * Math.PI / 180)}% ${50 - 50 * Math.sin((rotation + 360 / data.length) * Math.PI / 180)}%, 50% 50%)`,
                transform: `rotate(${rotation}deg)`,
                backgroundColor: entry.color
              }}
            />
          )
        })}
        <div className="absolute inset-[25%] bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
          <span className="font-bold text-lg">{data.length} Topics</span>
        </div>
      </div>
    </div>
  )
}

export default function TechTrends() {
  const [activeTab, setActiveTab] = useState<'market' | 'growth'>('market')
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = useTheme()
  
  // Set isMounted to true when component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Mock data for technology trends
  const trendData = {
    market: [
      { name: 'AI & Machine Learning', value: 42, color: '#3b82f6' },
      { name: 'Cloud Computing', value: 28, color: '#10b981' },
      { name: 'Cybersecurity', value: 15, color: '#f59e0b' },
      { name: 'IoT', value: 8, color: '#8b5cf6' },
      { name: 'Blockchain', value: 7, color: '#ec4899' }
    ],
    growth: [
      { name: 'AI & Machine Learning', growth: 156, color: '#3b82f6' },
      { name: 'Quantum Computing', growth: 132, color: '#10b981' },
      { name: 'Web3', growth: 89, color: '#f59e0b' },
      { name: 'Cybersecurity', growth: 67, color: '#8b5cf6' },
      { name: 'Green Tech', growth: 54, color: '#ec4899' }
    ]
  }
  
  // Hottest emerging trends in technology
  const emergingTrends = [
    {
      name: 'Edge AI',
      description: 'AI processing at the edge, reducing latency and increasing privacy',
      growth: '+187%',
      category: 'AI'
    },
    {
      name: 'Digital Twins',
      description: 'Virtual replicas of physical devices for real-time simulation',
      growth: '+142%',
      category: 'IoT'
    },
    {
      name: 'Low-Code Platforms',
      description: 'Development tools with minimal manual coding requirements',
      growth: '+118%',
      category: 'Software'
    }
  ]

  return (
    <TopicSection
      title="Technology Trends"
      icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
      action={
        <Link href="/topics/technology/trends" className="text-blue-600 hover:underline flex items-center">
          View All Trends
          <ChevronRight size={16} className="ml-1" />
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Chart */}
        <div className="lg:col-span-2">
          <TopicCard noPadding>
            <div className="flex border-b mb-4">
              <button 
                className={cn(
                  "pb-2 px-4 font-medium",
                  activeTab === 'market' 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : theme === 'dark' ? "text-gray-400" : "text-gray-500"
                )}
                onClick={() => setActiveTab('market')}
              >
                Market Share
              </button>
              <button 
                className={cn(
                  "pb-2 px-4 font-medium",
                  activeTab === 'growth' 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : theme === 'dark' ? "text-gray-400" : "text-gray-500"
                )}
                onClick={() => setActiveTab('growth')}
              >
                Growth Rate
              </button>
            </div>
            
            {/* Chart area */}
            <div className="h-[300px] px-6">
              {activeTab === 'market' ? (
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2">
                    {isMounted ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={trendData.market}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {trendData.market.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                            borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                            color: theme === 'dark' ? '#F9FAFB' : '#111827'
                          }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <SimplePieChart data={trendData.market} />
                    )}
                  </div>
                  <div className="md:w-1/2">
                    <h3 className="font-medium mb-4 text-center md:text-left">Technology Market Share</h3>
                    <div className="space-y-3">
                      {trendData.market.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                          <div className="flex justify-between items-center w-full">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 h-[300px]">
                    {isMounted ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={trendData.growth}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                          <XAxis 
                            type="number" 
                            tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#4B5563' }}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#4B5563' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                              borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                              color: theme === 'dark' ? '#F9FAFB' : '#111827'
                            }} 
                          />
                          <Bar dataKey="growth" radius={[0, 10, 10, 0]}>
                            {trendData.growth.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="space-y-4 w-full">
                          {trendData.growth.map((item, index) => (
                            <div key={index} className="relative h-8">
                              <div className={cn(
                                "absolute inset-y-0 left-0 w-full rounded-r-full", 
                                theme === 'dark' ? "bg-gray-700" : "bg-gray-200"
                              )}></div>
                              <div 
                                className="absolute inset-y-0 left-0 rounded-r-full" 
                                style={{ 
                                  width: `${(item.growth / 160) * 100}%`,
                                  backgroundColor: item.color
                                }}
                              ></div>
                              <div className="absolute inset-y-0 left-2 flex items-center">
                                <span className="text-xs font-medium text-white">{item.name}</span>
                              </div>
                              <div className="absolute inset-y-0 right-2 flex items-center">
                                <span className="text-xs font-medium">{item.growth}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="md:w-1/2">
                    <h3 className="font-medium mb-4 text-center md:text-left">Annual Growth Rate</h3>
                    <div className="space-y-3">
                      {trendData.growth.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                          <div className="flex justify-between items-center w-full">
                            <span>{item.name}</span>
                            <span className="font-medium text-green-600 dark:text-green-400">+{item.growth}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TopicCard>
        </div>
        
        {/* Right column: Emerging trends */}
        <TopicCard title="Emerging Tech Trends" icon={<Zap className="w-5 h-5 text-yellow-500" />}>
          <div className="space-y-4">
            {emergingTrends.map((trend, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  theme === 'dark' 
                    ? "border-gray-700 hover:border-blue-700 hover:bg-blue-900/30" 
                    : "border-gray-100 hover:border-blue-100 hover:bg-blue-50"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{trend.name}</h4>
                  <span className={cn(
                    "text-sm font-medium flex items-center",
                    theme === 'dark' ? "text-green-400" : "text-green-600"
                  )}>
                    {trend.growth}
                    <ArrowUpRight size={14} className="ml-1" />
                  </span>
                </div>
                <p className={cn(
                  "text-sm mb-2",
                  theme === 'dark' ? "text-gray-300" : "text-gray-600"
                )}>{trend.description}</p>
                <div className={cn(
                  "text-xs font-medium px-2 py-1 rounded inline-block",
                  theme === 'dark' ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                )}>
                  {trend.category}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Link 
              href="/topics/technology/emerging-trends" 
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline flex items-center justify-center"
            >
              Discover More Emerging Trends
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </TopicCard>
      </div>
    </TopicSection>
  )
} 