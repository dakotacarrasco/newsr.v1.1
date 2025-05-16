import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { cityCode, frequency = 'daily' } = await request.json();
    
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
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if subscription already exists
    const { data: existingSubscription, error: queryError } = await supabase
      .from('subscriptions')
      .select('id, frequencies')
      .eq('user_id', user.id)
      .eq('city_code', cityCode)
      .single();
    
    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw queryError;
    }
    
    let result;
    
    if (existingSubscription) {
      // Update existing subscription
      const frequencies = existingSubscription.frequencies || [];
      if (!frequencies.includes(frequency)) {
        frequencies.push(frequency);
      }
      
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ frequencies })
        .eq('id', existingSubscription.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          city_code: cityCode,
          frequencies: [frequency],
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription: result
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}