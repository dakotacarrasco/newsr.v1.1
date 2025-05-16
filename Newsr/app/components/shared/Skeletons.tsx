import React from 'react'

export const ArticleSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 border-2 border-black bg-white p-8 relative">
        <div className="h-4 w-20 bg-gray-200 mb-4"></div>
        <div className="h-8 w-3/4 bg-gray-200 mb-4"></div>
        <div className="h-6 w-full bg-gray-200 mb-6"></div>
        
        <div className="flex items-center justify-between pt-4 border-t-2 border-black">
          <div className="h-4 w-24 bg-gray-200"></div>
          <div className="h-4 w-16 bg-gray-200"></div>
        </div>
      </div>

      {/* Image skeleton */}
      <div className="mb-12 h-[400px] border-2 border-black bg-gray-200"></div>

      {/* Content skeleton */}
      <div className="border-2 border-black bg-white p-8">
        <div className="h-6 w-full bg-gray-200 mb-4"></div>
        <div className="h-6 w-11/12 bg-gray-200 mb-4"></div>
        <div className="h-6 w-3/4 bg-gray-200 mb-8"></div>
        
        <div className="h-6 w-full bg-gray-200 mb-4"></div>
        <div className="h-6 w-full bg-gray-200 mb-4"></div>
        <div className="h-6 w-5/6 bg-gray-200 mb-8"></div>
        
        <div className="h-6 w-11/12 bg-gray-200 mb-4"></div>
        <div className="h-6 w-4/5 bg-gray-200 mb-4"></div>
      </div>
    </div>
  )
}

export const ArticleCardSkeleton = () => {
  return (
    <div className="border-2 border-black bg-white p-6 relative animate-pulse">
      <div className="h-48 bg-gray-200 mb-4"></div>
      <div className="h-4 w-16 bg-gray-200 mb-2"></div>
      <div className="h-6 w-4/5 bg-gray-200 mb-2"></div>
      <div className="h-4 w-full bg-gray-200 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-3 w-12 bg-gray-200"></div>
        <div className="h-3 w-16 bg-gray-200"></div>
      </div>
    </div>
  )
}

export const SmallArticleSkeleton = () => {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="h-20 w-20 bg-gray-200 flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 w-full bg-gray-200 mb-2"></div>
        <div className="h-4 w-4/5 bg-gray-200 mb-2"></div>
        <div className="h-3 w-12 bg-gray-200"></div>
      </div>
    </div>
  )
} 