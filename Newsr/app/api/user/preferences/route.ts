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
    
    // Get user preferences
    const { data, error } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // User record doesn't exist in users table
        return NextResponse.json({ preferences: {} });
      }
      throw error;
    }
    
    return NextResponse.json({ preferences: data.preferences || {} });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const updates = await request.json();
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
    
    // Get current preferences
    const { data: currentData, error: fetchError } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw fetchError;
    }
    
    const currentPreferences = currentData?.preferences || {};
    const newPreferences = { ...currentPreferences, ...updates };
    
    // Update preferences
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        preferences: newPreferences,
        updated_at: new Date().toISOString()
      })
      .select('preferences')
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ preferences: data.preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}