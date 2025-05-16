'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/app/components/ThemeProvider'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme, toggleTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  
  // Handle hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) {
    return (
      <button 
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
          "border border-gray-200 dark:border-gray-700",
          className
        )}
        aria-label="Toggle theme"
      >
        <Sun className="w-5 h-5 text-gray-400" />
      </button>
    )
  }
  
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
        "border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800",
        className
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600" />
      )}
    </button>
  )
}

export function ThemeToggleWithText({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  
  // Handle hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const isUsingSystem = !localStorage.getItem('newsr-theme')
  
  // Handle theme selection
  const handleThemeSelect = (selectedTheme: 'light' | 'dark' | 'system') => {
    if (selectedTheme === 'system') {
      localStorage.removeItem('newsr-theme')
      setTheme(systemTheme || 'light')
    } else {
      setTheme(selectedTheme)
    }
  }
  
  if (!isMounted) return null
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center p-1 rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium",
            theme === 'light' && !isUsingSystem
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          )}
          onClick={() => handleThemeSelect('light')}
        >
          <Sun className="w-4 h-4" />
          Light
        </button>
        
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium",
            theme === 'dark' && !isUsingSystem
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          )}
          onClick={() => handleThemeSelect('dark')}
        >
          <Moon className="w-4 h-4" />
          Dark
        </button>
        
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium",
            isUsingSystem
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          )}
          onClick={() => handleThemeSelect('system')}
        >
          <Monitor className="w-4 h-4" />
          System
        </button>
      </div>
    </div>
  )
} 