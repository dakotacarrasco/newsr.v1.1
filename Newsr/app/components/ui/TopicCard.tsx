'use client'

import { ReactNode } from 'react'
import { useTheme } from '@/app/components/ThemeProvider'
import { cn } from '@/app/lib/utils'

interface TopicCardProps {
  children: ReactNode
  className?: string
  title?: string
  icon?: ReactNode
  footer?: ReactNode
  noPadding?: boolean
}

export function TopicCard({
  children,
  className,
  title,
  icon,
  footer,
  noPadding = false
}: TopicCardProps) {
  const { theme } = useTheme()
  
  return (
    <div 
      className={cn(
        "rounded-lg border transition-colors",
        theme === 'dark' 
          ? "border-gray-700 bg-gray-800 text-gray-100" 
          : "border-gray-200 bg-white text-gray-900",
        className
      )}
    >
      {title && (
        <div className={cn(
          "flex items-center border-b px-6 py-4",
          theme === 'dark' ? "border-gray-700" : "border-gray-200"
        )}>
          {icon && <span className="mr-2">{icon}</span>}
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}
      
      <div className={!noPadding ? "p-6" : ""}>
        {children}
      </div>
      
      {footer && (
        <div className={cn(
          "border-t px-6 py-4",
          theme === 'dark' ? "border-gray-700" : "border-gray-200"
        )}>
          {footer}
        </div>
      )}
    </div>
  )
}

export function TopicSection({
  children,
  className,
  title,
  icon,
  action
}: {
  children: ReactNode
  className?: string
  title?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <section className={cn("mb-8", className)}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
} 