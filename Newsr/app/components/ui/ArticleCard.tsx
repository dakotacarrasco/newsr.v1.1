import { FC } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import { Article } from '@/app/lib/supabase'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'featured' | 'compact'
  className?: string
}

export const ArticleCard: FC<ArticleCardProps> = ({ 
  article, 
  variant = 'default',
  className = ''
}) => {
  return (
    <article className={`border-2 border-black bg-white relative hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${className}`}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={article.image_url || '/placeholder.jpg'}
          alt={article.title}
          fill
          className="object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>

      <div className="p-6">
        {/* Category */}
        <span className="text-sm font-bold px-2 py-1 bg-gray-100 border border-gray-200 rounded">
          {article.category}
        </span>

        {/* Title */}
        <Link href={`/articles/${article.slug || article.id}`}>
          <h3 className="text-xl font-bold mt-3 mb-2 hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
        </Link>

        {/* Description */}
        {article.description && variant !== 'compact' && (
          <p className="text-gray-600 mb-4 line-clamp-2">{article.description}</p>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>5 min read</span>
          </div>
          <Link 
            href={`/articles/${article.slug || article.id}`}
            className="flex items-center text-black hover:text-blue-600 transition-colors"
          >
            Read more
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </article>
  )
}
