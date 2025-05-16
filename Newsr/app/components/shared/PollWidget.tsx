import { useState } from 'react'

interface PollWidgetProps {
  id: string | number
  question: string
  options: {
    id: string | number
    text: string
    votes: number
  }[]
  category?: string
  theme?: 'blue' | 'red' | 'green' | 'purple'
  onVote?: (pollId: string | number, optionId: string | number) => void
}

export default function PollWidget({
  id,
  question,
  options,
  category,
  theme = 'blue',
  onVote
}: PollWidgetProps) {
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)
  
  const themeStyles = {
    blue: 'border-blue-500 bg-blue-50',
    red: 'border-red-500 bg-red-50',
    green: 'border-green-500 bg-green-50',
    purple: 'border-purple-500 bg-purple-50'
  }
  
  const themeAccent = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  }
  
  const handleVote = () => {
    if (!selectedOption || hasVoted) return
    
    // Call the onVote handler with the poll ID and selected option
    if (onVote) {
      onVote(id, selectedOption)
    }
    
    setHasVoted(true)
  }
  
  return (
    <div className={`border-2 border-black bg-white p-6 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
      <div className={`absolute -top-2 -right-2 h-5 w-5 border-2 border-black ${themeAccent[theme]}`}></div>
      
      {category && (
        <div className="mb-2">
          <span className="text-xs font-bold px-2 py-1 bg-gray-100 border border-gray-200 rounded">
            {category}
          </span>
        </div>
      )}
      
      <h3 className="text-lg font-bold mb-4">{question}</h3>
      
      <div className="space-y-3 mb-4">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
          
          return (
            <div key={option.id} className="relative">
              <label className={`
                block p-3 border-2 border-black cursor-pointer transition-all
                ${selectedOption === option.id ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}
                ${hasVoted ? 'pointer-events-none' : ''}
              `}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {!hasVoted && (
                      <input
                        type="radio"
                        name={`poll-${id}`}
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={() => setSelectedOption(option.id)}
                        className="mr-3"
                      />
                    )}
                    <span>{option.text}</span>
                  </div>
                  {hasVoted && (
                    <span className="font-bold">{percentage}%</span>
                  )}
                </div>
                
                {hasVoted && (
                  <div className="w-full h-1 mt-2 bg-gray-200">
                    <div 
                      className={`h-full ${themeAccent[theme]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                )}
              </label>
            </div>
          )
        })}
      </div>
      
      {!hasVoted ? (
        <button
          onClick={handleVote}
          disabled={!selectedOption}
          className={`
            px-4 py-2 border-2 border-black font-bold text-white
            ${themeAccent[theme]}
            ${!selectedOption ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
          `}
        >
          Vote
        </button>
      ) : (
        <div className="text-sm text-gray-500 italic">
          {totalVotes} votes
        </div>
      )}
    </div>
  )
} 