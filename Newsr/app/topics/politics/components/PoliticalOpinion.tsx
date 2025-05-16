'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function PoliticalOpinion() {
  // Mock data for opinion articles
  const opinionArticles = [
    {
      id: 'opinion-1',
      title: 'The Future of Campaign Finance Reform',
      excerpt: 'Our current system allows too much influence from special interests. Here\'s what we should do about it.',
      author: 'Jonathan Taylor',
      authorTitle: 'Political Analyst',
      authorImage: '/images/politics/authors/jonathan-taylor.jpg',
      date: 'August 7, 2023'
    },
    {
      id: 'opinion-2',
      title: 'Why Bipartisanship Still Matters in a Divided Era',
      excerpt: 'Despite increasing polarization, finding common ground remains essential for effective governance.',
      author: 'Eliza Washington',
      authorTitle: 'Former Congresswoman',
      authorImage: '/images/politics/authors/eliza-washington.jpg',
      date: 'August 4, 2023'
    },
    {
      id: 'opinion-3',
      title: 'The Case for Electoral Reform',
      excerpt: 'Our current voting systems have flaws that undermine true representation. Here\'s how we can fix them.',
      author: 'Marcus Jimenez',
      authorTitle: 'Constitutional Scholar',
      authorImage: '/images/politics/authors/marcus-jimenez.jpg',
      date: 'July 30, 2023'
    }
  ]

  return (
    <section className="mb-16 bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Political Opinions</h2>
          <p className="text-gray-600">Perspectives from our contributors</p>
        </div>
        <Link href="/topics/politics/opinions" className="text-blue-600 hover:underline">
          View All Opinions
        </Link>
      </div>
      
      <div className="space-y-6">
        {opinionArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow p-5 flex flex-col md:flex-row gap-4">
            <div className="flex items-center md:w-1/4">
              <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden relative mr-3">
                <Image 
                  src={article.authorImage}
                  alt={article.author}
                  fill
                  style={{objectFit: 'cover'}}
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div>
                <h4 className="font-medium">{article.author}</h4>
                <p className="text-sm text-gray-600">{article.authorTitle}</p>
              </div>
            </div>
            
            <div className="md:w-3/4">
              <h3 className="font-bold text-lg mb-2">
                <Link href={`/articles/${article.id}`} className="hover:text-blue-600 transition-colors">
                  {article.title}
                </Link>
              </h3>
              <p className="text-gray-700 mb-3">{article.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{article.date}</span>
                <Link href={`/articles/${article.id}`} className="text-blue-600 text-sm font-medium hover:underline">
                  Read More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
} 