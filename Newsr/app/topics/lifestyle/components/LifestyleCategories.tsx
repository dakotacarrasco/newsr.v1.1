'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function LifestyleCategories() {
  // Mock data for lifestyle categories
  const categories = [
    {
      id: 'wellness',
      name: 'Wellness & Health',
      description: 'Mind, body and spirit wellness for a balanced lifestyle',
      imageUrl: '/images/lifestyle/categories/wellness.jpg',
      color: 'bg-green-50 text-green-700 border-green-200',
      topics: ['Meditation', 'Fitness', 'Mental Health', 'Nutrition']
    },
    {
      id: 'food',
      name: 'Food & Cuisine',
      description: 'Recipes, food trends, and culinary adventures',
      imageUrl: '/images/lifestyle/categories/food.jpg',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      topics: ['Recipes', 'Restaurant Reviews', 'Cooking Tips', 'Dietary Guides']
    },
    {
      id: 'travel',
      name: 'Travel & Adventure',
      description: 'Destinations, travel tips, and cultural experiences',
      imageUrl: '/images/lifestyle/categories/travel.jpg',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      topics: ['Destinations', 'Travel Guides', 'Budget Travel', 'Adventure Sports']
    },
    {
      id: 'home',
      name: 'Home & Decor',
      description: 'Interior design, home improvement, and gardening',
      imageUrl: '/images/lifestyle/categories/home.jpg',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      topics: ['Interior Design', 'DIY Projects', 'Gardening', 'Organization']
    },
    {
      id: 'fashion',
      name: 'Fashion & Style',
      description: 'Fashion trends, style guides, and beauty tips',
      imageUrl: '/images/lifestyle/categories/fashion.jpg',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      topics: ['Trends', 'Style Guides', 'Sustainable Fashion', 'Accessories']
    },
    {
      id: 'relationships',
      name: 'Relationships',
      description: 'Dating, family dynamics, and interpersonal connections',
      imageUrl: '/images/lifestyle/categories/relationships.jpg',
      color: 'bg-pink-50 text-pink-700 border-pink-200',
      topics: ['Dating', 'Family', 'Friendships', 'Communication']
    }
  ]

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Explore Lifestyle Categories</h2>
        <Link href="/topics/lifestyle/categories" className="text-blue-600 hover:underline">
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            {/* Background image with overlay */}
            <div className="relative h-64">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />
              <div className="h-full w-full bg-gray-200 relative">
                <Image 
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  style={{objectFit: 'cover'}}
                  className="group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
            
            {/* Content overlay */}
            <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-gray-200 text-sm">{category.description}</p>
              </div>
              
              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {category.topics.map((topic, idx) => (
                    <Link 
                      key={idx} 
                      href={`/topics/lifestyle/${category.id}/${topic.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${category.color}`}
                    >
                      {topic}
                    </Link>
                  ))}
                </div>
                
                <Link 
                  href={`/topics/lifestyle/${category.id}`}
                  className="flex items-center text-white font-medium text-sm group-hover:underline"
                >
                  <span>Explore {category.name}</span>
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
} 