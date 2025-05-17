'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/app/lib/supabase/client';
import { LocalArticle } from '@/app/lib/services/localServices';

// Extend the article to include the ID from params
interface ArticleWithParams extends LocalArticle {
  id: string;
}

export default function ArticleDetail({ params }: { params: { id: string, slug: string } }) {
  const [article, setArticle] = useState<ArticleWithParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Clean content - remove headers and special sections
          let cleanedContent = data.content || '';
          cleanedContent = cleanedContent
            .replace(/\*\*Summary:?\*\*.*?(\n\n|\n|$)/g, '')
            .replace(/\*\*Conclusion:?\*\*.*?(\n\n|\n|$)/g, '')
            .replace(/\*\*[A-Z\s]+\([A-Z]+\)\*\*\s—/g, '')
            .replace(/\*\*.*?\*\*/g, '') // Remove anything in double asterisks
            .replace(/news\s*\n/g, '')
            .replace(/Read original article/g, '');

          // Format the article data with cleaned title
          const cleanedTitle = data.title ? data.title.replace(/\*\*.*?\*\*/g, '') : '';
          
          setArticle({
            id: data.id,
            title: cleanedTitle,
            content: cleanedContent,
            summary: data.description,
            description: data.description,
            publication_date: data.published_at,
            published_at: data.published_at,
            image_url: data.image_url,
            topic: data.topic || data.category || 'Local',
            category: data.category && data.category.toLowerCase() !== 'news' ? data.category : null,
            source: data.source,
            source_name: data.source,
            author: data.author_id,
            url: data.url,
            city: data.city,
            state: data.state
          });
        } else {
          setError('Article not found');
        }
      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  // Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date available';
    
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200"></div>
            <div className="h-4 bg-gray-200"></div>
            <div className="h-4 bg-gray-200"></div>
            <div className="h-4 bg-gray-200 w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error || 'Article not found'}</p>
          <Link href="/topics/local" className="text-blue-600 flex items-center justify-center mt-4">
            <ChevronLeft size={16} />
            <span>Back to Local News</span>
          </Link>
        </div>
      </div>
    );
  }

  // Ensure the image URL is properly formatted
  const hasImage = Boolean(article.image_url);
  const imageUrl = article.image_url && article.image_url.startsWith('http') 
    ? article.image_url 
    : article.image_url 
      ? `/${article.image_url.replace(/^\//, '')}`
      : '/images/placeholder.jpg';

  // Clean up and format article content for display
  const formatContent = (content: string) => {
    if (!content) return '';
    
    // One final pass to remove any remaining double asterisks (in case cleaning missed some)
    const cleaned = content.replace(/\*\*.*?\*\*/g, '');
    
    // Replace newlines with <br> tags for HTML display
    return cleaned
      .replace(/\n/g, '<br>')
      // Make paragraph breaks cleaner
      .replace(/<br><br>/g, '</p><p>')
      // Ensure there are proper paragraph tags
      .replace(/^(.+?)(?=<\/p>|$)/, '<p>$1</p>');
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link 
        href={`/topics/local?location=${article.city?.toLowerCase() || ''}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ChevronLeft size={16} className="mr-1" />
        <span>Back to {article.city || 'Local'} News</span>
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{article.title ? article.title.replace(/\*\*.*?\*\*/g, '') : ''}</h1>
          
          <div className="flex flex-wrap items-center text-sm text-gray-600 gap-x-6 gap-y-2 mb-4">
            {article.published_at && (
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                <time dateTime={article.published_at}>
                  {formatDate(article.published_at)}
                </time>
              </div>
            )}
            
            {article.author && (
              <div className="flex items-center">
                <User size={14} className="mr-1" />
                <span>{article.author}</span>
              </div>
            )}
            
            {article.city && (
              <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                <span>{article.city}{article.state ? `, ${article.state}` : ''}</span>
              </div>
            )}
          </div>
          
          {hasImage && (
            <div className="relative h-[400px] mb-6">
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                className="object-cover rounded"
              />
              {article.category && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 text-sm rounded">
                  {article.category}
                </div>
              )}
            </div>
          )}
          
          {!hasImage && article.category && (
            <div className="bg-gray-100 p-3 inline-block mb-6 rounded">
              <span className="text-gray-700">{article.category}</span>
            </div>
          )}
        </header>
        
        <div className="prose prose-lg max-w-none">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: formatContent(article.content) }} />
          ) : (
            <p className="text-gray-500 italic">No content available for this article.</p>
          )}
        </div>
      </article>
    </main>
  );
} 