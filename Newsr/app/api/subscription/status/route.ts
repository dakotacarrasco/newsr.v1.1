import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cityCode = url.searchParams.get('cityCode');
    
    if (!cityCode) {
      return NextResponse.json(
        { error: 'City code is required' },
        { status: 400 }
      );
    }
    
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { isSubscribed: false, message: 'User not authenticated' },
        { status: 200 }
      );
    }
    
    // Check subscription status
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('frequencies')
      .eq('user_id', user.id)
      .eq('city_code', cityCode)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json({ isSubscribed: false });
      }
      throw error;
    }
    
    return NextResponse.json({
      isSubscribed: true,
      frequencies: subscription.frequencies || []
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}