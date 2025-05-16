import { Metadata, Viewport } from 'next'
import ClientProviders from './ClientProviders'
import '@/app/styles/globals.css'
import Header from '@/app/components/layout/Header'
import { ThemeProvider } from '@/app/components/ThemeProvider'
import { Analytics } from "@vercel/analytics/react"

// Viewport configuration - separated from metadata
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1d4ed8',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://newsr.vercel.app'),
  title: {
    default: 'NewsR',
    template: '%s | NewsR',
  },
  description: 'Your trusted source for news and updates',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NewsR',
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
  applicationName: 'NewsR',
  openGraph: {
    type: 'website',
    siteName: 'NewsR',
    title: 'NewsR - Your trusted source for news',
    description: 'Stay informed with the latest news and updates from trusted sources',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ClientProviders>
            <Header />
            <main className="pt-[100px] flex-grow">
              {children}
            </main>
            <Analytics />
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  )
} 