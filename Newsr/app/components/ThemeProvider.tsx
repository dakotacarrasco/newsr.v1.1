'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  systemTheme: Theme | null
  toggleTheme: () => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [systemTheme, setSystemTheme] = useState<Theme | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setSystemTheme(prefersDark ? 'dark' : 'light')
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('newsr-theme') as Theme | null
    
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Use system preference if no saved theme
      setTheme(prefersDark ? 'dark' : 'light')
    }

    // Add listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
      // Only update theme automatically if user hasn't set a preference
      if (!localStorage.getItem('newsr-theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    
    // Set mounted to true once component is mounted
    setMounted(true)
    
    // Give a slight delay before removing loading state to allow transitions
    setTimeout(() => {
      setIsLoading(false)
    }, 150) 
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Update class on html element when theme changes
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const oldTheme = theme === 'dark' ? 'light' : 'dark'
    
    root.classList.remove(oldTheme)
    root.classList.add(theme)
    
    // Save theme preference
    localStorage.setItem('newsr-theme', theme)

    // Add transition class to enable animations
    // We remove and re-add the class to restart animations
    root.classList.remove('theme-transition')
    setTimeout(() => {
      root.classList.add('theme-transition')
    }, 10)
  }, [theme, mounted])

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  // Provider value
  const contextValue = {
    theme,
    setTheme,
    systemTheme,
    toggleTheme,
    isLoading
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 