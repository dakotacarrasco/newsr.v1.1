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
    
    // Get user's liked articles
    const { data, error } = await supabase
      .from('likes')
      .select('*, articles(*)')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
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
    
    // Check if like already exists
    const { data: existingLike, error: queryError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .single();
    
    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw queryError;
    }
    
    if (existingLike) {
      return NextResponse.json(
        { message: 'Article already liked', id: existingLike.id }
      );
    }
    
    // Create new like
    const { data, error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        article_id: articleId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      message: 'Article liked successfully',
      like: data
    }, { status: 201 });
  } catch (error) {
    console.error('Error liking article:', error);
    return NextResponse.json(
      { error: 'Failed to like article' },
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
    
    // Delete the like
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('article_id', articleId);
    
    if (error) throw error;
    
    return NextResponse.json({ message: 'Article unliked successfully' });
  } catch (error) {
    console.error('Error unliking article:', error);
    return NextResponse.json(
      { error: 'Failed to unlike article' },
      { status: 500 }
    );
  }
}