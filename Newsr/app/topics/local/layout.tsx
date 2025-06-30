import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Local News - Breaking Stories from Cities Across America | Newsr',
  description: 'Stay informed with local news from major cities across the United States. Breaking stories, weather updates, and community news from Denver, Chicago, Houston, Dallas, Seattle, Boston and more.',
  keywords: [
    'local news',
    'city news',
    'breaking news',
    'local weather',
    'community news',
    'Denver news',
    'Chicago news',
    'Houston news',
    'Dallas news',
    'Seattle news',
    'Boston news',
    'municipal news',
    'local government',
    'neighborhood news'
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
    title: 'Local News - Breaking Stories from Cities Across America',
    description: 'Your trusted source for local news from major cities. Breaking stories, weather, and community updates.',
    type: 'website',
    locale: 'en_US',
    url: 'https://newsr.vercel.app/topics/local',
    siteName: 'Newsr',
    images: [
      {
        url: '/og-local-hub.jpg',
        width: 1200,
        height: 630,
        alt: 'Local News Hub - Newsr',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Local News - Breaking Stories from Cities Across America',
    description: 'Your trusted source for local news from major cities. Breaking stories, weather, and community updates.',
    creator: '@newsr',
    images: ['/og-local-hub.jpg'],
  },
  alternates: {
    canonical: 'https://newsr.vercel.app/topics/local',
  },
}

export default function LocalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Enhanced local news hub structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'CollectionPage',
                '@id': 'https://newsr.vercel.app/topics/local#page',
                url: 'https://newsr.vercel.app/topics/local',
                name: 'Local News Hub - Breaking Stories from Cities Across America',
                description: 'Comprehensive local news coverage from major cities across the United States',
                isPartOf: {
                  '@type': 'WebSite',
                  '@id': 'https://newsr.vercel.app#website',
                  name: 'Newsr',
                  url: 'https://newsr.vercel.app',
                },
                about: {
                  '@type': 'Thing',
                  name: 'Local News',
                  description: 'Local news and information from cities across the United States',
                },
                publisher: {
                  '@type': 'NewsMediaOrganization',
                  '@id': 'https://newsr.vercel.app#organization',
                  name: 'Newsr',
                  url: 'https://newsr.vercel.app',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://newsr.vercel.app/logo.png',
                  },
                },
              },
              {
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
                ],
              },
            ],
          }),
        }}
      />
      {children}
    </>
  )
} 