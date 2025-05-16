'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import { fetchTopicDigestBySlug, TopicDigest, TopicArticle, generateDigestMetadata, generateSlug } from '@/app/lib/services/topicServices'
import { ChevronLeft, Clock, ArrowRight, BookOpen, Calendar, Table2, ListFilter, Grid2X2, Share2 } from 'lucide-react'
import { format } from 'date-fns'

export default function DigestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [digest, setDigest] = useState<TopicDigest | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('list')
  const [metadata, setMetadata] = useState<any>(null)
  
  // Extract category from URL params - ensure it's a string
  const categoryFromUrl = typeof params.category === 'string' ? params.category : '';

  useEffect(() => {
    async function loadDigest() {
      if (!params.slug || typeof params.slug !== 'string') return
      
      setLoading(true)
      try {
        const data = await fetchTopicDigestBySlug(params.slug)
        
        if (data) {
          // If digest exists but category in URL doesn't match the digest's category,
          // redirect to the correct URL
          if (data.category && data.category !== categoryFromUrl) {
            const slug = data.slug || generateSlug(data.title || data.category);
            const correctUrl = `/topics/${data.category}/digest/${slug}`;
            router.replace(correctUrl);
            return;
          }
          
          setDigest(data)
          
          // Generate metadata for SEO
          setMetadata(generateDigestMetadata(data))
        }
      } catch (error) {
        console.error('Error loading digest:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDigest()
  }, [params.slug, categoryFromUrl, router])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!digest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Digest not found</h1>
        <p className="text-gray-600 mb-6">The digest you're looking for doesn't exist or has been removed.</p>
        <Link 
          href={`/topics/${categoryFromUrl || 'all'}`}
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to {categoryFromUrl ? categoryFromUrl.charAt(0).toUpperCase() + categoryFromUrl.slice(1) : 'All Topics'}
        </Link>
      </div>
    )
  }
  
  // Use the category from the digest data, which should match the URL after any redirects
  const category = digest.category;
  const categoryDisplay = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
  
  const renderArticleGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {digest.articles && digest.articles.map((article: TopicArticle) => {
        // Generate SEO-friendly URL with slug
        const articleSlug = article.slug || generateSlug(article.headline || article.title || 'article');
        
        // Use the digest category as fallback if article category is missing
        const articleCategory = article.category || category || 'general';
        const articleUrl = `/topics/${articleCategory}/article/${article.id}/${articleSlug}`;
        
        return (
          <article key={article.id} className="bg-white rounded-lg border overflow-hidden h-full hover:shadow-md transition-shadow">
            {article.image_url && (
              <div className="relative h-48 w-full">
                <Image
                  src={article.image_url}
                  alt={article.headline || article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="p-5">
              <h3 className="text-lg font-bold mb-3 line-clamp-2">
                <Link href={articleUrl} className="hover:text-blue-600 transition-colors">
                  {article.headline || article.title}
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.summary || article.content.substring(0, 150) + '...'}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t">
                <span>{format(new Date(article.publication_date), 'MMMM d, yyyy')}</span>
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">{article.topic}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );

  const renderArticleList = () => (
    <div className="space-y-5 mt-6">
      {digest.articles && digest.articles.map((article: TopicArticle) => {
        // Generate SEO-friendly URL with slug
        const articleSlug = article.slug || generateSlug(article.headline || article.title || 'article');
        
        // Use the digest category as fallback if article category is missing
        const articleCategory = article.category || category || 'general';
        const articleUrl = `/topics/${articleCategory}/article/${article.id}/${articleSlug}`;
        
        return (
          <div key={article.id} className="flex bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
            {article.image_url && (
              <div className="relative h-40 w-40 flex-shrink-0">
                <Image
                  src={article.image_url}
                  alt={article.headline || article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 20vw"
                />
              </div>
            )}
            <div className="p-5 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  <Link href={articleUrl} className="hover:text-blue-600 transition-colors">
                    {article.headline || article.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {article.summary || article.content.substring(0, 200) + '...'}
                </p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-gray-500">
                  <Clock size={14} className="mr-1" />
                  <time dateTime={article.publication_date}>
                    {format(new Date(article.publication_date), 'MMMM d, yyyy')}
                  </time>
                </div>
                <Link 
                  href={articleUrl}
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Read full article
                  <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
  
  const renderArticleTable = () => (
    <div className="overflow-x-auto rounded-lg border bg-white mt-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {digest.articles && digest.articles.map((article: TopicArticle) => {
            // Generate SEO-friendly URL with slug
            const articleSlug = article.slug || generateSlug(article.headline || article.title || 'article');
            
            // Use the digest category as fallback if article category is missing
            const articleCategory = article.category || category || 'general';
            const articleUrl = `/topics/${articleCategory}/article/${article.id}/${articleSlug}`;
            
            return (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {article.headline || article.title}
                  </div>
                  {article.summary && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">{article.summary}</div>
                  )}
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
    <>
      {metadata && (
        <Head>
          <title>{metadata.title}</title>
          <meta name="description" content={metadata.description} />
          <meta name="keywords" content={metadata.keywords.join(', ')} />
          <link rel="canonical" href={metadata.canonical} />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content={metadata.openGraph.type} />
          <meta property="og:title" content={metadata.openGraph.title} />
          <meta property="og:description" content={metadata.openGraph.description} />
          <meta property="article:published_time" content={metadata.openGraph.publishedTime} />
          <meta property="article:modified_time" content={metadata.openGraph.modifiedTime} />
          
          {/* Structured Data / JSON-LD */}
          <script 
            type="application/ld+json" 
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                'headline': metadata.title,
                'description': metadata.description,
                'datePublished': digest.publication_date,
                'dateModified': digest.updated_at,
                'mainEntityOfPage': {
                  '@type': 'WebPage',
                  '@id': metadata.canonical,
                }
              })
            }}
          />
        </Head>
      )}
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href={`/topics/${category}`}
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to {categoryDisplay}
          </Link>
        </div>
        
        <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <header className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {digest.headline || digest.title}
              </h1>
              
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: digest.headline || digest.title,
                      text: digest.introduction || '',
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }} 
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                aria-label="Share"
              >
                <Share2 size={20} />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center mb-6 text-sm text-gray-500 gap-x-4 gap-y-2">
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                <time dateTime={digest.publication_date}>
                  {format(new Date(digest.publication_date), 'MMMM d, yyyy')}
                </time>
              </div>
              <div className="flex items-center">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                  {category}
                </span>
              </div>
            </div>
            
            <div className="text-lg text-gray-700 mb-4">
              <p>{digest.introduction}</p>
            </div>
          </header>
          
          {/* Main Content */}
          {digest.content && (
            <div className="p-6 prose prose-lg max-w-none">
              {digest.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
          
          {/* Articles */}
          <div className="border-t border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Articles in this Digest</h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  title="Grid view"
                >
                  <Grid2X2 size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  title="List view"
                >
                  <ListFilter size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('table')} 
                  className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  title="Table view"
                >
                  <Table2 size={18} />
                </button>
              </div>
            </div>
            
            {viewMode === 'grid' && renderArticleGrid()}
            {viewMode === 'list' && renderArticleList()}
            {viewMode === 'table' && renderArticleTable()}
          </div>
          
          {/* Conclusion */}
          {digest.conclusion && (
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <h3 className="font-bold text-xl mb-3 flex items-center">
                <BookOpen size={18} className="mr-2" />
                Key Takeaways
              </h3>
              <div className="prose prose-lg max-w-none">
                {digest.conclusion.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700">{paragraph}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* Related Topics */}
          <div className="p-6 border-t border-gray-100">
            <h3 className="font-bold mb-3">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              <Link 
                href={`/topics/${category}`}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
              >
                All {category}
              </Link>
              {digest.articles && digest.articles.slice(0, 5).map((article) => (
                <Link 
                  key={article.id}
                  href={`/topics/${category}?topic=${article.topic}`}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                >
                  {article.topic}
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>
    </>
  )
} 