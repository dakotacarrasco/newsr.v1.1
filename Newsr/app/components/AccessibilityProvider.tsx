'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { generateId } from '@/app/lib/utils'

interface AccessibilityContextType {
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void
  focusElement: (elementId: string) => void
  trapFocus: (containerId: string, active: boolean) => void
  skipToContent: () => void
  reducedMotion: boolean
  highContrast: boolean
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const liveRegionRef = useRef<HTMLDivElement>(null)
  const assertiveLiveRegionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleMotionChange)

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    setHighContrast(contrastQuery.matches)
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches)
    }
    
    contrastQuery.addEventListener('change', handleContrastChange)

    // Skip to content functionality
    const handleSkipToContent = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        const skipLink = document.getElementById('skip-to-content')
        if (skipLink && document.activeElement === skipLink) {
          skipToContent()
        }
      }
    }

    document.addEventListener('keydown', handleSkipToContent)

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
      document.removeEventListener('keydown', handleSkipToContent)
    }
  }, [])

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = priority === 'assertive' ? assertiveLiveRegionRef.current : liveRegionRef.current
    
    if (liveRegion) {
      liveRegion.textContent = message
      
      // Clear the message after announcement
      setTimeout(() => {
        if (liveRegion) {
          liveRegion.textContent = ''
        }
      }, 1000)
    }
  }

  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
    }
  }

  const trapFocus = (containerId: string, active: boolean) => {
    const container = document.getElementById(containerId)
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    if (active) {
      container.addEventListener('keydown', handleTabKey)
      firstElement.focus()
    } else {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  const skipToContent = () => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
    }
  }

  return (
    <AccessibilityContext.Provider
      value={{
        announceToScreenReader,
        focusElement,
        trapFocus,
        skipToContent,
        reducedMotion,
        highContrast,
      }}
    >
      {/* Skip to content link */}
      <a
        id="skip-to-content"
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
        onClick={(e) => {
          e.preventDefault()
          skipToContent()
        }}
      >
        Skip to main content
      </a>

      {/* Live regions for screen reader announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        ref={assertiveLiveRegionRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />

      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// Accessibility-enhanced components
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  className?: string
  [key: string]: any
}) {
  const { announceToScreenReader } = useAccessibility()
  const buttonId = useRef(generateId('button'))

  const handleClick = () => {
    if (onClick) {
      onClick()
      if (ariaLabel) {
        announceToScreenReader(`${ariaLabel} activated`)
      }
    }
  }

  return (
    <button
      id={buttonId.current}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = '',
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  const { trapFocus, announceToScreenReader } = useAccessibility()
  const modalId = useRef(generateId('modal'))
  const titleId = useRef(generateId('modal-title'))
  const descriptionId = useRef(generateId('modal-description'))

  useEffect(() => {
    if (isOpen) {
      trapFocus(modalId.current, true)
      announceToScreenReader(`${title} dialog opened`)
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
        trapFocus(modalId.current, false)
        announceToScreenReader(`${title} dialog closed`)
      }
    }
  }, [isOpen, title, onClose, trapFocus, announceToScreenReader])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        id={modalId.current}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        aria-describedby={description ? descriptionId.current : undefined}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId.current} className="text-xl font-bold mb-4">
          {title}
        </h2>
        {description && (
          <p id={descriptionId.current} className="text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  )
} 