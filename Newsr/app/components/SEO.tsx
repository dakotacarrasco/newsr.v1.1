import { Metadata } from 'next'
import { siteConfig } from '@/config/site'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  noIndex?: boolean
  noFollow?: boolean
  canonicalUrl?: string
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  noIndex = false,
  noFollow = false,
  canonicalUrl,
}: SEOProps): Metadata {
  const seoTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const seoDescription = description || siteConfig.description
  const seoImage = image || siteConfig.ogImage
  const seoUrl = url || siteConfig.url
  const canonical = canonicalUrl || seoUrl

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ')

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    robots: robotsContent,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      type: type as any,
      title: seoTitle,
      description: seoDescription,
      images: [seoImage],
      url: seoUrl,
      siteName: siteConfig.name,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        section,
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [seoImage],
      site: '@newsr',
      creator: '@newsr',
    },
    other: {
      'application-name': siteConfig.name,
      'apple-mobile-web-app-title': siteConfig.name,
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#1d4ed8',
      'msapplication-tap-highlight': 'no',
      'theme-color': '#1d4ed8',
    },
  }
}

// Component for structured data (since it needs to be in the DOM)
export function StructuredData({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  keywords = [],
  tags = [],
}: SEOProps) {
  const seoTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const seoDescription = description || siteConfig.description
  const seoImage = image || siteConfig.ogImage
  const seoUrl = url || siteConfig.url

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'NewsArticle' : 'WebSite',
    name: seoTitle,
    description: seoDescription,
    image: seoImage,
    url: seoUrl,
    ...(type === 'article' && {
      headline: title,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      author: {
        '@type': 'Person',
        name: author || siteConfig.name,
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.url}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': seoUrl,
      },
      articleSection: section,
      keywords: [...keywords, ...tags].join(', '),
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

// Specialized SEO metadata generators
export function generateArticleMetadata({
  title,
  description,
  content,
  image,
  url,
  publishedTime,
  modifiedTime,
  author,
  category,
  tags = [],
}: {
  title: string
  description: string
  content: string
  image?: string
  url: string
  publishedTime: string
  modifiedTime?: string
  author: string
  category: string
  tags?: string[]
}): Metadata {
  // Extract keywords from content
  const keywords = extractKeywords(content, 10)

  return generateSEOMetadata({
    title,
    description,
    keywords,
    image,
    url,
    type: 'article',
    publishedTime,
    modifiedTime,
    author,
    section: category,
    tags,
  })
}

export function generateCategoryMetadata({
  category,
  description,
  image,
  url,
}: {
  category: string
  description?: string
  image?: string
  url: string
}): Metadata {
  const title = `${category.charAt(0).toUpperCase() + category.slice(1)} News`
  const seoDescription = description || `Latest ${category} news and updates from ${siteConfig.name}`

  return generateSEOMetadata({
    title,
    description: seoDescription,
    keywords: [category, 'news', 'updates', 'latest'],
    image,
    url,
    type: 'website',
  })
}

// Helper function to extract keywords from content
function extractKeywords(content: string, maxKeywords: number = 10): string[] {
  // Remove HTML tags and normalize text
  const cleanContent = content
    .replace(/<[^>]*>/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')

  // Split into words and filter out common words
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
    'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs'
  ])

  const words = cleanContent
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))

  // Count word frequency
  const wordCounts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Sort by frequency and return top keywords
  return Object.entries(wordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word)
} 