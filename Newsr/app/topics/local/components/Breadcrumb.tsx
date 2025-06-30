import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav 
      className="flex mb-8 text-sm text-gray-600" 
      aria-label="Breadcrumb"
      role="navigation"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={item.href} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight 
                size={16} 
                className="text-gray-400 mx-1 md:mx-2" 
                aria-hidden="true"
              />
            )}
            
            {index === 0 && (
              <Home 
                size={16} 
                className="mr-2 text-gray-500" 
                aria-hidden="true"
              />
            )}
            
            {item.current ? (
              <span 
                className="font-medium text-gray-900"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="inline-flex items-center font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
} 