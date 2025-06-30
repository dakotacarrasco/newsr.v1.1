import { MetadataRoute } from 'next'

// Expanded city data for sitemap generation
const CITIES = [
  // Original cities
  'denver', 'chicago', 'houston', 'dallas', 'seattle', 'boston',
  'los-angeles', 'new-york', 'miami', 'phoenix', 'philadelphia',
  'san-antonio', 'san-diego', 'san-francisco', 'san-jose', 'austin',
  'fort-worth', 'charlotte', 'columbus', 'indianapolis',
  
  // Additional cities from database
  'abq', 'birmingham', 'charleston', 'des_moines', 'detroit', 'hartford',
  'kansas_city', 'las_vegas', 'louisville', 'milwaukee', 'minneapolis',
  'nashville', 'oklahoma_city', 'portland', 'richmond', 'salt_lake_city',
  'st_louis', 'tucson'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://newsr.vercel.app';
  
  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/topics/local`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    // Add other main routes
    {
      url: `${baseUrl}/topics/technology`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topics/business`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topics/politics`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topics/sports`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topics/culture`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topics/lifestyle`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  // Add all city pages
  const cityRoutes = CITIES.map((city) => ({
    url: `${baseUrl}/topics/local/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...routes, ...cityRoutes];
} 