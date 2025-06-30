import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | Newsr',
  description: 'Learn about Newsr, our founder, and our mission to provide trusted news'
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>{children}</>
  )
} 