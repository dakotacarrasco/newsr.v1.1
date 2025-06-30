'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';
import { createSlugFromHeadline, extractHeadline } from '../utils/slugUtils';

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

interface CityDigestTilesProps {
  className?: string;
}

export default function CityDigestTiles({ className = '' }: CityDigestTilesProps) {
  const [digests, setDigests] = useState<CityDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCityDigests() {
      try {
        setLoading(true);
        setError(null);

        // Fetch active digests from all cities
        const { data, error } = await supabase
          .from('city_digests')
          .select('*')
          .eq('active', true)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching city digests:', error);
          throw error;
        }

        if (data) {
          // Group by city and get the latest digest for each
          const cityDigestMap = new Map<string, CityDigest>();
          
          data.forEach((digest: any) => {
            const existing = cityDigestMap.get(digest.city_code);
            if (!existing || new Date(digest.date) > new Date(existing.date)) {
              cityDigestMap.set(digest.city_code, digest);
            }
          });

          const latestDigests = Array.from(cityDigestMap.values())
            .sort((a, b) => a.city_name.localeCompare(b.city_name));

          setDigests(latestDigests);
        }
      } catch (err) {
        console.error('Failed to fetch city digests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load city digests');
      } finally {
        setLoading(false);
      }
    }

    fetchCityDigests();
  }, []);

  // Generate structured data for SEO
  const generateStructuredData = () => {
    if (digests.length === 0) return null;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Local News Digests",
      "numberOfItems": digests.length,
      "itemListElement": digests.map((digest, index) => {
        const headline = extractHeadline(digest.content) || digest.headline || `${digest.city_name} Daily Update`;
        const slug = createSlugFromHeadline(headline);
        return {
          "@type": "Article",
          "position": index + 1,
          "headline": headline,
          "datePublished": digest.date,
          "author": {
            "@type": "Organization",
            "name": "Newsr"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Newsr"
          },
          "locationCreated": {
            "@type": "Place",
            "name": `${digest.city_name}, ${digest.region}`
          },
          "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/topics/local/${slug}`
        };
      })
    };

    return (
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    );
  };

  const getCityPageUrl = (digest: CityDigest) => {
    return `/topics/local/${digest.city_code.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 ${className}`}>
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 md:p-7 lg:p-8 shadow-md animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="mt-8 flex justify-end items-end">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-500 text-lg font-medium mb-2">Error loading city digests</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (digests.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500 text-lg font-medium mb-2">No city digests available</div>
        <p className="text-gray-600">Check back later for local news updates.</p>
      </div>
    );
  }

  // Function to get tile variant based on index and content
  const getTileVariant = (index: number, headline: string) => {
    const isLong = headline.length > 70;
    const isShort = headline.length < 40;
    
    return { isLong, isShort };
  };

  // Function to get tile-specific styling with increased spacing
  const getTileStyles = (isLong: boolean, isShort: boolean) => {
    const baseStyles = `group block rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 shadow-md hover:shadow-lg backdrop-blur-sm border`;
    
    return `${baseStyles} bg-white border-gray-200 hover:border-gray-300`;
  };

  // Function to get headline typography with professional fonts and better hierarchy
  const getHeadlineStyles = (isLong: boolean, isShort: boolean) => {
    const baseStyles = "leading-tight transition-all duration-300 font-semibold text-gray-900 group-hover:text-gray-700";
    
    if (isLong) {
      return `${baseStyles} text-lg md:text-xl lg:text-2xl mb-4 line-clamp-4`;
    } else if (isShort) {
      return `${baseStyles} text-xl md:text-2xl lg:text-3xl mb-4 line-clamp-2`;
    } else {
      return `${baseStyles} text-lg md:text-xl lg:text-2xl mb-4 line-clamp-3`;
    }
  };

  return (
    <>
      {generateStructuredData()}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 ${className}`}>
        {digests.map((digest, index) => {
          const headline = extractHeadline(digest.content) || digest.headline || `${digest.city_name} Daily Update`;
          const cityPageUrl = getCityPageUrl(digest);
          const { isLong, isShort } = getTileVariant(index, headline);
          
          return (
            <Link 
              key={digest.id}
              href={cityPageUrl}
              className={getTileStyles(isLong, isShort)}
            >
              <article className="h-full relative overflow-hidden">
                <div className="p-6 md:p-7 lg:p-8 h-full flex flex-col relative z-10">
                  {/* City Header with Live indicator */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={14} className="mr-2 flex-shrink-0 text-gray-500" />
                      <span className="font-medium truncate tracking-wide">
                        {digest.city_name}, {digest.region}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="ml-2 font-semibold text-red-600 text-xs tracking-wider uppercase">
                        Live
                      </span>
                    </div>
                  </div>

                  {/* Headline with improved typography */}
                  <h2 className={getHeadlineStyles(isLong, isShort)}>
                    {headline}
                  </h2>

                  {/* Bottom section with arrow */}
                  <div className="mt-auto flex justify-end items-end">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 group-hover:bg-blue-50 transition-all duration-300">
                      <ChevronRight 
                        size={16} 
                        className="text-gray-500 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-300" 
                      />
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </>
  );
} 