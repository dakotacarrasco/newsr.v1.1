'use client'

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ArrowLeft, Bell } from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';
import ReactMarkdown from 'react-markdown';
import SubscribeModal from '../../subscribe/SubscribeModal';
import { createSlugFromHeadline, extractHeadline } from '../../utils/slugUtils';

interface CityDigest {
  id: string;
  city_code: string;
  city_name: string;
  region: string;
  date: string;
  headline: string;
  content: string;
  active: boolean;
}

interface DigestPageProps {
  params: {
    city: string;
    slug: string;
  };
}

export default function DigestPage({ params }: DigestPageProps) {
  const [digest, setDigest] = useState<CityDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  useEffect(() => {
    async function fetchDigestBySlug() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all active digests to find the one matching the slug
        const { data, error } = await supabase
          .from('city_digests')
          .select('*')
          .eq('active', true)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching digests:', error);
          throw error;
        }

        if (data) {
          // Find the digest whose headline slug matches the URL slug
          const matchingDigest = data.find((digest: any) => {
            const headline = extractHeadline(digest.content) || digest.headline || `${digest.city_name} Daily Update`;
            const digestSlug = createSlugFromHeadline(headline);
            return digestSlug === params.slug && digest.city_code.toLowerCase() === params.city.toLowerCase();
          });

          if (matchingDigest) {
            setDigest(matchingDigest);
          } else {
            // If no exact match, try to find by city name in slug
            const cityMatch = data.find((digest: any) => {
              const citySlug = createSlugFromHeadline(digest.city_name);
              return params.slug.includes(citySlug) && digest.city_code.toLowerCase() === params.city.toLowerCase();
            });
            
            if (cityMatch) {
              setDigest(cityMatch);
            } else {
              setError('Story not found');
            }
          }
        } else {
          setError('No digests available');
        }
      } catch (err) {
        console.error('Failed to fetch digest:', err);
        setError(err instanceof Error ? err.message : 'Failed to load story');
      } finally {
        setLoading(false);
      }
    }

    fetchDigestBySlug();
  }, [params.slug, params.city]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="h-5 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex justify-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !digest) {
    return notFound();
  }

  const headline = extractHeadline(digest.content) || digest.headline || `${digest.city_name} Daily Update`;
  
  // Clean content by removing the headline
  let cleanedContent = digest.content.replace(/^\*\*\[(.*?)\]\*\*/, '').trim();
  
  // Format section headers
  cleanedContent = cleanedContent.replace(/^([A-Z][A-Z\s&]+):/gm, '## $1');
  
  // Bold the greeting line
  cleanedContent = cleanedContent.replace(/(Good morning.*?!)/, '**$1**');
  
  // Format lists
  cleanedContent = cleanedContent.replace(/^(\* )/gm, '- ');

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            href={`/topics/local/${params.city}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to {digest.city_name} News
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center text-lg text-gray-700 mb-6">
            <MapPin size={18} className="mr-2" />
            <span className="font-semibold">{digest.city_name}, {digest.region}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
            {headline}
          </h1>

          <div className="flex justify-center py-4 border-t border-b border-gray-200">
            <button 
              onClick={() => setIsSubscribeModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Bell size={16} className="mr-2" />
              Subscribe to {digest.city_name}
            </button>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <ReactMarkdown 
            components={{
              h2: ({node, ...props}) => (
                <h2 className="text-2xl font-bold text-blue-800 mt-8 mb-4" {...props} />
              ),
              h3: ({node, ...props}) => (
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3" {...props} />
              ),
              a: ({node, ...props}) => (
                <a className="text-blue-600 hover:text-blue-700 hover:underline" {...props} />
              ),
              ul: ({node, ...props}) => (
                <ul className="list-disc list-inside my-4 space-y-2" {...props} />
              ),
              ol: ({node, ...props}) => (
                <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
              ),
              p: ({node, ...props}) => (
                <p className="mb-4 leading-relaxed text-gray-800" {...props} />
              ),
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-4 border-blue-200 pl-4 italic my-4" {...props} />
              ),
            }}
          >
            {cleanedContent}
          </ReactMarkdown>
        </article>

        {/* Call to Action */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Stay Updated with {digest.city_name} News
            </h3>
            <p className="text-gray-600 mb-4">
              Get daily local news digests delivered to your inbox
            </p>
            <button
              onClick={() => setIsSubscribeModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Link 
              href={`/topics/local/${params.city}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              More from {digest.city_name} →
            </Link>
            <Link 
              href="/topics/local"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Cities →
            </Link>
          </div>
        </div>
      </main>

      {/* Subscribe Modal */}
      <SubscribeModal 
        isOpen={isSubscribeModalOpen} 
        onClose={() => setIsSubscribeModalOpen(false)}
        cityName={digest.city_name}
        stateName={digest.region}
        cityCode={digest.city_code}
      />
    </>
  );
} 