/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://newsr.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: [
    '/admin/*',
    '/dashboard/*',
    '/api/*',
    '/debug/*',
    '/private/*',
    '/server-sitemap-index.xml'
  ],
  additionalPaths: async (config) => {
    const result = []

    // Add dynamic article pages
    // In a real app, you'd fetch this from your database
    const articles = await fetch(`${config.siteUrl}/api/articles?limit=1000`)
      .then(res => res.json())
      .catch(() => ({ articles: [] }))

    if (articles.articles) {
      articles.articles.forEach(article => {
        result.push({
          loc: `/articles/${article.slug || article.id}`,
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: article.updated_at || article.published_at
        })
      })
    }

    // Add category pages
    const categories = [
      'technology',
      'business', 
      'politics',
      'sports',
      'culture',
      'lifestyle',
      'local'
    ]

    categories.forEach(category => {
      result.push({
        loc: `/topics/${category}`,
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString()
      })
    })

    return result
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/debug/',
          '/private/',
          '/_next/',
          '*.tmp',
          '*.cache',
          '*.log'
        ]
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1
      },
      {
        userAgent: ['AhrefsBot', 'MJ12bot', 'DotBot'],
        disallow: '/'
      }
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://newsr.vercel.app'}/server-sitemap-index.xml`
    ]
  },
  priority: {
    '/': 1.0,
    '/topics/*': 0.9,
    '/articles/*': 0.8,
    '/search': 0.7,
    '/about': 0.6,
    '/contact': 0.5,
    '/privacy-policy': 0.3,
    '/terms-of-service': 0.3
  },
  changefreq: {
    '/': 'daily',
    '/topics/*': 'daily',
    '/articles/*': 'weekly',
    '/search': 'monthly',
    '/about': 'monthly',
    '/contact': 'monthly'
  },
  transform: async (config, path) => {
    // Custom transform function for specific paths
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
        alternateRefs: [
          {
            href: `${config.siteUrl}`,
            hreflang: 'en'
          },
          {
            href: `${config.siteUrl}/es`,
            hreflang: 'es'
          }
        ]
      }
    }

    // Default transform
    return {
      loc: path,
      changefreq: config.changefreq || 'weekly',
      priority: config.priority || 0.5,
      lastmod: new Date().toISOString()
    }
  }
} 