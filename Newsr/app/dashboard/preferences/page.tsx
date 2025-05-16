'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const categories = [
  { id: 'politics', name: 'Politics', color: 'bg-red-100 border-red-300' },
  { id: 'business', name: 'Business', color: 'bg-blue-100 border-blue-300' },
  { id: 'sports', name: 'Sports', color: 'bg-green-100 border-green-300' },
  { id: 'local', name: 'Local News', color: 'bg-teal-100 border-teal-300' },
  { id: 'lifestyle', name: 'Lifestyle', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'culture', name: 'Culture', color: 'bg-purple-100 border-purple-300' },
  { id: 'technology', name: 'Technology', color: 'bg-indigo-100 border-indigo-300' },
  { id: 'science', name: 'Science', color: 'bg-pink-100 border-pink-300' },
  { id: 'health', name: 'Health', color: 'bg-orange-100 border-orange-300' },
  { id: 'environment', name: 'Environment', color: 'bg-emerald-100 border-emerald-300' }
]

export default function Preferences() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchPreferences() {
      setLoading(true)
      
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/signin')
        return
      }
      
      setUser(user)
      
      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('categories')
        .eq('user_id', user.id)
        .single()
      
      if (preferences?.categories) {
        setSelectedCategories(preferences.categories)
      }
      
      setLoading(false)
    }
    
    fetchPreferences()
  }, [router])

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  const handleSavePreferences = async () => {
    if (!user) return
    
    setSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          categories: selectedCategories,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      setSuccess('Preferences saved successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences')
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
          <div className="absolute -top-2 -left-2 h-6 w-6 border-2 border-black rounded-lg bg-orange-500"></div>
          <div className="absolute -bottom-2 -right-2 h-6 w-6 border-2 border-black rounded-lg bg-blue-500"></div>

          <h1 className="text-3xl font-bold mb-6">Content Preferences</h1>
          
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

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Select Your Interests</h2>
            <p className="text-gray-600 mb-6">
              Choose the categories you're interested in to personalize your news feed.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedCategories.includes(category.id)
                      ? `${category.color} border-2`
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleSavePreferences}
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
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 