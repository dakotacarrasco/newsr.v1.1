'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { registerUser } from '../../api/user/userService'

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if we're in signup mode from the URL parameter
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  
  // Effect to check the mode from URL
  useEffect(() => {
    const mode = searchParams.get('mode')
    setIsSignUpMode(mode === 'signup')
    
    // Check for auth errors
    const authError = searchParams.get('error')
    if (authError === 'auth') {
      setError('Authentication failed. Please try again.')
    } else if (authError === 'unexpected') {
      setError('An unexpected error occurred. Please try again.')
    }
    
    // Check for password update success
    if (searchParams.get('passwordUpdated') === 'true') {
      setSuccess('Your password has been successfully updated. You can now log in with your new password.')
    }
  }, [searchParams])

  // Handle sign-in submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      // Success, redirect to home or intended page
      const redirectTo = searchParams.get('redirect') || '/'
      router.push(redirectTo)
      
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle sign-up submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Basic validation
    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    try {
      setIsLoading(true)
      
      // Create user data
      const userData = {
        fullName,
        email,
        password,
        preferences: {
          dailyNewsletter: true,
          breakingNews: false,
          weeklyDigest: true,
          personalizedContent: true
        }
      }
      
      // Call registration service
      await registerUser(userData)
      
      // Switch to sign in mode with success message
      setIsSignUpMode(false)
      setEmail('') 
      setPassword('')
      setFullName('')
      setConfirmPassword('')
      
      // Set a success message in the URL to show on sign-in page
      router.push('/login?registered=true')
      
    } catch (err: any) {
      // Handle different types of errors
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Registration failed. Please try again.')
      }
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/callback`
        }
      })
      
      if (error) throw error
    } catch (err: any) {
      setError('Google authentication failed: ' + (err.message || 'Unknown error'))
    }
  }
  
  // Check for registration success message
  const registrationSuccess = searchParams.get('registered') === 'true'
  
  // Define a success state for notifications
  const [success, setSuccess] = useState<string>('')

  return (
    <div className={`flex items-center justify-center ${isSignUpMode ? 'min-h-[calc(100vh-140px)] py-10' : 'h-[calc(100vh-140px)]'} bg-white`}>
      <div className="w-full max-w-md px-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isSignUpMode ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600 mb-6">
            {isSignUpMode 
              ? 'Sign up to get started with personalized news' 
              : 'Sign in to continue to your account'}
          </p>
          
          {/* Display error message if any */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
              {error}
            </div>
          )}
          
          {/* Display success message */}
          {success && (
            <div className="mb-6 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg text-sm">
              {success}
            </div>
          )}
          
          {/* Display registration success message */}
          {registrationSuccess && !isSignUpMode && (
            <div className="mb-6 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg text-sm">
              Your account was successfully created! You can now sign in.
            </div>
          )}
          
          {/* Social Auth Options */}
          <div className={isSignUpMode ? "mb-4" : "mb-6"}>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors duration-200"
              onClick={handleGoogleAuth}
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
              {isSignUpMode ? 'Sign up with Google' : 'Sign in with Google'}
            </button>
          </div>

          <div className={`relative ${isSignUpMode ? "mb-4" : "mb-6"}`}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {isSignUpMode ? 'or sign up with email' : 'or sign in with email'}
              </span>
            </div>
          </div>

          <form onSubmit={isSignUpMode ? handleSignUp : handleSignIn} className={`${isSignUpMode ? 'space-y-3' : 'space-y-4'}`}>
            {/* Full Name field - only shown in signup mode */}
            {isSignUpMode && (
              <div className="space-y-1">
                <label htmlFor="fullName" className="block font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                    required={isSignUpMode}
                  />
                </div>
              </div>
            )}
            
            {/* Email field */}
            <div className="space-y-1">
              <label htmlFor="email" className="block font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label htmlFor="password" className="block font-medium text-gray-700">Password</label>
                {!isSignUpMode && (
                  <Link href="/reset-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isSignUpMode ? "Create a password (min. 8 characters)" : "Enter your password"}
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
              {isSignUpMode && (
                <p className="text-xs text-gray-500 mt-1">
                  Use 8+ characters with a mix of letters, numbers & symbols
                </p>
              )}
            </div>
            
            {/* Confirm Password field - only shown in signup mode */}
            {isSignUpMode && (
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your password"
                    required={isSignUpMode}
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
            )}

            {/* Terms and conditions - only shown in signup mode */}
            {isSignUpMode ? (
              <div className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative w-5 h-5 shrink-0">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="sr-only"
                      required={isSignUpMode}
                    />
                    <div className={`
                      absolute w-5 h-5 border border-gray-300 rounded-md transition-colors duration-200
                      ${agreeToTerms ? 'bg-blue-500 border-blue-500' : 'bg-white'}
                    `}></div>
                  </div>
                  <span className="text-sm text-gray-700">
                    I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                  </span>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative w-5 h-5 shrink-0">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`
                      absolute w-5 h-5 border border-gray-300 rounded-md transition-colors duration-200
                      ${rememberMe ? 'bg-blue-500 border-blue-500' : 'bg-white'}
                    `}></div>
                  </div>
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200 hover:bg-blue-700 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 
                (isSignUpMode ? 'Creating Account...' : 'Signing in...') : 
                (isSignUpMode ? 'Create Account' : 'Sign In')
              }
            </button>
          </form>

          <div className={isSignUpMode ? "mt-4 text-center" : "mt-8 text-center"}>
            <p className="text-gray-600">
              {isSignUpMode ? 'Already have an account? ' : 'Don\'t have an account? '}
              <button 
                onClick={() => setIsSignUpMode(!isSignUpMode)}
                className="text-blue-600 hover:underline font-medium"
              >
                {isSignUpMode ? 'Sign In' : 'Create an account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 