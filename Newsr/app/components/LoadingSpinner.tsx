import { cn } from '@/app/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'white'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const variantClasses = {
  default: 'text-gray-600 dark:text-gray-400',
  primary: 'text-blue-600 dark:text-blue-400',
  white: 'text-white'
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  className, 
  text 
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex items-center space-x-2">
        <svg
          className={cn(
            'animate-spin',
            sizeClasses[size],
            variantClasses[variant]
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {text && (
          <span className={cn(
            'text-sm font-medium',
            variantClasses[variant]
          )}>
            {text}
          </span>
        )}
      </div>
    </div>
  )
}

// Full page loading overlay
export function LoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <LoadingSpinner size="lg" variant="primary" className="mb-4" />
        <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
          {text}
        </p>
      </div>
    </div>
  )
}

// Skeleton loading components
export function ArticleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700 aspect-video rounded-lg mb-4" />
      <div className="space-y-2">
        <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4" />
        <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2" />
        <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-1/4" />
      </div>
    </div>
  )
}

export function ArticleListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, i) => (
        <ArticleSkeleton key={i} />
      ))}
    </div>
  )
} 