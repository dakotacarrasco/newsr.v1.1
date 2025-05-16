'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function FeaturedPoliticalArticles() {
  // Mock data for featured political articles
  const featuredArticles = [
    {
      id: 'pol-2',
      title: 'Supreme Court Issues Landmark Ruling on Voting Rights',
      excerpt: 'The Supreme Court\'s decision will have far-reaching implications for how states can regulate their electoral processes.',
      imageUrl: '/images/politics/supreme-court.jpg',
      category: 'Judiciary',
      date: 'July 28, 2023',
      author: 'Sarah Johnson'
    },
    {
      id: 'pol-3',
      title: 'White House Proposes New Climate Regulations',
      excerpt: 'The administration unveiled a comprehensive plan to reduce carbon emissions across various industries.',
      imageUrl: '/images/politics/white-house.jpg',
      category: 'Executive',
      date: 'August 5, 2023',
      author: 'Daniel Chen'
    },
    {
      id: 'pol-4',
      title: 'Senators Debate Foreign Aid Package in Heated Session',
      excerpt: 'The debate over international assistance has revealed deep partisan divides in Congress.',
      imageUrl: '/images/politics/senate.jpg',
      category: 'Congress',
      date: 'August 2, 2023',
      author: 'Maria Rodriguez'
    }
  ]

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Political Stories</h2>
        <Link href="/topics/politics/featured" className="text-blue-600 hover:underline">
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <div className="h-full w-full bg-gray-300 relative">
                <Image 
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  style={{objectFit: 'cover'}}
                  onError={(e) => {
                    // Fallback to a placeholder color if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div className="absolute top-3 left-3">
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {article.category}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                <Link href={`/articles/${article.id}`} className="hover:text-blue-600 transition-colors">
                  {article.title}
                </Link>
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {article.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>By {article.author}</span>
                <span>{article.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
} 