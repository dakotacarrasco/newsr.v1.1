'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function UpdatePassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Form state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Check if we have a valid session when the component loads
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error || !data.session) {
        console.error('No valid session for password reset:', error)
        setError('Invalid or expired password reset link. Please request a new one.')
      }
    }
    
    checkSession()
  }, [])
  
  // Handle password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    try {
      setIsLoading(true)
      
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password
      })
      
      if (error) throw error
      
      // Show success message
      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/login?passwordUpdated=true')
      }, 3000)
      
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.')
      console.error('Password update error:', err)
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
              <h1 className="text-3xl font-bold mb-2">Password Updated</h1>
              <p className="text-gray-600 mb-6">
                Your password has been successfully updated.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                You will be redirected to the login page shortly.
              </p>
              <Link 
                href="/login" 
                className="inline-block text-blue-600 hover:underline font-medium"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
              <p className="text-gray-600 mb-6">
                Please create a new password for your account.
              </p>
              
              {/* Display error message if any */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="password" className="block font-medium text-gray-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a new password (min. 8 characters)"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use 8+ characters with a mix of letters, numbers & symbols
                  </p>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block font-medium text-gray-700">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:bg-blue-700 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 