'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Vote, ArrowRight } from 'lucide-react'
import { getPolls } from '@/app/lib/polls'
import PollWidget from '@/app/components/shared/PollWidget'

interface Poll {
  id: string
  question: string
  options: any[]
  category?: string
  end_date?: string
  total_votes?: number
}

export default function PollsSection() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<Record<string, any>>({})

  useEffect(() => {
    async function fetchPolls() {
      setLoading(true)
      try {
        const pollsData = await getPolls()
        setPolls(pollsData.slice(0, 2)) // Get first two polls
      } catch (error) {
        console.error('Failed to fetch polls:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPolls()
  }, [])

  const handleVote = (pollId: string | number, optionId: any) => {
    setUserVotes(prev => ({
      ...prev,
      [pollId]: optionId
    }))
    // In a real app, you would send this vote to your backend
  }

  if (loading) {
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Vote className="w-6 h-6 text-pink-500" />
            <h2 className="text-2xl font-bold">Active Polls</h2>
          </div>
          <Link href="/polls" className="flex items-center text-sm font-medium hover:underline">
            View all polls
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="border-2 border-black bg-white p-6 animate-pulse h-64"></div>
          ))}
        </div>
      </section>
    )
  }

  if (polls.length === 0) {
    return null
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Vote className="w-6 h-6 text-pink-500" />
          <h2 className="text-2xl font-bold">Active Polls</h2>
        </div>
        <Link href="/polls" className="flex items-center text-sm font-medium hover:underline">
          View all polls
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((poll, index) => (
          <PollWidget
            key={poll.id}
            id={poll.id}
            question={poll.question}
            options={poll.options}
            category={poll.category}
            theme={index % 2 === 0 ? "red" : "blue"}
            onVote={handleVote}
          />
        ))}
      </div>
    </section>
  )
} 