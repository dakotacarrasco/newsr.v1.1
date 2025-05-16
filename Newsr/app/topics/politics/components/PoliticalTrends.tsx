'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

export default function PoliticalTrends() {
  // Mock data for political trends
  const trends = [
    {
      id: 'trend-1',
      title: 'Economic Issues Dominate Voter Concerns',
      change: 12,
      direction: 'up',
      description: 'Economic issues now rank as the top concern for voters, up 12 percentage points from last month.',
      implications: [
        { text: 'Likely to shift campaign messaging', positive: true },
        { text: 'May impact midterm election outcomes', positive: true },
        { text: 'Could delay non-economic legislation', positive: false }
      ]
    },
    {
      id: 'trend-2',
      title: 'Trust in Government Institutions Continues Decline',
      change: 8,
      direction: 'down',
      description: 'Public trust in major government institutions has fallen by 8 percentage points over the past quarter.',
      implications: [
        { text: 'May lead to decreased civic participation', positive: false },
        { text: 'Could increase polarization', positive: false },
        { text: 'Opportunities for reform initiatives', positive: true }
      ]
    },
    {
      id: 'trend-3',
      title: 'Climate Policy Support Growing Among Independents',
      change: 9,
      direction: 'up',
      description: 'Support for climate policy action has increased by 9 percentage points among independent voters.',
      implications: [
        { text: 'Creating new bipartisan opportunities', positive: true },
        { text: 'Could influence swing districts', positive: true },
        { text: 'May face resistance from traditional industries', positive: false }
      ]
    }
  ]

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Political Trends Analysis</h2>
        <Link href="/topics/politics/trends" className="text-blue-600 hover:underline">
          View All Trends
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trends.map((trend) => (
          <div key={trend.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg pr-3">{trend.title}</h3>
                <div className={`flex items-center ${
                  trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {trend.direction === 'up' ? 
                    <TrendingUp size={18} /> : 
                    <TrendingDown size={18} />
                  }
                  <span className="ml-1 font-bold">{trend.change}%</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{trend.description}</p>
              
              <h4 className="font-medium text-sm mb-2 text-gray-700">Key Implications:</h4>
              <ul className="space-y-1 mb-4">
                {trend.implications.map((implication, index) => (
                  <li key={index} className="flex items-start text-sm">
                    {implication.positive ? 
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5" /> : 
                      <XCircle size={16} className="text-red-500 mr-2 mt-0.5" />
                    }
                    <span className="text-gray-700">{implication.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t p-3">
              <Link 
                href={`/topics/politics/trends/${trend.id}`} 
                className="text-blue-600 hover:text-blue-800 flex items-center justify-center text-sm font-medium"
              >
                <span>Read Full Analysis</span>
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
} 