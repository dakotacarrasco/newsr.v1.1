import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const idToFind = searchParams.get('id')
  
  if (!idToFind) {
    return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 })
  }
  
  // Remove any hyphens to try different formats
  const idWithoutHyphens = idToFind.replace(/-/g, '')
  
  try {
    const results: any = {
      originalQuery: idToFind,
      attempts: {}
    }
    
    // Try original ID
    const { data: exactData, error: exactError } = await supabase
      .from('topic_articles')
      .select('id, title, category, created_at')
      .eq('id', idToFind)
    
    results.attempts.exactMatch = {
      query: `id = '${idToFind}'`,
      found: exactData && exactData.length > 0,
      count: exactData?.length || 0,
      error: exactError?.message || null
    }
    
    // Try ID without hyphens
    const { data: noHyphenData, error: noHyphenError } = await supabase
      .from('topic_articles')
      .select('id, title, category, created_at')
      .eq('id', idWithoutHyphens)
    
    results.attempts.noHyphens = {
      query: `id = '${idWithoutHyphens}'`,
      found: noHyphenData && noHyphenData.length > 0,
      count: noHyphenData?.length || 0,
      error: noHyphenError?.message || null
    }
    
    // Try LIKE query with ID
    const { data: likeData, error: likeError } = await supabase
      .from('topic_articles')
      .select('id, title, category, created_at')
      .ilike('id', `%${idToFind}%`)
    
    results.attempts.likeMatch = {
      query: `id ILIKE '%${idToFind}%'`,
      found: likeData && likeData.length > 0,
      count: likeData?.length || 0,
      error: likeError?.message || null
    }
    
    // Try to find by other potential fields
    const potentialFields = ['id', 'title', 'category', 'topic', 'slug']
    const { data: allArticles, error: allError } = await supabase
      .from('topic_articles')
      .select('*')
      .limit(1)
    
    if (allArticles && allArticles.length > 0) {
      // List all field names from the first article for reference
      results.allFields = Object.keys(allArticles[0])
    }
    
    // Record overall result
    results.anyFound = exactData?.length > 0 || noHyphenData?.length > 0 || likeData?.length > 0
    
    // If we found results in any form, return them
    if (exactData?.length > 0) {
      results.matchedData = exactData
    } else if (noHyphenData?.length > 0) {
      results.matchedData = noHyphenData
    } else if (likeData?.length > 0) {
      results.matchedData = likeData
    }
    
    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Error searching for article:', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
} 