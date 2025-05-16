'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'

export default function LatestPoliticalNews() {
  // Mock data for latest news items
  const latestNews = [
    {
      id: 'latest-1',
      title: 'House Committee Advances Tax Reform Bill',
      time: '2 hours ago',
      category: 'Legislation'
    },
    {
      id: 'latest-2',
      title: 'Presidential Approval Rating Dips Amid Economic Concerns',
      time: '4 hours ago',
      category: 'Polls'
    },
    {
      id: 'latest-3',
      title: 'Governor Signs Controversial Education Law',
      time: '5 hours ago',
      category: 'State Politics'
    },
    {
      id: 'latest-4',
      title: 'International Summit Sets New Climate Goals',
      time: '7 hours ago',
      category: 'International'
    },
    {
      id: 'latest-5',
      title: 'Senate Majority Leader Announces Retirement',
      time: '9 hours ago',
      category: 'Congress'
    },
    {
      id: 'latest-6',
      title: 'Court Strikes Down Regulatory Agency Decision',
      time: '11 hours ago',
      category: 'Judiciary'
    }
  ]

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Latest Political News</h2>
        <Link href="/topics/politics/latest" className="text-blue-600 hover:underline">
          View All
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {latestNews.map((news) => (
            <li key={news.id} className="hover:bg-gray-50">
              <Link href={`/articles/${news.id}`} className="block p-4">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {news.category}
                  </span>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock size={12} className="mr-1" />
                    {news.time}
                  </div>
                </div>
                <h3 className="font-medium">{news.title}</h3>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="bg-gray-50 p-3 text-center">
          <Link href="/topics/politics/latest" className="text-blue-600 text-sm font-medium hover:underline">
            Load More News
          </Link>
        </div>
      </div>
    </section>
  )
} 