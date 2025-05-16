'use client'

import React from 'react'
import Link from 'next/link'

export default function RelatedPolls() {
  const polls = [
    {
      id: 'inflation-impact',
      title: 'Inflation Impact on Consumer Spending',
      votes: 342,
    },
    {
      id: 'interest-rates',
      title: 'Future Direction of Interest Rates',
      votes: 287,
    },
    {
      id: 'housing-market',
      title: 'Housing Market Outlook',
      votes: 264,
    },
    {
      id: 'crypto-investments',
      title: 'Cryptocurrency as an Investment',
      votes: 318,
    }
  ]
  
  return (
    <section className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Related Polls</h2>
        <Link 
          href="/topics/business/polls"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {polls.map(poll => (
          <Link
            key={poll.id}
            href={`/topics/business/polls/${poll.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-2 line-clamp-2">{poll.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {poll.votes} votes
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
} 