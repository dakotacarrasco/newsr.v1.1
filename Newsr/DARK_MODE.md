# Newsr Dark Mode Implementation

This document outlines the dark mode implementation in the Newsr project and provides guidance for future development.

## Current Implementation

### 1. Theme Provider
- Location: `app/components/ThemeProvider.tsx`
- Features:
  - Provides theme context across the application
  - Supports light and dark themes
  - Detects and responds to system color scheme preferences
  - Persists user theme preference in localStorage
  - Includes toggleTheme helper function
  - Adds smooth transitions between themes

### 2. Theme Toggle Components
- Location: `app/components/ui/ThemeToggle.tsx`
- Features:
  - Simple icon toggle button
  - More advanced toggle with system preference option
  - Client-side hydration protection

### 3. Styling
- Base theme colors in `app/styles/globals.css`
- Added transition animations for smooth theme switching
- Prevented layout shifts during theme changes

### 4. Components with Dark Mode Support
- Header component (`app/components/layout/Header.tsx`)
- Technology section components (`app/topics/technology/components/TechTrends.tsx`)
- Reusable card components (`app/components/ui/TopicCard.tsx`)

## Remaining Tasks

### 1. Extend Dark Mode to Additional Sections
- Apply dark mode styling to:
  - Business section
  - Politics section
  - Sports section
  - Culture section
  - Lifestyle section
  - Local section

### 2. Fix Image Loading Issues
- Add proper image fallbacks that work in both themes
- Ensure proper contrast for image captions in dark mode
- Consider adding image loading skeletons with dark mode support

### 3. Performance Optimizations
- Lazy load heavy components when switching themes
- Further optimize theme transition animations
- Consider adding prefers-reduced-motion support

### 4. Enhanced User Experience
- Add first-time user preference prompt
- Improve theme toggle accessibility
- Add keyboard shortcuts for theme toggling

## Implementation Guidelines

When extending dark mode to new components:

1. Use the `useTheme()` hook to access the current theme
2. Use the `cn()` utility for conditional class merging
3. Design with both themes in mind from the start
4. Test all interactive elements in both themes
5. Ensure sufficient contrast ratios for accessibility

### Example Usage

```tsx
import { useTheme } from '@/app/components/ThemeProvider'
import { cn } from '@/app/lib/utils'

function MyComponent() {
  const { theme } = useTheme()
  
  return (
    <div className={cn(
      "p-4 rounded-lg",
      theme === 'dark' 
        ? "bg-gray-800 text-white" 
        : "bg-white text-gray-900"
    )}>
      Content here
    </div>
  )
}
```

## Resources

- [Tailwind Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Dark Mode Best Practices](https://uxdesign.cc/dark-mode-ui-best-practices-8b9f244de3bf) 