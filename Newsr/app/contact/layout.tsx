import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Newsr',
  description: 'Get in touch with the Newsr team for questions, feedback, or collaboration opportunities'
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>{children}</>
  )
} 