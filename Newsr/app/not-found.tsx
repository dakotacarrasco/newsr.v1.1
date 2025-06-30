'use client'

import Link from 'next/link'
import { Search, Home, ArrowLeft, TrendingUp } from 'lucide-react'

export default function NotFound() {
  const popularTopics = [
    { name: 'Technology', href: '/topics/technology', color: 'text-blue-600' },
    { name: 'Business', href: '/topics/business', color: 'text-green-600' },
    { name: 'Politics', href: '/topics/politics', color: 'text-red-600' },
    { name: 'Sports', href: '/topics/sports', color: 'text-orange-600' },
    { name: 'Culture', href: '/topics/culture', color: 'text-purple-600' },
    { name: 'Local News', href: '/topics/local', color: 'text-indigo-600' },
  ]

  const quickLinks = [
    { name: 'Latest Articles', href: '/articles', description: 'Read the most recent news stories' },
    { name: 'Search', href: '/search', description: 'Find specific articles or topics' },
    { name: 'About Us', href: '/about', description: 'Learn more about NewsR' },
    { name: 'Contact', href: '/contact', description: 'Get in touch with our team' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="inline-block text-8xl font-bold text-gray-300 dark:text-gray-600 animate-pulse">
              404
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Homepage
            </Link>
            
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.history.back()
                }
              }}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
            
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Articles
            </Link>
          </div>

          {/* Popular Topics */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 mr-2 text-orange-500" />
              Popular Topics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {popularTopics.map((topic) => (
                <Link
                  key={topic.name}
                  href={topic.href}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className={`font-semibold ${topic.color}`}>
                    {topic.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Quick Links
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 text-left"
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {link.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {link.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <div className="max-w-md mx-auto">
            <form 
              action="/search" 
              method="GET"
              className="flex gap-2"
            >
              <input
                type="text"
                name="q"
                placeholder="Search for articles..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Error Code */}
          <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
            Error Code: 404 - Page Not Found
          </div>
        </div>
      </div>
  )
} 