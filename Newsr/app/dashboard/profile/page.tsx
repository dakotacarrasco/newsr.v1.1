'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Calendar, Edit2, Save, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function getProfile() {
      setLoading(true)
      
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/signin')
        return
      }
      
      setUser(user)
      
      // Get profile data from profiles table if it exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setDisplayName(profile.display_name || '')
        setBio(profile.bio || '')
      }
      
      setLoading(false)
    }
    
    getProfile()
  }, [router])

  const handleSaveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          bio: bio,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      setSuccess('Profile updated successfully')
      setEditMode(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-stone-50 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-stone-50 py-12">
      <div className="max-w-3xl mx-auto px-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white border-2 border-black rounded-lg p-8 relative">
          <div className="absolute -top-2 -left-2 h-6 w-6 border-2 border-black rounded-lg bg-indigo-500"></div>
          <div className="absolute -bottom-2 -right-2 h-6 w-6 border-2 border-black rounded-lg bg-blue-500"></div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                editMode 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {editMode ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <div className="aspect-square bg-gray-100 rounded-lg border-2 border-black flex items-center justify-center">
                <User className="w-24 h-24 text-gray-400" />
              </div>
            </div>
            
            <div className="w-full md:w-2/3 space-y-6">
              {editMode ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="displayName" className="block font-medium">
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your display name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="bio" className="block font-medium">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Profile
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      {displayName || user.email?.split('@')[0] || 'User'}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Bio</h3>
                    <p className="text-gray-700">
                      {bio || 'No bio provided yet. Click "Edit Profile" to add one.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 