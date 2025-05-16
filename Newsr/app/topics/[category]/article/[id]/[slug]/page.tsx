'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import { fetchTopicArticleById, fetchSimilarArticles, TopicArticle, generateArticleMetadata, generateSlug } from '@/app/lib/services/topicServices'
import { ChevronLeft, Clock, ExternalLink, Share2, BookOpen } from 'lucide-react'
import { format } from 'date-fns'

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<TopicArticle | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<TopicArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  // Extract category and id from URL params - ensure they are strings
  const categoryFromUrl = typeof params.category === 'string' ? params.category : '';
  const idFromUrl = typeof params.id === 'string' ? params.id : '';
  const slugFromUrl = typeof params.slug === 'string' ? params.slug : '';

  useEffect(() => {
    async function loadArticle() {
      if (!idFromUrl) {
        setError('Missing article ID in URL');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const startTime = performance.now();
        
        // Fetch article by ID
        console.log(`[ArticleDetailPage] Fetching article with ID: ${idFromUrl}`);
        const data = await fetchTopicArticleById(idFromUrl);
        const endTime = performance.now();
        
        // Debug logging
        console.log('[ArticleDetailPage] Article data:', data);
        console.log('[ArticleDetailPage] URL params:', {
          category: categoryFromUrl,
          id: idFromUrl,
          slug: slugFromUrl
        });
        
        setDebugInfo({
          articleData: data ? {
            id: data.id,
            title: data.title,
            headline: data.headline,
            category: data.category,
            topic: data.topic,
            slug: data.slug
          } : null,
          urlParams: {
            category: categoryFromUrl,
            id: idFromUrl,
            slug: slugFromUrl
          },
          fetchTime: Math.round(endTime - startTime) + 'ms',
          note: data ? 
            `Article found with ID: ${data.id}` : 
            'Article not found'
        });
        
        if (data) {
          // Generate a slug from the article title if needed
          const articleSlug = data.slug || generateSlug(data.headline || data.title || 'article');
          
          // If article exists but category in URL doesn't match the article's category,
          // redirect to the correct URL
          if (data.category && data.category !== categoryFromUrl) {
            const correctUrl = `/topics/${data.category}/article/${data.id}/${articleSlug}`;
            console.log(`[ArticleDetailPage] Redirecting to correct category: ${correctUrl}`);
            router.replace(correctUrl);
            return;
          }
          
          // If slug in URL doesn't match the article's slug, redirect to correct URL
          if (articleSlug && articleSlug !== slugFromUrl) {
            const correctUrl = `/topics/${data.category}/article/${data.id}/${articleSlug}`;
            console.log(`[ArticleDetailPage] Redirecting to correct slug: ${correctUrl}`);
            router.replace(correctUrl);
            return;
          }
          
          setArticle(data);
          
          // Generate metadata for SEO
          setMetadata(generateArticleMetadata(data));
          
          // Fetch similar articles based on topic/category
          const relatedContent = await fetchSimilarArticles(data, 3);
          setRelatedArticles(relatedContent);
        } else {
          setError(`Article with ID ${idFromUrl} not found`);
        }
      } catch (err: any) {
        console.error('[ArticleDetailPage] Error loading article:', err);
        setError(err.message || 'Error loading article');
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [idFromUrl, categoryFromUrl, slugFromUrl, router]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
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

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Debug info display */}
        {process.env.NODE_ENV !== 'production' && debugInfo && (
          <div className="bg-gray-100 p-4 mb-4 overflow-auto max-h-96">
            <details open>
              <summary className="font-mono text-sm cursor-pointer">Debug Info</summary>
              <pre className="mt-2 text-xs whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          {error && <p className="text-red-600 mb-6">{error}</p>}
          <p className="text-gray-600 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          
          <div className="flex flex-col gap-4 items-center">
            <Link 
              href={`/topics/${categoryFromUrl || 'all'}`}
              className="inline-flex items-center text-blue-600 hover:underline"
            >
              <ChevronLeft size={16} className="mr-1" />
              Back to {categoryFromUrl ? categoryFromUrl.charAt(0).toUpperCase() + categoryFromUrl.slice(1) : 'All Topics'}
            </Link>
            
            <Link 
              href="/debug/article-lookup"
              className="inline-flex items-center text-blue-600 hover:underline"
            >
              <BookOpen size={16} className="mr-1" />
              Open Article Debugger
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Use the category from the article data, which should match the URL after any redirects
  const category = article.category;
  const categoryDisplay = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';

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
          {metadata.openGraph.tags.map((tag: string, i: number) => (
            <meta key={i} property="article:tag" content={tag} />
          ))}
          
          {/* Structured Data / JSON-LD */}
          <script 
            type="application/ld+json" 
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'NewsArticle',
                'headline': metadata.title,
                'description': metadata.description,
                'datePublished': article.publication_date,
                'dateModified': article.updated_at,
                'mainEntityOfPage': {
                  '@type': 'WebPage',
                  '@id': metadata.canonical,
                },
                'keywords': metadata.keywords.join(', '),
                'articleSection': category,
                'isAccessibleForFree': 'True'
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
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <article className="lg:col-span-8">
            <header className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {article.headline || article.title}
              </h1>
              {article.summary && (
                <p className="text-xl text-gray-600 mb-4">
                  {article.summary}
                </p>
              )}
              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  <time dateTime={article.publication_date}>
                    {format(new Date(article.publication_date), 'MMMM d, yyyy')}
                  </time>
                </div>
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {article.topic}
                  </span>
                </div>
              </div>
            </header>
            
            {article.image_url && (
              <div className="mb-8 relative aspect-video w-full rounded-lg overflow-hidden">
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
                {article.image_prompt && (
                  <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2">
                    Prompt: {article.image_prompt}
                  </div>
                )}
              </div>
            )}
            
            <div className="prose prose-lg max-w-none">
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            {article.source_url && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <Link 
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline"
                >
                  Read original content
                  <ExternalLink size={14} className="ml-1" />
                </Link>
              </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">
                  Category: 
                  <Link 
                    href={`/topics/${category}`}
                    className="ml-1 text-blue-600 hover:underline"
                  >
                    {categoryDisplay}
                  </Link>
                </span>
              </div>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: article.headline || article.title,
                      text: article.summary || '',
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }} 
                className="inline-flex items-center text-gray-600 hover:text-blue-600"
              >
                <Share2 size={18} className="mr-1" />
                Share
              </button>
            </div>
          </article>
          
          <aside className="lg:col-span-4">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Related Articles</h2>
              
              {relatedArticles.length === 0 ? (
                <p className="text-gray-600 text-sm">No related articles found.</p>
              ) : (
                <div className="space-y-4">
                  {relatedArticles.map((relatedArticle) => {
                    // Create SEO-optimized URL with the correct category
                    const relatedArticleSlug = relatedArticle.slug || generateSlug(relatedArticle.headline || relatedArticle.title || 'article');
                    const relatedArticleUrl = `/topics/${relatedArticle.category}/article/${relatedArticle.id}/${relatedArticleSlug}`;
                    
                    return (
                      <Link 
                        key={relatedArticle.id} 
                        href={relatedArticleUrl}
                        className="block"
                      >
                        <div className="group">
                          {relatedArticle.image_url && (
                            <div className="relative h-32 w-full mb-2 rounded overflow-hidden">
                              <Image
                                src={relatedArticle.image_url}
                                alt={relatedArticle.headline || relatedArticle.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              />
                            </div>
                          )}
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {relatedArticle.headline || relatedArticle.title}
                          </h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {relatedArticle.topic}
                            </span>
                            <p className="text-sm text-gray-500">
                              {format(new Date(relatedArticle.publication_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              
              {/* Topic Explorer */}
              <div className="mt-8 pt-4 border-t border-gray-100">
                <h3 className="font-bold mb-3">Explore {category}</h3>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href={`/topics/${category}`}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                  >
                    All {category}
                  </Link>
                  <Link 
                    href={`/topics/${category}?topic=${article.topic}`}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                  >
                    {article.topic}
                  </Link>
                  <Link 
                    href={`/topics/${category}/digest`}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200"
                  >
                    Latest Digest
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
} 