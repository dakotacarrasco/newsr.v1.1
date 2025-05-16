import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    
    return NextResponse.json({ 
      authenticated: true, 
      user: session.user 
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { authenticated: false, user: null, error: 'Authentication check failed' }, 
      { status: 500 }
    );
  }
} 