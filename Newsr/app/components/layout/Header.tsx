'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, Search, User, LogOut, ChevronDown, Settings, BookmarkIcon, LayoutDashboard } from 'lucide-react'
import { useTheme } from '@/app/components/ThemeProvider'
import { ThemeToggle } from '@/app/components/ui/ThemeToggle'
import { useAuth } from '@/app/context/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const { theme } = useTheme()
  const { user, signOut } = useAuth()
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const isDarkMode = theme === 'dark'
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen) setIsMenuOpen(false)
      
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isMenuOpen, isAccountMenuOpen])
  
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent immediate closing
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleAccountMenu = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent immediate closing
    setIsAccountMenuOpen(!isAccountMenuOpen)
  }

  const handleLogout = () => {
    signOut()
    setIsAccountMenuOpen(false)
  }

  const topics = [
    { name: 'Technology', slug: 'technology' },
    { name: 'Business', slug: 'business' },
    { name: 'Politics', slug: 'politics' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Local', slug: 'local' },
    { name: 'Lifestyle', slug: 'lifestyle' },
    { name: 'Culture', slug: 'culture' },
  ]

  return (
    <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            NEWSR
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {topics.map((topic) => (
              <Link 
                key={topic.slug}
                href={`/topics/${topic.slug}`} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {topic.name}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Right Side Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            <Link href="/search" aria-label="Search" className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Search size={20} />
            </Link>
            
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button 
                  onClick={toggleAccountMenu}
                  className="flex items-center space-x-2 py-2 px-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <span className="font-medium max-w-[120px] truncate hidden sm:inline">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-10 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link 
                        href="/dashboard" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <LayoutDashboard size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
                        Dashboard
                      </Link>
                      
                      <Link 
                        href="/dashboard/saved" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <BookmarkIcon size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
                        Saved Articles
                      </Link>
                      
                      <Link 
                        href="/dashboard/settings" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <Settings size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
                        Account Settings
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut size={16} className="mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <Link href="/search" aria-label="Search" className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Search size={20} />
            </Link>
            {user && (
              <button
                onClick={toggleAccountMenu}
                className="p-1 rounded-full bg-blue-500 flex items-center justify-center text-white"
              >
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </button>
            )}
            <button
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            <nav className="flex flex-col space-y-4 px-2">
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {topic.name}
                </Link>
              ))}
              
              {user ? (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 px-3">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/saved"
                      className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookmarkIcon size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                      Saved Articles
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                      Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <LogOut size={18} className="mr-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="mt-4 block w-full px-4 py-3 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
        
        {/* Mobile Account Menu (when menu is closed but account is clicked) */}
        {isAccountMenuOpen && !isMenuOpen && (
          <div className="md:hidden py-4 mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="py-2">
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsAccountMenuOpen(false)}
              >
                <LayoutDashboard size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/saved"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsAccountMenuOpen(false)}
              >
                <BookmarkIcon size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                Saved Articles
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsAccountMenuOpen(false)}
              >
                <Settings size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogOut size={18} className="mr-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
