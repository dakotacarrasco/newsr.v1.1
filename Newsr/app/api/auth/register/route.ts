import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createRouteHandlerClient({ cookies });
    
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    
    // If we have a user, also create an entry in the users table
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          preferences: {
            topics: [],
            locations: [],
            darkMode: false,
          },
        });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }
    
    return NextResponse.json({ 
      user: authData.user,
      session: authData.session
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}