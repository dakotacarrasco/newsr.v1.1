'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const polls = [
  {
    id: 1,
    question: 'What sector do you think will outperform the market in the next quarter?',
    options: [
      { id: 1, text: 'Technology', votes: 42 },
      { id: 2, text: 'Healthcare', votes: 28 },
      { id: 3, text: 'Energy', votes: 15 },
      { id: 4, text: 'Financials', votes: 22 },
      { id: 5, text: 'Consumer Staples', votes: 9 }
    ],
    totalVotes: 116
  },
  {
    id: 2,
    question: 'How has inflation affected your spending habits?',
    options: [
      { id: 1, text: 'Significantly reduced spending', votes: 37 },
      { id: 2, text: 'Somewhat reduced spending', votes: 54 },
      { id: 3, text: 'No change', votes: 21 },
      { id: 4, text: 'Increased spending in certain areas', votes: 8 }
    ],
    totalVotes: 120
  },
  {
    id: 3,
    question: 'What economic indicator do you pay most attention to?',
    options: [
      { id: 1, text: 'Unemployment rate', votes: 32 },
      { id: 2, text: 'Inflation', votes: 48 },
      { id: 3, text: 'GDP growth', votes: 30 },
      { id: 4, text: 'Stock market performance', votes: 25 },
      { id: 5, text: 'Housing market', votes: 17 }
    ],
    totalVotes: 152
  }
]

export default function BusinessPolls() {
  const [userVotes, setUserVotes] = useState<Record<number, number>>({})
  
  const handleVote = (pollId: number, optionId: number) => {
    setUserVotes(prev => ({
      ...prev,
      [pollId]: optionId
    }))
    // In a real app, you would send this to your API
  }
  
  return (
    <section className="my-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Business Community Polls</h2>
        <Link 
          href="/topics/business/polls"
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          View All Polls
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {polls.map(poll => (
          <div 
            key={poll.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5"
          >
            <h3 className="font-bold text-lg mb-4">{poll.question}</h3>
            
            <div className="space-y-3">
              {poll.options.map(option => {
                const hasVoted = userVotes[poll.id] !== undefined
                const isSelected = userVotes[poll.id] === option.id
                const percentage = Math.round((option.votes / poll.totalVotes) * 100)
                
                return (
                  <div key={option.id} className="relative">
                    <button
                      className={`w-full text-left p-3 border rounded-md relative z-10 transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
                      onClick={() => !hasVoted && handleVote(poll.id, option.id)}
                      disabled={hasVoted && !isSelected}
                    >
                      <div className="flex justify-between items-center">
                        <span className={isSelected ? 'font-medium' : ''}>{option.text}</span>
                        {hasVoted && <span className="text-sm">{percentage}%</span>}
                      </div>
                      
                      {/* Progress bar (only shown after voting) */}
                      {hasVoted && (
                        <div className="absolute left-0 top-0 bottom-0 bg-blue-100 dark:bg-blue-900/40 rounded-md z-0" style={{ width: `${percentage}%` }}></div>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {poll.totalVotes} votes • {userVotes[poll.id] !== undefined ? 'You voted' : 'Vote to see results'}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
} 