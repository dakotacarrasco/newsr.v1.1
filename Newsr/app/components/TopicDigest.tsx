'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Clock, ArrowRight, ListFilter, Table2, Grid2X2, ExternalLink } from 'lucide-react'
import { fetchTopicDigest, TopicDigest as TopicDigestType, TopicArticle, generateSlug } from '@/app/lib/services/topicServices'
import { format } from 'date-fns'

interface TopicDigestProps {
  category: string
}

export const TopicDigest = function TopicDigestComponent({ category }: TopicDigestProps) {
  const [digest, setDigest] = useState<TopicDigestType | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid')
  const [isContentExpanded, setIsContentExpanded] = useState(false)

  useEffect(() => {
    async function loadDigest() {
      setLoading(true)
      try {
        const data = await fetchTopicDigest(category)
        setDigest(data)
      } catch (error) {
        console.error(`Error loading ${category} digest:`, error)
      } finally {
        setLoading(false)
      }
    }

    loadDigest()
  }, [category])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (!digest) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 text-center">
        <h2 className="text-xl font-bold mb-2">No digest available</h2>
        <p className="text-gray-600">
          We're currently preparing the latest {category} digest. Please check back soon.
        </p>
      </div>
    )
  }

  // Only generate the slug when needed for the link
  const getDigestUrl = () => {
    const slug = digest.slug || generateSlug(digest.title || digest.category);
    return `/topics/${digest.category}/digest/${slug || digest.id}`;
  };
  
  // Format content for display
  const formatContent = () => {
    if (!digest.content) return null;
    
    const paragraphs = digest.content.split('\n\n');
    const displayParagraphs = isContentExpanded ? paragraphs : paragraphs.slice(0, 2);
    
    return (
      <div className="prose prose-lg max-w-none">
        {displayParagraphs.map((paragraph, index) => (
          <p key={index} className="text-gray-700">{paragraph}</p>
        ))}
        {!isContentExpanded && paragraphs.length > 2 && (
          <div className="text-center mt-4 mb-2">
            <button 
              onClick={() => setIsContentExpanded(true)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
            >
              <span>Read more</span>
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    );
  };
  
  const renderArticleGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {digest.articles && digest.articles.map((article: TopicArticle) => {
        // Generate article slug if it doesn't exist
        const articleSlug = article.slug || generateSlug(article.headline || article.title || 'article');
        
        // Debug the article category before creating URL
        console.log(`Article ${article.id} - Category: ${article.category || 'undefined'}, Title: ${article.title}`);
        
        // Use the digest category as fallback if article category is missing
        const articleCategory = article.category || digest.category || 'general';
        const articleUrl = `/topics/${articleCategory}/article/${article.id}/${articleSlug}`;
        
        return (
          <article key={article.id} className="bg-white border rounded-lg overflow-hidden h-full hover:shadow-sm transition-shadow">
            {article.image_url && (
              <div className="relative h-40 w-full">
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2 line-clamp-2">
                <Link href={articleUrl} className="hover:text-blue-600 transition-colors">
                  {article.headline || article.title}
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {article.summary || article.content.substring(0, 100) + '...'}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>{format(new Date(article.publication_date), 'MMM d, yyyy')}</span>
                <span>{article.topic}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );

  const renderArticleList = () => (
    <div className="space-y-4">
      {digest.articles && digest.articles.map((article: TopicArticle) => {
        // Generate article slug if it doesn't exist
        const articleSlug = article.slug || generateSlug(article.headline || article.title || 'article');
        
        // Use the digest category as fallback if article category is missing
        const articleCategory = article.category || digest.category || 'general';
        const articleUrl = `/topics/${articleCategory}/article/${article.id}/${articleSlug}`;
        
        return (
          <div key={article.id} className="flex border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
            {article.image_url && (
              <div className="relative h-32 w-32 flex-shrink-0">
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-lg font-bold mb-1 line-clamp-1">
                  <Link href={articleUrl} className="hover:text-blue-600 transition-colors">
                    {article.headline || article.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {article.summary || article.content.substring(0, 100) + '...'}
                </p>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                <div className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  <span>{format(new Date(article.publication_date), 'MMM d, yyyy')}</span>
                </div>
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">{article.topic}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
  
  const renderArticleTable = () => (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {digest.articles && digest.articles.map((article: TopicArticle) => {
            // Generate article slug if it doesn't exist
            const articleSlug = article.slug || generateSlug(article.headline || article.title || 'article');
            
            // Use the digest category as fallback if article category is missing
            const articleCategory = article.category || digest.category || 'general';
            const articleUrl = `/topics/${articleCategory}/article/${article.id}/${articleSlug}`;
            
            return (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                    {article.headline || article.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {article.topic}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(article.publication_date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    href={articleUrl}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Read
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
      {/* Digest Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">{digest.headline || digest.title}</h2>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock size={14} className="mr-1" />
            <span>{format(new Date(digest.publication_date), 'MMMM d, yyyy')}</span>
          </div>
        </div>
        
        <div className="text-gray-600 mb-4">{digest.introduction}</div>
        
        {/* Digest Content */}
        {digest.content && (
          <div className="my-6">
            {formatContent()}
          </div>
        )}
      </div>
      
      {/* Articles Section */}
      <div className="px-6 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Articles</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              title="Grid view"
            >
              <Grid2X2 size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              title="List view"
            >
              <ListFilter size={16} />
            </button>
            <button 
              onClick={() => setViewMode('table')} 
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              title="Table view"
            >
              <Table2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="pb-6">
          {viewMode === 'grid' && renderArticleGrid()}
          {viewMode === 'list' && renderArticleList()}
          {viewMode === 'table' && renderArticleTable()}
        </div>
      </div>
      
      {/* Conclusion */}
      {digest.conclusion && (
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <h3 className="font-bold text-lg mb-2 flex items-center">
            <BookOpen size={18} className="mr-2" />
            Key Takeaways
          </h3>
          <p className="text-gray-600">{digest.conclusion}</p>
        </div>
      )}
      
      {/* View Full Digest Link */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
        <Link 
          href={getDigestUrl()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
        >
          View full digest
          <ExternalLink size={14} className="ml-1" />
        </Link>
      </div>
    </div>
  )
}

export default TopicDigest; 