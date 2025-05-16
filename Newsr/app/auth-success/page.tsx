'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Get the session 
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error during auth processing:', error)
          router.push('/login?error=auth')
          return
        }
        
        if (session) {
          // Successfully authenticated
          console.log('Authentication successful')
          
          // Redirect to the dashboard or home page
          router.push('/')
        } else {
          // No session, redirect to login
          router.push('/login')
        }
      } catch (err) {
        console.error('Unexpected error during auth processing:', err)
        router.push('/login?error=unexpected')
      }
    }
    
    // Execute the callback handling
    handleAuthSuccess()
  }, [router])

  // Show a loading state while processing
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
} 