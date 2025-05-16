import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user's bookmarked articles
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*, articles(*)')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();
    
    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }
    
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if bookmark already exists
    const { data: existingBookmark, error: queryError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .single();
    
    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw queryError;
    }
    
    if (existingBookmark) {
      return NextResponse.json(
        { message: 'Article already bookmarked', id: existingBookmark.id }
      );
    }
    
    // Create new bookmark
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        article_id: articleId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      message: 'Article bookmarked successfully',
      bookmark: data
    }, { status: 201 });
  } catch (error) {
    console.error('Error bookmarking article:', error);
    return NextResponse.json(
      { error: 'Failed to bookmark article' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    
    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }
    
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Delete the bookmark
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('article_id', articleId);
    
    if (error) throw error;
    
    return NextResponse.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    );
  }
}