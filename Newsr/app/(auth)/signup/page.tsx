'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to login page with a param indicating signup mode
    router.push('/login?mode=signup')
  }, [router])
  
  return null
} 