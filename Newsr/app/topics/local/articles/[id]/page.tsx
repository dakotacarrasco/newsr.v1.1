'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase/client';

// Generate a URL-friendly slug from the title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();
};

export default function ArticleRedirect({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    async function fetchArticleAndRedirect() {
      try {
        // Get the article title
        const { data, error } = await supabase
          .from('articles')
          .select('title')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('Error fetching article for redirect:', error);
          return;
        }

        if (data?.title) {
          // Clean the title and generate slug
          const cleanedTitle = data.title.replace(/\*\*.*?\*\*/g, '');
          const slug = generateSlug(cleanedTitle);
          router.replace(`/topics/local/articles/${params.id}/${slug}`);
        }
      } catch (err) {
        console.error('Failed to redirect to slugged URL:', err);
      }
    }

    fetchArticleAndRedirect();
  }, [params.id, router]);

  // Show a minimal loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-gray-400">Loading article...</div>
    </div>
  );
} 