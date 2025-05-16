'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, BarChart } from 'lucide-react'
import Link from 'next/link'

type Poll = {
  id: string
  question: string
  options: {
    id: string
    text: string
    votes: number
  }[]
  totalVotes: number
  expiresAt: string
}

export default function PollsSection() {
  const [activePolls, setActivePolls] = useState<Poll[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({})

  // Simulate loading polls
  useEffect(() => {
    // In a real app, fetch from API
    setTimeout(() => {
      setActivePolls([
        {
          id: 'poll-1',
          question: 'Which economic issue concerns you most?',
          options: [
            { id: 'option-1', text: 'Inflation', votes: 1242 },
            { id: 'option-2', text: 'Unemployment', votes: 879 },
            { id: 'option-3', text: 'Housing costs', votes: 1547 },
            { id: 'option-4', text: 'National debt', votes: 653 }
          ],
          totalVotes: 4321,
          expiresAt: '2023-12-31T23:59:59Z'
        },
        {
          id: 'poll-2',
          question: 'What should be the top priority for the government?',
          options: [
            { id: 'option-1', text: 'Healthcare reform', votes: 2341 },
            { id: 'option-2', text: 'Climate change', votes: 1982 },
            { id: 'option-3', text: 'Education', votes: 1675 },
            { id: 'option-4', text: 'National security', votes: 1254 }
          ],
          totalVotes: 7252,
          expiresAt: '2023-12-31T23:59:59Z'
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleOptionSelect = (pollId: string, optionId: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [pollId]: optionId
    })
  }

  const handleVote = (pollId: string) => {
    if (!selectedOptions[pollId]) return
    
    // In a real app, submit to API
    console.log(`Voted for poll ${pollId}, option ${selectedOptions[pollId]}`)
    
    // Mark as voted
    setHasVoted({
      ...hasVoted,
      [pollId]: true
    })
  }

  // Calculate percentage for option
  const getPercentage = (votes: number, totalVotes: number) => {
    return totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100)
  }

  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Active Polls</h2>
          <div className="h-1 flex-1 bg-black/10 mx-8" />
          <div className="w-32 h-6 bg-gray-200 animate-pulse rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="border-2 border-black p-6 bg-white">
              <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-6"></div>
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="mb-4 flex items-center">
                  <div className="h-5 w-5 bg-gray-200 animate-pulse rounded-full mr-3"></div>
                  <div className="h-5 w-full bg-gray-200 animate-pulse rounded"></div>
                </div>
              ))}
              <div className="h-10 w-full bg-gray-200 animate-pulse rounded mt-6"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Active Polls</h2>
        <div className="h-1 flex-1 bg-black/10 mx-8" />
        <Link href="/polls" className="text-blue-600 hover:underline font-medium flex items-center">
          All Polls <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activePolls.map((poll) => (
          <div key={poll.id} className="border-2 border-black p-6 bg-white">
            <h3 className="text-xl font-bold mb-6">{poll.question}</h3>
            
            {hasVoted[poll.id] ? (
              // Results view
              <div className="space-y-4">
                {poll.options.map((option) => {
                  const percentage = getPercentage(option.votes, poll.totalVotes)
                  const isSelected = selectedOptions[poll.id] === option.id
                  
                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className={isSelected ? "font-bold" : ""}>
                          {option.text} {isSelected && "✓"}
                        </span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isSelected ? "bg-blue-600" : "bg-gray-400"}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">{option.votes.toLocaleString()} votes</p>
                    </div>
                  )
                })}
                <p className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                  {poll.totalVotes.toLocaleString()} total votes
                </p>
              </div>
            ) : (
              // Voting view
              <div>
                <div className="space-y-3 mb-6">
                  {poll.options.map((option) => (
                    <label 
                      key={option.id} 
                      className={`flex items-center p-3 border rounded-md cursor-pointer
                      ${selectedOptions[poll.id] === option.id 
                        ? "border-blue-600 bg-blue-50" 
                        : "border-gray-300 hover:bg-gray-50"}`}
                    >
                      <input
                        type="radio"
                        name={`poll-${poll.id}`}
                        value={option.id}
                        checked={selectedOptions[poll.id] === option.id}
                        onChange={() => handleOptionSelect(poll.id, option.id)}
                        className="h-4 w-4 text-blue-600 mr-3"
                      />
                      {option.text}
                    </label>
                  ))}
                </div>
                
                <button
                  onClick={() => handleVote(poll.id)}
                  disabled={!selectedOptions[poll.id]}
                  className={`w-full py-2 px-4 rounded-md font-medium
                  ${selectedOptions[poll.id]
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                >
                  Vote
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Link 
          href="/polls" 
          className="inline-flex items-center justify-center px-6 py-3 border-2 border-black bg-white hover:bg-gray-100 font-medium"
        >
          <BarChart size={18} className="mr-2" />
          View All Polls
        </Link>
      </div>
    </section>
  )
}