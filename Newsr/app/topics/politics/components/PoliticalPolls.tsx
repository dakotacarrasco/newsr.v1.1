'use client'

import { useState } from 'react'
import Link from 'next/link'

// Simple bar chart component
function PollBar({ percentage, color, label }: { percentage: number, color: string, label: string }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${color}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

export default function PoliticalPolls() {
  const [selectedPoll, setSelectedPoll] = useState(0)
  
  // Mock polls data
  const polls = [
    {
      id: 'poll-1',
      title: 'Presidential Job Approval',
      date: 'August 7, 2023',
      source: 'National Research Inc.',
      sampleSize: 1250,
      margin: 2.8,
      results: [
        { label: 'Approve', percentage: 48, color: 'bg-green-500' },
        { label: 'Disapprove', percentage: 46, color: 'bg-red-500' },
        { label: 'Undecided', percentage: 6, color: 'bg-gray-500' }
      ]
    },
    {
      id: 'poll-2',
      title: 'Congressional Approval Rating',
      date: 'August 5, 2023',
      source: 'Capital Insights',
      sampleSize: 1500,
      margin: 2.6,
      results: [
        { label: 'Approve', percentage: 28, color: 'bg-green-500' },
        { label: 'Disapprove', percentage: 62, color: 'bg-red-500' },
        { label: 'Undecided', percentage: 10, color: 'bg-gray-500' }
      ]
    },
    {
      id: 'poll-3',
      title: 'Direction of the Country',
      date: 'August 3, 2023',
      source: 'Public Opinion Partners',
      sampleSize: 1100,
      margin: 3.0,
      results: [
        { label: 'Right Direction', percentage: 36, color: 'bg-green-500' },
        { label: 'Wrong Track', percentage: 58, color: 'bg-red-500' },
        { label: 'Undecided', percentage: 6, color: 'bg-gray-500' }
      ]
    }
  ]
  
  const activePoll = polls[selectedPoll]

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Political Polling</h2>
        <Link href="/topics/politics/polls" className="text-blue-600 hover:underline">
          View All Polls
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          {polls.map((poll, index) => (
            <button
              key={poll.id}
              className={`flex-1 p-3 text-center transition-colors ${
                selectedPoll === index 
                  ? 'bg-blue-50 text-blue-700 font-medium border-b-2 border-blue-500' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedPoll(index)}
            >
              {poll.title}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-medium">{activePoll.title}</h3>
            <div className="text-xs text-gray-500">
              {activePoll.date} • {activePoll.source}
            </div>
          </div>
          
          <div className="mb-6">
            {activePoll.results.map((result, index) => (
              <PollBar 
                key={index} 
                percentage={result.percentage} 
                color={result.color} 
                label={result.label} 
              />
            ))}
          </div>
          
          <div className="text-xs text-gray-500 italic">
            Sample size: {activePoll.sampleSize} adults • Margin of error: ±{activePoll.margin}%
          </div>
        </div>
      </div>
    </section>
  )
} 