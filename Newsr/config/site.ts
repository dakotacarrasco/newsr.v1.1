export const siteConfig = {
  name: "NewsR",
  description: "Your trusted source for news and updates",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  ogImage: "https://your-domain.com/og.jpg",
  links: {
    twitter: "https://twitter.com/newsr",
    github: "https://github.com/newsr",
  },
} 