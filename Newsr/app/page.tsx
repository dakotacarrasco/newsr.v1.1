import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, TrendingUp, MapPin, BookOpen, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

async function getArticles() {
  try {
    // Get featured articles
    const { data: featuredArticles } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(5);
    
    // Get latest articles by category
    const { data: technologyArticles } = await supabase
      .from('articles')
      .select('*')
      .eq('category', 'technology')
      .order('published_at', { ascending: false })
      .limit(3);
    
    const { data: businessArticles } = await supabase
      .from('articles')
      .select('*')
      .eq('category', 'business')
      .order('published_at', { ascending: false })
      .limit(3);
    
    const { data: politicsArticles } = await supabase
      .from('articles')
      .select('*')
      .eq('category', 'politics')
      .order('published_at', { ascending: false })
      .limit(3);
    
    // Get trending articles (most viewed)
    const { data: trendingArticles } = await supabase
      .from('articles')
      .select('*')
      .order('views', { ascending: false })
      .limit(4);
    
    // Get local digests
    const { data: cityDigests } = await supabase
      .from('city_digests')
      .select('city_code, city_name, region')
      .eq('active', true)
      .order('city_name', { ascending: true })
      .limit(6);
      
    return {
      featured: featuredArticles || [],
      technology: technologyArticles || [],
      business: businessArticles || [],
      politics: politicsArticles || [],
      trending: trendingArticles || [],
      cities: cityDigests || []
    };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return {
      featured: [],
      technology: [],
      business: [],
      politics: [],
      trending: [],
      cities: []
    };
  }
}

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default async function HomePage() {
  const {
    featured,
    technology,
    business,
    politics,
    trending,
    cities
  } = await getArticles();
  
  const mainArticle = featured[0] || null;
  const secondaryArticles = featured.slice(1, 5) || [];
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Featured Articles */}
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-12">
        <h1 className="text-4xl font-bold mb-8">Featured Stories</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main featured article */}
          {mainArticle && (
            <div className="lg:col-span-2 relative group">
              <Link href={`/articles/${mainArticle.id}`}>
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image 
                    src={mainArticle.image_url || '/placeholder.jpg'} 
                    alt={mainArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <span className="inline-block bg-blue-600 text-white px-3 py-1 text-sm font-medium mb-3">
                      {mainArticle.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 group-hover:underline">
                      {mainArticle.title}
                    </h2>
                    <p className="text-gray-200 mb-3 line-clamp-2">{mainArticle.description}</p>
                    <div className="flex items-center text-sm text-gray-300">
                      <time dateTime={mainArticle.published_at}>
                        {formatDate(mainArticle.published_at)}
                      </time>
                      {mainArticle.location_id && (
                        <div className="flex items-center ml-4">
                          <MapPin size={14} className="mr-1" />
                          <span className="capitalize">{mainArticle.location_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
          
          {/* Secondary featured articles */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
            {secondaryArticles.map((article) => (
              <Link 
                key={article.id} 
                href={`/articles/${article.id}`}
                className="group flex h-24 overflow-hidden border-b border-gray-200 pb-4"
              >
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image 
                    src={article.image_url || '/placeholder.jpg'} 
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-4 flex flex-col">
                  <span className="text-xs text-blue-600 font-medium">
                    {article.category}
                  </span>
                  <h3 className="text-md font-bold group-hover:text-blue-700 line-clamp-2">
                    {article.title}
                  </h3>
                  <time className="text-xs text-gray-500 mt-auto">
                    {formatDate(article.published_at)}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Categories</h2>
            <div className="flex space-x-2">
              <Link 
                href="/topics/technology" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                See all categories
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Technology Category */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-6 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-blue-600">Technology</h3>
                  <Link 
                    href="/topics/technology" 
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {technology.map((article) => (
                  <Link 
                    key={article.id} 
                    href={`/articles/${article.id}`}
                    className="block p-4 hover:bg-gray-50"
                  >
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {article.title}
                    </h4>
                    <time className="text-xs text-gray-500">
                      {formatDate(article.published_at)}
                    </time>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Business Category */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-6 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-green-600">Business</h3>
                  <Link 
                    href="/topics/business" 
                    className="text-sm text-gray-500 hover:text-green-600"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {business.map((article) => (
                  <Link 
                    key={article.id} 
                    href={`/articles/${article.id}`}
                    className="block p-4 hover:bg-gray-50"
                  >
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {article.title}
                    </h4>
                    <time className="text-xs text-gray-500">
                      {formatDate(article.published_at)}
                    </time>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Politics Category */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-6 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-red-600">Politics</h3>
                  <Link 
                    href="/topics/politics" 
                    className="text-sm text-gray-500 hover:text-red-600"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {politics.map((article) => (
                  <Link 
                    key={article.id} 
                    href={`/articles/${article.id}`}
                    className="block p-4 hover:bg-gray-50"
                  >
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {article.title}
                    </h4>
                    <time className="text-xs text-gray-500">
                      {formatDate(article.published_at)}
                    </time>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trending Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center mb-8">
            <TrendingUp size={24} className="text-orange-500 mr-2" />
            <h2 className="text-2xl font-bold">Trending Now</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map((article) => (
              <Link 
                key={article.id} 
                href={`/articles/${article.id}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] mb-3 overflow-hidden rounded-lg">
                  <Image 
                    src={article.image_url || '/placeholder.jpg'} 
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                    <TrendingUp size={12} className="mr-1" />
                    {article.views} views
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 line-clamp-2">
                  {article.title}
                </h3>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{article.category}</span>
                  <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Local News Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center mb-8">
            <MapPin size={24} className="text-blue-500 mr-2" />
            <h2 className="text-2xl font-bold">Local News Digests</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cities.map((city) => (
              <Link 
                key={city.city_code} 
                href={`/topics/local?location=${city.city_code}`}
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="font-bold text-lg mb-1">{city.city_name}</div>
                <div className="text-sm text-gray-600">{city.region}</div>
              </Link>
            ))}
            
            <Link 
              href="/topics/local"
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors flex flex-col items-center justify-center"
            >
              <span className="font-bold text-blue-600 mb-1">View All</span>
              <span className="text-sm text-blue-500">Locations</span>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Informed with Newsr</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Get the latest news, in-depth analysis, and exclusive stories delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/dashboard" 
              className="px-8 py-3 bg-white text-blue-700 font-bold rounded-md hover:bg-blue-50 transition-colors"
            >
              Create Account
            </Link>
            <Link 
              href="/topics" 
              className="px-8 py-3 bg-blue-700 text-white font-bold rounded-md border border-blue-500 hover:bg-blue-600 transition-colors"
            >
              Explore Topics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
