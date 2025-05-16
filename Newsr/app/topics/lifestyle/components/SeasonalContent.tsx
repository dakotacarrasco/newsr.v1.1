'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CalendarDays, ChevronRight, ChevronLeft } from 'lucide-react'

export default function SeasonalContent() {
  const [currentMonth, setCurrentMonth] = useState<number>(0)
  
  useEffect(() => {
    // Set the current month when component mounts
    const date = new Date()
    setCurrentMonth(date.getMonth())
  }, [])
  
  // Determine season based on month (Northern Hemisphere)
  const getSeason = (month: number) => {
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }
  
  const season = getSeason(currentMonth)
  
  // Mock seasonal content
  const seasonalContent = {
    spring: {
      title: 'Spring Renewal & Refresh',
      description: 'As nature awakens, discover ways to rejuvenate your life, home, and wardrobe for the new season.',
      color: 'bg-green-100',
      accentColor: 'text-green-700',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      imageUrl: '/images/lifestyle/seasonal/spring.jpg',
      topics: [
        {
          title: 'Spring Cleaning Guide',
          excerpt: 'A room-by-room guide to decluttering and organizing your space for a fresh start.',
          link: '/topics/lifestyle/spring/cleaning'
        },
        {
          title: 'Garden Planning 101',
          excerpt: 'Everything you need to know to plan, prepare, and plant your garden this spring.',
          link: '/topics/lifestyle/spring/gardening'
        },
        {
          title: 'Lightweight Fashion Essentials',
          excerpt: 'Transitional pieces to refresh your wardrobe as the weather warms up.',
          link: '/topics/lifestyle/spring/fashion'
        }
      ]
    },
    summer: {
      title: 'Summer Living & Adventure',
      description: 'Make the most of long days and warm weather with our guides to travel, outdoor entertaining, and seasonal wellness.',
      color: 'bg-yellow-100',
      accentColor: 'text-yellow-700',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      imageUrl: '/images/lifestyle/seasonal/summer.jpg',
      topics: [
        {
          title: 'Ultimate Summer Grilling Guide',
          excerpt: 'Perfect grilling techniques and recipes for your summer cookouts and BBQs.',
          link: '/topics/lifestyle/summer/grilling'
        },
        {
          title: 'Beach Vacation Essentials',
          excerpt: 'Everything you need to pack for the perfect beach getaway this summer.',
          link: '/topics/lifestyle/summer/beach'
        },
        {
          title: 'Heat-Safe Skincare Routine',
          excerpt: 'Protect your skin while maintaining a healthy glow during the hottest months.',
          link: '/topics/lifestyle/summer/skincare'
        }
      ]
    },
    fall: {
      title: 'Fall Comfort & Coziness',
      description: 'Embrace the changing season with warm flavors, cozy decor, and outdoor activities amid the beautiful autumn colors.',
      color: 'bg-orange-100',
      accentColor: 'text-orange-700',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      imageUrl: '/images/lifestyle/seasonal/fall.jpg',
      topics: [
        {
          title: 'Cozy Home Decor Trends',
          excerpt: 'Transform your space with warm textures and rich autumnal colors.',
          link: '/topics/lifestyle/fall/decor'
        },
        {
          title: 'Pumpkin Spice & Everything Nice',
          excerpt: 'Seasonal recipes that celebrate the flavors of fall beyond the basic PSL.',
          link: '/topics/lifestyle/fall/recipes'
        },
        {
          title: 'Fall Foliage Travel Guide',
          excerpt: 'Best destinations to witness the spectacular colors of autumn leaves.',
          link: '/topics/lifestyle/fall/travel'
        }
      ]
    },
    winter: {
      title: 'Winter Wellness & Celebration',
      description: 'Find joy in the coldest season with holiday traditions, indoor activities, and wellness practices to keep you thriving.',
      color: 'bg-blue-100',
      accentColor: 'text-blue-700',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      imageUrl: '/images/lifestyle/seasonal/winter.jpg',
      topics: [
        {
          title: 'Holiday Entertaining Made Simple',
          excerpt: 'Stress-free planning tips for hosting memorable gatherings during the festive season.',
          link: '/topics/lifestyle/winter/entertaining'
        },
        {
          title: 'Winter Self-Care Rituals',
          excerpt: 'Combat seasonal blues with these nurturing practices for mind and body.',
          link: '/topics/lifestyle/winter/self-care'
        },
        {
          title: 'Comfort Food Classics Reimagined',
          excerpt: 'Healthier versions of your favorite winter comfort foods that don\'t sacrifice flavor.',
          link: '/topics/lifestyle/winter/food'
        }
      ]
    }
  }
  
  const currentContent = seasonalContent[season]

  return (
    <section className={`mb-12 rounded-xl overflow-hidden ${currentContent.color}`}>
      <div className="relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-gray-300 relative">
            <Image 
              src={currentContent.imageUrl}
              alt={currentContent.title}
              fill
              style={{objectFit: 'cover'}}
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        </div>
        
        <div className="relative z-10 px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center">
                <CalendarDays className={`${currentContent.accentColor} w-5 h-5 mr-2`} />
                <h2 className={`text-2xl font-bold ${currentContent.accentColor}`}>
                  {currentContent.title}
                </h2>
              </div>
              <p className="text-gray-700 mt-1">
                {currentContent.description}
              </p>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <button 
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100"
                onClick={() => setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1))}
                aria-label="Previous season"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100"
                onClick={() => setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1))}
                aria-label="Next season"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          
          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentContent.topics.map((topic, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5">
                <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{topic.excerpt}</p>
                <Link 
                  href={topic.link}
                  className={`inline-block px-4 py-2 rounded-lg text-sm font-medium text-white ${currentContent.buttonColor} transition-colors`}
                >
                  Read More
                </Link>
              </div>
            ))}
          </div>
          
          {/* View all link */}
          <div className="text-center mt-8">
            <Link 
              href={`/topics/lifestyle/${season}`}
              className={`flex items-center justify-center ${currentContent.accentColor} font-medium hover:underline`}
            >
              View All {season.charAt(0).toUpperCase() + season.slice(1)} Content
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 