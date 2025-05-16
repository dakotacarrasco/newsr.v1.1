'use client'

import React from 'react'

interface WorkplaceModelPollProps {
  userVotes: Record<string | number, any>
  handleVote: (pollId: string | number, optionId: any) => void
}

export default function WorkplaceModelPoll({ userVotes, handleVote }: WorkplaceModelPollProps) {
  const pollId = 'workplace-model'
  const hasVoted = userVotes[pollId] !== undefined
  
  const options = [
    { id: 'remote', text: 'Fully Remote', votes: 198 },
    { id: 'hybrid', text: 'Hybrid Model', votes: 274 },
    { id: 'office', text: 'Full-time Office', votes: 126 },
    { id: 'flexible', text: 'Flexible (Employee Choice)', votes: 231 }
  ]
  
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
      <h3 className="font-bold text-lg mb-2">Workplace Model</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
        Which workplace model do you think is most effective for businesses today?
      </p>
      
      <div className="space-y-3">
        {options.map(option => {
          const isSelected = userVotes[pollId] === option.id
          const percentage = Math.round((option.votes / totalVotes) * 100)
          
          return (
            <div key={option.id} className="relative">
              <button
                className={`w-full text-left p-3 border rounded-md relative z-10 transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={() => !hasVoted && handleVote(pollId, option.id)}
                disabled={hasVoted && !isSelected}
              >
                <div className="flex justify-between items-center">
                  <span className={isSelected ? 'font-medium' : ''}>{option.text}</span>
                  {hasVoted && <span className="text-sm">{percentage}%</span>}
                </div>
                
                {/* Progress bar (only shown after voting) */}
                {hasVoted && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-blue-100 dark:bg-blue-900/40 rounded-md z-0" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                )}
              </button>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {totalVotes} votes • {hasVoted ? 'You voted' : 'Vote to see results'}
      </div>
    </div>
  )
} 