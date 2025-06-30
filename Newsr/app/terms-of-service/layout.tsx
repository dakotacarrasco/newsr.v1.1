import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Newsr',
  description: 'Read the terms and conditions for using the Newsr platform'
}

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>{children}</>
  )
} 