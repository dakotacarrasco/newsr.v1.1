'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Form state
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Handle reset password request
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      setIsLoading(true)
      
      // Call Supabase reset password method
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      })
      
      if (error) throw error
      
      // Show success message
      setSuccess(true)
      setEmail('')
      
    } catch (err: any) {
      setError(err.message || 'Failed to send reset password email. Please try again.')
      console.error('Reset password error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex items-center justify-center h-[calc(100vh-140px)] bg-white">
      <div className="w-full max-w-md px-6">
        <div>
          {success ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions to reset your password.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                If you don't see the email in your inbox, please check your spam folder.
              </p>
              <Link 
                href="/login" 
                className="inline-block text-blue-600 hover:underline font-medium"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {/* Display error message if any */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="email" className="block font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:bg-blue-700 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 