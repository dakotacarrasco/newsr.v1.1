'use client'

import { ThemeProvider } from '@/app/components/ThemeProvider'
import Header from '@/app/components/layout/Header'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <Header />
      {children}
    </ThemeProvider>
  )
} 