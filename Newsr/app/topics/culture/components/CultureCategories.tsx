'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ChevronRight, ImageIcon } from 'lucide-react'

type Category = 'film' | 'music' | 'art' | 'literature' | 'theater' | 'dance'

export default function CultureCategories() {
  const [activeCategory, setActiveCategory] = useState<Category>('film')
  const [imageError, setImageError] = useState(false)
  
  // Cultural categories
  const categories = [
    {
      id: 'film',
      name: 'Film & Cinema',
      color: 'bg-amber-100 border-amber-200 text-amber-800',
      activeColor: 'bg-amber-600 text-white',
      darkColor: 'dark:bg-amber-900/30 dark:border-amber-800/30 dark:text-amber-300',
      darkActiveColor: 'dark:bg-amber-700 dark:text-white',
      description: 'Explore the world of cinema, from blockbusters to independent films and international masterpieces.',
      image: '/images/culture/categories/film.jpg'
    },
    {
      id: 'music',
      name: 'Music',
      color: 'bg-blue-100 border-blue-200 text-blue-800',
      activeColor: 'bg-blue-600 text-white',
      darkColor: 'dark:bg-blue-900/30 dark:border-blue-800/30 dark:text-blue-300',
      darkActiveColor: 'dark:bg-blue-700 dark:text-white',
      description: 'Discover the latest in classical, pop, jazz, and world music, including concerts, albums, and artist profiles.',
      image: '/images/culture/categories/music.jpg'
    },
    {
      id: 'art',
      name: 'Art & Design',
      color: 'bg-green-100 border-green-200 text-green-800',
      activeColor: 'bg-green-600 text-white',
      darkColor: 'dark:bg-green-900/30 dark:border-green-800/30 dark:text-green-300',
      darkActiveColor: 'dark:bg-green-700 dark:text-white',
      description: 'From contemporary galleries to classical museums, explore visual arts, sculpture, and design trends.',
      image: '/images/culture/categories/art.jpg'
    },
    {
      id: 'literature',
      name: 'Literature',
      color: 'bg-red-100 border-red-200 text-red-800',
      activeColor: 'bg-red-600 text-white',
      darkColor: 'dark:bg-red-900/30 dark:border-red-800/30 dark:text-red-300',
      darkActiveColor: 'dark:bg-red-700 dark:text-white',
      description: 'Book reviews, author interviews, literary festivals, and the evolving world of publishing.',
      image: '/images/culture/categories/literature.jpg'
    },
    {
      id: 'theater',
      name: 'Theater',
      color: 'bg-purple-100 border-purple-200 text-purple-800',
      activeColor: 'bg-purple-600 text-white',
      darkColor: 'dark:bg-purple-900/30 dark:border-purple-800/30 dark:text-purple-300',
      darkActiveColor: 'dark:bg-purple-700 dark:text-white',
      description: 'Broadway, West End, and international stage productions, including plays, musicals, and performance art.',
      image: '/images/culture/categories/theater.jpg'
    },
    {
      id: 'dance',
      name: 'Dance',
      color: 'bg-pink-100 border-pink-200 text-pink-800',
      activeColor: 'bg-pink-600 text-white',
      darkColor: 'dark:bg-pink-900/30 dark:border-pink-800/30 dark:text-pink-300',
      darkActiveColor: 'dark:bg-pink-700 dark:text-white',
      description: 'Ballet, contemporary, and traditional dance forms from around the world, featuring performances and profiles.',
      image: '/images/culture/categories/dance.jpg'
    }
  ]
  
  // Find the active category
  const currentCategory = categories.find(cat => cat.id === activeCategory)!
  
  // Latest articles by category
  const categoryArticles = {
    film: [
      {
        id: 'film-1',
        title: 'How Streaming Platforms Are Changing Cinema Distribution Forever',
        date: 'October 19, 2023',
        link: '/articles/film-1'
      },
      {
        id: 'film-2',
        title: 'International Film Festivals Return to Pre-Pandemic Scale',
        date: 'October 17, 2023',
        link: '/articles/film-2'
      },
      {
        id: 'film-3',
        title: 'The Rise of Asian Cinema in Global Film Markets',
        date: 'October 14, 2023',
        link: '/articles/film-3'
      }
    ],
    music: [
      {
        id: 'music-1',
        title: 'How AI is Being Used to Create New Forms of Musical Expression',
        date: 'October 18, 2023',
        link: '/articles/music-1'
      },
      {
        id: 'music-2',
        title: 'The Return of Vinyl: Why Physical Media is Making a Comeback',
        date: 'October 16, 2023',
        link: '/articles/music-2'
      },
      {
        id: 'music-3',
        title: 'World Music Influences in Contemporary Pop Production',
        date: 'October 13, 2023',
        link: '/articles/music-3'
      }
    ],
    art: [
      {
        id: 'art-1',
        title: 'NFTs and the Future of Digital Art Ownership',
        date: 'October 20, 2023',
        link: '/articles/art-1'
      },
      {
        id: 'art-2',
        title: 'Museums Embrace Virtual Reality for Immersive Exhibitions',
        date: 'October 18, 2023',
        link: '/articles/art-2'
      },
      {
        id: 'art-3',
        title: 'Indigenous Art Movements Gaining Recognition in Major Galleries',
        date: 'October 15, 2023',
        link: '/articles/art-3'
      }
    ],
    literature: [
      {
        id: 'lit-1',
        title: 'Climate Fiction Emerges as Powerful New Literary Genre',
        date: 'October 19, 2023',
        link: '/articles/lit-1'
      },
      {
        id: 'lit-2',
        title: 'Audiobook Boom Changing How We Consume Literature',
        date: 'October 16, 2023',
        link: '/articles/lit-2'
      },
      {
        id: 'lit-3',
        title: 'Literary Translation Bringing New Voices to Global Readers',
        date: 'October 13, 2023',
        link: '/articles/lit-3'
      }
    ],
    theater: [
      {
        id: 'theater-1',
        title: 'Broadway Sees Record Attendance Post-Pandemic',
        date: 'October 19, 2023',
        link: '/articles/theater-1'
      },
      {
        id: 'theater-2',
        title: 'Immersive Theater Blurs Lines Between Audience and Performance',
        date: 'October 17, 2023',
        link: '/articles/theater-2'
      },
      {
        id: 'theater-3',
        title: 'Community Theater Programs Revitalize Local Arts Scenes',
        date: 'October 14, 2023',
        link: '/articles/theater-3'
      }
    ],
    dance: [
      {
        id: 'dance-1',
        title: 'Contemporary Choreographers Pushing Boundaries of Movement',
        date: 'October 18, 2023',
        link: '/articles/dance-1'
      },
      {
        id: 'dance-2',
        title: 'TikTok Dance Trends Creating New Pathways to Professional Dance',
        date: 'October 15, 2023',
        link: '/articles/dance-2'
      },
      {
        id: 'dance-3',
        title: 'Traditional Dance Forms Finding New Audiences Through Fusion',
        date: 'October 12, 2023',
        link: '/articles/dance-3'
      }
    ]
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Explore Cultural Categories</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Category tabs */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? `${category.activeColor} ${category.darkActiveColor}`
                  : `text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`
              }`}
              onClick={() => {
                setActiveCategory(category.id as Category)
                setImageError(false) // Reset image error when changing category
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Category content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side: image and description */}
            <div className="md:w-1/3">
              <div className="rounded-lg overflow-hidden mb-4 h-48 relative">
                {!imageError ? (
                  <Image 
                    src={currentCategory.image}
                    alt={currentCategory.name}
                    fill
                    style={{objectFit: 'cover'}}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                      <div className="text-gray-500 dark:text-gray-400 font-medium mt-2">
                        {currentCategory.name}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{currentCategory.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{currentCategory.description}</p>
              
              <Link 
                href={`/topics/culture/${currentCategory.id}`}
                className={`mt-4 inline-flex items-center text-sm font-medium ${currentCategory.color.split(' ')[2]} ${currentCategory.darkColor.split(' ')[2]} hover:underline`}
              >
                Explore {currentCategory.name}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {/* Right side: latest articles */}
            <div className="md:w-2/3">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Latest in {currentCategory.name}</h3>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {categoryArticles[activeCategory].map((article) => (
                  <Link 
                    key={article.id}
                    href={article.link}
                    className="py-3 block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h4 className="font-medium mb-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-gray-900 dark:text-white">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{article.date}</p>
                  </Link>
                ))}
              </div>
              
              <div className="mt-6 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
                <Link 
                  href={`/topics/culture/${currentCategory.id}/all`}
                  className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline inline-flex items-center"
                >
                  View All {currentCategory.name} Articles
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 