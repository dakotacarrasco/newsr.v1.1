import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'
import { Calendar, MapPin, Thermometer, Wind, Droplets, Sun } from 'lucide-react'
import { supabase } from '@/app/lib/supabase/client'
import DigestViewer from '../DigestViewer'
import LocalArticles from '../components/LocalArticles'
import SubscribeModal from '../subscribe/SubscribeModal'

// City data with coordinates for enhanced local SEO
const CITY_DATA = {
  denver: { name: 'Denver', state: 'Colorado', lat: 39.7392, lng: -104.9903, timezone: 'America/Denver' },
  chicago: { name: 'Chicago', state: 'Illinois', lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago' },
  houston: { name: 'Houston', state: 'Texas', lat: 29.7604, lng: -95.3698, timezone: 'America/Chicago' },
  dallas: { name: 'Dallas', state: 'Texas', lat: 32.7767, lng: -96.7970, timezone: 'America/Chicago' },
  seattle: { name: 'Seattle', state: 'Washington', lat: 47.6062, lng: -122.3321, timezone: 'America/Los_Angeles' },
  boston: { name: 'Boston', state: 'Massachusetts', lat: 42.3601, lng: -71.0589, timezone: 'America/New_York' },
  'los-angeles': { name: 'Los Angeles', state: 'California', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
  'new-york': { name: 'New York', state: 'New York', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
  miami: { name: 'Miami', state: 'Florida', lat: 25.7617, lng: -80.1918, timezone: 'America/New_York' },
  phoenix: { name: 'Phoenix', state: 'Arizona', lat: 33.4484, lng: -112.0740, timezone: 'America/Phoenix' },
  philadelphia: { name: 'Philadelphia', state: 'Pennsylvania', lat: 39.9526, lng: -75.1652, timezone: 'America/New_York' },
  'san-antonio': { name: 'San Antonio', state: 'Texas', lat: 29.4241, lng: -98.4936, timezone: 'America/Chicago' },
  'san-diego': { name: 'San Diego', state: 'California', lat: 32.7157, lng: -117.1611, timezone: 'America/Los_Angeles' },
  'san-francisco': { name: 'San Francisco', state: 'California', lat: 37.7749, lng: -122.4194, timezone: 'America/Los_Angeles' },
  'san-jose': { name: 'San Jose', state: 'California', lat: 37.3382, lng: -121.8863, timezone: 'America/Los_Angeles' },
  austin: { name: 'Austin', state: 'Texas', lat: 30.2672, lng: -97.7431, timezone: 'America/Chicago' },
  'fort-worth': { name: 'Fort Worth', state: 'Texas', lat: 32.7555, lng: -97.3308, timezone: 'America/Chicago' },
  charlotte: { name: 'Charlotte', state: 'North Carolina', lat: 35.2271, lng: -80.8431, timezone: 'America/New_York' },
  columbus: { name: 'Columbus', state: 'Ohio', lat: 39.9612, lng: -82.9988, timezone: 'America/New_York' },
  indianapolis: { name: 'Indianapolis', state: 'Indiana', lat: 39.7684, lng: -86.1581, timezone: 'America/Indiana/Indianapolis' },
  
  // Additional cities from database
  abq: { name: 'Albuquerque', state: 'New Mexico', lat: 35.0844, lng: -106.6504, timezone: 'America/Denver' },
  birmingham: { name: 'Birmingham', state: 'Alabama', lat: 33.5186, lng: -86.8104, timezone: 'America/Chicago' },
  charleston: { name: 'Charleston', state: 'South Carolina', lat: 32.7765, lng: -79.9311, timezone: 'America/New_York' },
  des_moines: { name: 'Des Moines', state: 'Iowa', lat: 41.5868, lng: -93.6250, timezone: 'America/Chicago' },
  detroit: { name: 'Detroit', state: 'Michigan', lat: 42.3314, lng: -83.0458, timezone: 'America/New_York' },
  hartford: { name: 'Hartford', state: 'Connecticut', lat: 41.7658, lng: -72.6734, timezone: 'America/New_York' },
  kansas_city: { name: 'Kansas City', state: 'Kansas', lat: 39.0997, lng: -94.5786, timezone: 'America/Chicago' },
  las_vegas: { name: 'Las Vegas', state: 'Nevada', lat: 36.1699, lng: -115.1398, timezone: 'America/Los_Angeles' },
  louisville: { name: 'Louisville', state: 'Kentucky', lat: 38.2527, lng: -85.7585, timezone: 'America/New_York' },
  milwaukee: { name: 'Milwaukee', state: 'Wisconsin', lat: 43.0389, lng: -87.9065, timezone: 'America/Chicago' },
  minneapolis: { name: 'Minneapolis', state: 'Minnesota', lat: 44.9778, lng: -93.2650, timezone: 'America/Chicago' },
  nashville: { name: 'Nashville', state: 'Tennessee', lat: 36.1627, lng: -86.7816, timezone: 'America/Chicago' },
  oklahoma_city: { name: 'Oklahoma City', state: 'Oklahoma', lat: 35.4676, lng: -97.5164, timezone: 'America/Chicago' },
  portland: { name: 'Portland', state: 'Oregon', lat: 45.5152, lng: -122.6784, timezone: 'America/Los_Angeles' },
  richmond: { name: 'Richmond', state: 'Virginia', lat: 37.5407, lng: -77.4360, timezone: 'America/New_York' },
  salt_lake_city: { name: 'Salt Lake City', state: 'Utah', lat: 40.7608, lng: -111.8910, timezone: 'America/Denver' },
  st_louis: { name: 'St. Louis', state: 'Missouri', lat: 38.6270, lng: -90.1994, timezone: 'America/Chicago' },
  tucson: { name: 'Tucson', state: 'Arizona', lat: 32.2226, lng: -110.9747, timezone: 'America/Phoenix' }
} as const;

type CityCode = keyof typeof CITY_DATA;

interface PageProps {
  params: {
    city: string;
  };
}

// Generate metadata for each city page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cityCode = params.city.toLowerCase() as CityCode;
  const cityInfo = CITY_DATA[cityCode];
  
  if (!cityInfo) {
    return {
      title: 'City Not Found - Newsr Local News',
      description: 'The requested city page could not be found.',
    };
  }

  const { name, state } = cityInfo;
  const title = `${name} News - Local Breaking News & Updates | Newsr`;
  const description = `Stay informed with the latest local news from ${name}, ${state}. Breaking stories, weather updates, local events, and community news delivered daily.`;

  return {
    title,
    description,
    keywords: [
      `${name} news`,
      `${name} local news`,
      `${name} breaking news`,
      `${state} news`,
      `${name} weather`,
      `${name} events`,
      `local news ${name}`,
      `${name} ${state} news`,
      `${name} daily news`,
      `${name} community news`
    ].join(', '),
    authors: [{ name: 'Newsr Editorial Team' }],
    creator: 'Newsr',
    publisher: 'Newsr',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
      url: `https://newsr.vercel.app/topics/local/${cityCode}`,
      siteName: 'Newsr',
      images: [
        {
          url: '/og-local-news.jpg',
          width: 1200,
          height: 630,
          alt: `${name} Local News - Newsr`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@newsr',
      images: ['/og-local-news.jpg'],
    },
    alternates: {
      canonical: `https://newsr.vercel.app/topics/local/${cityCode}`,
    },
    other: {
      'geo.region': state,
      'geo.placename': name,
      'geo.position': `${cityInfo.lat};${cityInfo.lng}`,
      'ICBM': `${cityInfo.lat}, ${cityInfo.lng}`,
    },
  };
}

// Generate static params for known cities
export async function generateStaticParams() {
  return Object.keys(CITY_DATA).map((city) => ({
    city,
  }));
}

export default async function CityPage({ params }: PageProps) {
  const cityCode = params.city.toLowerCase() as CityCode;
  const cityInfo = CITY_DATA[cityCode];

  if (!cityInfo) {
    notFound();
  }

  const { name, state, lat, lng } = cityInfo;

  // Enhanced Schema.org structured data for local business/place
  const generateLocalSchema = () => {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Place',
          '@id': `https://newsr.vercel.app/topics/local/${cityCode}#place`,
          name: `${name}, ${state}`,
          description: `Local news coverage area for ${name}, ${state}`,
          geo: {
            '@type': 'GeoCoordinates',
            latitude: lat,
            longitude: lng,
          },
          containedInPlace: {
            '@type': 'State',
            name: state,
            containedInPlace: {
              '@type': 'Country',
              name: 'United States',
            },
          },
        },
        {
          '@type': 'NewsMediaOrganization',
          '@id': 'https://newsr.vercel.app#organization',
          name: 'Newsr',
          url: 'https://newsr.vercel.app',
          logo: {
            '@type': 'ImageObject',
            url: 'https://newsr.vercel.app/logo.png',
          },
          sameAs: [
            'https://twitter.com/newsr',
            'https://facebook.com/newsr',
          ],
          areaServed: {
            '@type': 'Place',
            name: `${name}, ${state}`,
          },
        },
        {
          '@type': 'WebPage',
          '@id': `https://newsr.vercel.app/topics/local/${cityCode}#webpage`,
          url: `https://newsr.vercel.app/topics/local/${cityCode}`,
          name: `${name} Local News - Breaking Stories & Updates`,
          description: `Latest local news from ${name}, ${state}. Stay informed with breaking stories, weather, and community updates.`,
          isPartOf: {
            '@type': 'WebSite',
            '@id': 'https://newsr.vercel.app#website',
            name: 'Newsr',
            url: 'https://newsr.vercel.app',
          },
          about: {
            '@id': `https://newsr.vercel.app/topics/local/${cityCode}#place`,
          },
          publisher: {
            '@id': 'https://newsr.vercel.app#organization',
          },
        },
      ],
    };
  };

  // Breadcrumb structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@id': 'https://newsr.vercel.app',
          name: 'Home',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@id': 'https://newsr.vercel.app/topics/local',
          name: 'Local News',
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@id': `https://newsr.vercel.app/topics/local/${cityCode}`,
          name: `${name} News`,
        },
      },
    ],
  };

  return (
    <>
      {/* Enhanced Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* City Header */}
          <header className="mb-12">
            <div className="flex items-center text-lg text-blue-600 mb-4">
              <MapPin size={20} className="mr-2" />
              <span className="font-semibold">{name}, {state}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {name} Local News
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl">
              Stay informed with the latest breaking news, weather updates, and community stories from {name}, {state}. 
              Your trusted source for local journalism and daily news digests.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
              <span>📍 Covering {name} metropolitan area</span>
              <span>🕒 Updated daily</span>
              <span>🌤️ Local weather included</span>
            </div>
          </header>

          {/* City Digest Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
              Today's {name} Digest
            </h2>
            <DigestViewer cityCode={cityCode} cityName={name} />
          </section>

          {/* Latest News Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
              Latest {name} News
            </h2>
            <LocalArticles city={name} limit={8} />
          </section>

          {/* Local Information Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
              About {name}
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                  <p className="text-gray-600 mb-4">
                    {name} is located in {state}, United States. Our local news coverage includes 
                    the greater {name} metropolitan area and surrounding communities.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Coordinates: {lat}°N, {Math.abs(lng)}°W</p>
                    <p>Timezone: {cityInfo.timezone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">News Coverage</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Breaking news and emergency alerts</li>
                    <li>• Local government and politics</li>
                    <li>• Weather and traffic updates</li>
                    <li>• Community events and activities</li>
                    <li>• Business and economic news</li>
                    <li>• Sports and entertainment</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center bg-blue-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Stay Connected with {name}
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get daily news digests, breaking news alerts, and weather updates delivered 
              straight to your inbox. Never miss what's happening in {name}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Subscribe to {name} Digest
              </button>
              <button className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                Follow on Social Media
              </button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
} 