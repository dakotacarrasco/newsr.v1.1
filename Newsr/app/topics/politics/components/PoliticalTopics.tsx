'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Topic = 'domestic' | 'international' | 'election'

export default function PoliticalTopics() {
  const [activeTopic, setActiveTopic] = useState<Topic>('domestic')
  
  // Mock data for different political topics
  const topicData = {
    domestic: [
      {
        id: 'dom-1',
        title: 'Healthcare Reform Bill Gains Support',
        excerpt: 'A bipartisan group of lawmakers has announced their support for the comprehensive healthcare reform bill.',
        imageUrl: '/images/politics/healthcare.jpg',
        date: 'August 6, 2023'
      },
      {
        id: 'dom-2',
        title: 'Tax Policy Changes Expected This Fall',
        excerpt: 'The administration is preparing to unveil major tax policy reforms targeting corporate rates and deductions.',
        imageUrl: '/images/politics/taxes.jpg',
        date: 'August 5, 2023'
      },
      {
        id: 'dom-3',
        title: 'States Challenge Federal Environmental Regulations',
        excerpt: 'A coalition of states has filed a lawsuit challenging recent environmental protection rules.',
        imageUrl: '/images/politics/environment.jpg',
        date: 'August 3, 2023'
      }
    ],
    international: [
      {
        id: 'int-1',
        title: 'Trade Agreement Negotiations Enter Final Phase',
        excerpt: 'After months of talks, negotiators report they are nearing a final agreement on the multinational trade pact.',
        imageUrl: '/images/politics/trade.jpg',
        date: 'August 7, 2023'
      },
      {
        id: 'int-2',
        title: 'Diplomatic Summit Addresses Regional Security',
        excerpt: 'World leaders convened to discuss escalating tensions and security cooperation in the region.',
        imageUrl: '/images/politics/diplomacy.jpg',
        date: 'August 5, 2023'
      },
      {
        id: 'int-3',
        title: 'Foreign Aid Package Approved for Humanitarian Crisis',
        excerpt: 'Congress has approved emergency funding to address the growing humanitarian crisis.',
        imageUrl: '/images/politics/aid.jpg',
        date: 'August 2, 2023'
      }
    ],
    election: [
      {
        id: 'elec-1',
        title: 'Primary Season Heats Up With Key Contests',
        excerpt: 'Voters head to the polls in several states for crucial primary elections that could shape the upcoming general election.',
        imageUrl: '/images/politics/primary.jpg',
        date: 'August 8, 2023'
      },
      {
        id: 'elec-2',
        title: 'Campaign Finance Reports Show Record Fundraising',
        excerpt: 'Quarterly reports reveal unprecedented fundraising totals for candidates in competitive races.',
        imageUrl: '/images/politics/fundraising.jpg',
        date: 'August 4, 2023'
      },
      {
        id: 'elec-3',
        title: 'Debate Schedule Announced for Presidential Candidates',
        excerpt: 'The election commission has released the official schedule for presidential debates.',
        imageUrl: '/images/politics/debate.jpg',
        date: 'August 1, 2023'
      }
    ]
  }
  
  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Political Topics</h2>
        <Link href={`/topics/politics/${activeTopic}`} className="text-blue-600 hover:underline">
          View All {activeTopic.charAt(0).toUpperCase() + activeTopic.slice(1)} News
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTopic === 'domestic' 
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTopic('domestic')}
          >
            Domestic Policy
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTopic === 'international' 
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTopic('international')}
          >
            International Affairs
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTopic === 'election' 
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTopic('election')}
          >
            Election Coverage
          </button>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topicData[activeTopic].map((item) => (
              <div key={item.id} className="rounded overflow-hidden shadow-sm">
                <div className="relative h-40">
                  <div className="h-full w-full bg-gray-300 relative">
                    <Image 
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      style={{objectFit: 'cover'}}
                      onError={(e) => {
                        // Fallback to a placeholder color if image fails to load
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium mb-2 line-clamp-2">
                    <Link href={`/articles/${item.id}`} className="hover:text-blue-600">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.excerpt}</p>
                  <div className="text-xs text-gray-500">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 