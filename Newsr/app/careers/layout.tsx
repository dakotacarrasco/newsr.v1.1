import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers | Newsr',
  description: 'Join our team at Newsr and help us build the future of digital news'
}

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>{children}</>
  )
} 