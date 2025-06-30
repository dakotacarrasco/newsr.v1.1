import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { extractHeadline, createSlugFromHeadline } from '../utils/slugUtils'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    // Create server-side supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Fetch digest data to generate metadata
    const { data } = await supabase
      .from('city_digests')
      .select('*')
      .eq('active', true)
      .order('date', { ascending: false });

    if (data) {
      // Find the digest matching the slug
      const matchingDigest = data.find((digest: any) => {
        const headline = extractHeadline(digest.content) || digest.headline || `${digest.city_name} Daily Update`;
        const digestSlug = createSlugFromHeadline(headline);
        return digestSlug === params.slug;
      });

      if (matchingDigest) {
        const headline = extractHeadline(matchingDigest.content) || matchingDigest.headline || `${matchingDigest.city_name} Daily Update`;
        const description = `Local news digest for ${matchingDigest.city_name}, ${matchingDigest.region}. Stay informed with the latest local headlines, breaking news, and community updates.`;
        
        return {
          title: `${headline} | ${matchingDigest.city_name} Local News`,
          description,
          keywords: `${matchingDigest.city_name} news, local news, ${matchingDigest.region} news, daily digest, breaking news, community news`,
          openGraph: {
            title: headline,
            description,
            type: 'article',
            publishedTime: matchingDigest.date,
            authors: ['Newsr'],
            locale: 'en_US',
          },
          twitter: {
            card: 'summary_large_image',
            title: headline,
            description,
          },
          alternates: {
            canonical: `/topics/local/${params.slug}`,
          },
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  // Fallback metadata
  return {
    title: 'Local News Digest | Newsr',
    description: 'Stay informed with local news digests from cities across America.',
  };
}

export default function DigestSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 