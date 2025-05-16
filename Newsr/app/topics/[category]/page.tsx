'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import { TopicDigest as TopicDigestComponent } from '@/app/components/TopicDigest'
import { 
  fetchTopicDigest, 
  fetchRecentArticlesByTopic, 
  TopicArticle,
  TopicDigest,
  generateSlug
} from '@/app/lib/services/topicServices'
import { 
  Calendar, 
  Clock, 
  Filter, 
  BookOpen,
  ArrowRight,
  Grid2X2,
  ListFilter 
} from 'lucide-react'
import { format } from 'date-fns'

export default function TopicCategoryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const category = params.category as string
  const topicFilter = searchParams.get('topic')
  
  const [articles, setArticles] = useState<TopicArticle[]>([])
  const [digest, setDigest] = useState<TopicDigest | null>(null)
  const [topics, setTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Format for display
  const categoryDisplay = category ? category.charAt(0).toUpperCase() + category.slice(1) : ''
  
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Fetch the latest digest
        const digestData = await fetchTopicDigest(category)
        setDigest(digestData)
        
        // Fetch articles - if topic filter present, filter by topic
        const articlesData = await fetchRecentArticlesByTopic(category, topicFilter || undefined, 9)
        setArticles(articlesData)
        
        // Extract unique topics from articles for the filter
        const uniqueTopics = Array.from(
          new Set(articlesData.map(article => article.topic))
        ).filter(Boolean)
        
        setTopics(uniqueTopics)
      } catch (error) {
        console.error(`Error loading data for ${category}:`, error)
      } finally {
        setLoading(false)
      }
    }
    
    if (category) {
      loadData()
    }
  }, [category, topicFilter])
  
  // Generate page metadata for SEO
  const pageMetadata = {
    title: topicFilter 
      ? `${topicFilter} - ${categoryDisplay} News & Updates` 
      : `${categoryDisplay} - Latest News, Articles & Updates`,
    description: `Discover the latest ${category} news, articles, and insights${topicFilter ? ` about ${topicFilter}` : ''}. Stay informed with our comprehensive coverage and expert analysis.`,
  }
  
  // Generate banner image based on category
  const getBannerImage = () => {
    switch(category) {
      case 'technology': return '/tech-banner.jpg';
      case 'business': return '/business-banner.jpg';
      case 'politics': return '/politics-banner.jpg';
      case 'culture': return '/culture-banner.jpg';
      case 'science': return '/science-banner.jpg';
      case 'health': return '/health-banner.jpg';
      case 'environment': return '/environment-banner.jpg';
      default: return '/news-banner.jpg';
    }
  }
  
  const renderArticleGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => {
        // Generate SEO-friendly URL with slug
        const articleSlug = article.slug || generateSlug(article.headline || article.title || 'article');
        
        // Use the URL category as fallback if article category is missing
        const articleCategory = article.category || category || 'general';
        const articleUrl = `/topics/${articleCategory}/article/${article.id}/${articleSlug}`;
        
        return (
          <article 
            key={article.id} 
            className="bg-white rounded-lg border overflow-hidden h-full hover:shadow-md transition-shadow"
          >
            {article.image_url && (
              <div className="relative h-48 w-full">
                <Image
                  src={article.image_url}
                  alt={article.headline || article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-0 left-0 bg-blue-600 text-white px-2 py-1 text-xs">
                  {article.topic}
                </div>
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
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  <time dateTime={article.publication_date}>
                    {format(new Date(article.publication_date), 'MMM d, yyyy')}
                  </time>
                </div>
                {!topicFilter && (
                  <Link 
                    href={`/topics/${category}?topic=${article.topic}`}
                    className="hover:underline hover:text-blue-600"
                  >
                    {article.topic}
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
  
  const renderArticleList = () => (
    <div className="space-y-5">
      {articles.map((article) => {
        // Generate SEO-friendly URL with slug
        const articleSlug = article.slug || generateSlug(article.headline || article.title || 'article');
        
        // Use the URL category as fallback if article category is missing
        const articleCategory = article.category || category || 'general';
        const articleUrl = `/topics/${articleCategory}/article/${article.id}/${articleSlug}`;
        
        return (
          <div key={article.id} className="flex bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
            {article.image_url && (
              <div className="relative h-40 w-40 md:w-64 flex-shrink-0">
                <Image
                  src={article.image_url}
                  alt={article.headline || article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 20vw"
                />
                <div className="absolute top-0 left-0 bg-blue-600 text-white px-2 py-1 text-xs">
                  {article.topic}
                </div>
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
                  <Calendar size={14} className="mr-1" />
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

  return (
    <>
      <Head>
        <title>{pageMetadata.title}</title>
        <meta name="description" content={pageMetadata.description} />
        <meta name="keywords" content={`${category}, news, articles, ${topics.join(', ')}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageMetadata.title} />
        <meta property="og:description" content={pageMetadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://newsr.com/topics/${category}${topicFilter ? `?topic=${topicFilter}` : ''}`} />
        
        {/* Structured Data / JSON-LD */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              'name': pageMetadata.title,
              'description': pageMetadata.description,
              'url': `https://newsr.com/topics/${category}${topicFilter ? `?topic=${topicFilter}` : ''}`,
              'isPartOf': {
                '@type': 'WebSite',
                'name': 'Newsr',
                'url': 'https://newsr.com'
              }
            })
          }}
        />
      </Head>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
            <Image 
              src={getBannerImage()} 
              alt={`${categoryDisplay} Banner`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {topicFilter ? `${topicFilter} - ${categoryDisplay}` : categoryDisplay}
              </h1>
              <p className="text-white/90 max-w-md">
                {topicFilter 
                  ? `Articles and insights about ${topicFilter} in the ${category} category.` 
                  : `Explore the latest ${category} news, articles, and insights.`
                }
              </p>
            </div>
          </div>
        </section>
        
        {/* Topic Filters */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center mr-2">
              <Filter size={16} className="mr-1" />
              <span className="text-sm font-medium">Filter by topic:</span>
            </div>
            
            <Link 
              href={`/topics/${category}`}
              className={`px-3 py-1 text-sm rounded-full ${
                !topicFilter 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              All
            </Link>
            
            {topics.map((topic) => (
              <Link 
                key={topic}
                href={`/topics/${category}?topic=${topic}`}
                className={`px-3 py-1 text-sm rounded-full ${
                  topicFilter === topic 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {topic}
              </Link>
            ))}
          </div>
        </section>
        
        {/* Topic Digest */}
        {!topicFilter && digest && (
          <TopicDigestComponent category={category} />
        )}
        
        {/* Articles Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {topicFilter ? `${topicFilter} Articles` : `Latest ${categoryDisplay} Articles`}
            </h2>
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
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 mb-3"></div>
                    <div className="h-4 bg-gray-200 mb-2"></div>
                    <div className="h-4 bg-gray-200 w-5/6 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 w-1/4"></div>
                      <div className="h-3 bg-gray-200 w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="py-10 text-center bg-white border rounded-lg">
              <BookOpen size={40} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">No articles found</h3>
              <p className="text-gray-600">
                {topicFilter 
                  ? `No articles about ${topicFilter} found in the ${category} category.` 
                  : `No articles found in the ${category} category.`
                }
              </p>
              {topicFilter && (
                <Link 
                  href={`/topics/${category}`} 
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View all {categoryDisplay} articles
                </Link>
              )}
            </div>
          ) : (
            viewMode === 'grid' ? renderArticleGrid() : renderArticleList()
          )}
          
          {/* Load More Button (could implement pagination here) */}
          {articles.length > 0 && articles.length % 9 === 0 && (
            <div className="text-center mt-8">
              <button className="px-6 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Load more
              </button>
            </div>
          )}
        </section>
        
        {/* Additional Resources */}
        <section className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href={`/topics/${category}/digest`}
              className="p-4 bg-white rounded border border-gray-200 hover:shadow-md transition-shadow"
            >
              <BookOpen size={24} className="mb-2 text-blue-600" />
              <h3 className="font-bold">Latest Digest</h3>
              <p className="text-sm text-gray-600">Get a comprehensive overview of recent developments</p>
            </Link>
            
            <Link 
              href={`/search?q=${category}`}
              className="p-4 bg-white rounded border border-gray-200 hover:shadow-md transition-shadow"
            >
              <BookOpen size={24} className="mb-2 text-green-600" />
              <h3 className="font-bold">Search Archive</h3>
              <p className="text-sm text-gray-600">Find past articles and research on this topic</p>
            </Link>
            
            <Link 
              href="/dashboard"
              className="p-4 bg-white rounded border border-gray-200 hover:shadow-md transition-shadow"
            >
              <BookOpen size={24} className="mb-2 text-purple-600" />
              <h3 className="font-bold">Customize Feed</h3>
              <p className="text-sm text-gray-600">Create a personalized news experience</p>
            </Link>
          </div>
        </section>
      </main>
    </>
  )
} 