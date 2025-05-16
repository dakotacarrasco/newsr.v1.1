import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    console.log('Registration attempt:', userData);
    
    // Simulating successful registration
    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully',
      data: { 
        user: { 
          id: 'test-id',
          email: userData.email,
          // Don't return password even in test
        } 
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    );
  }
} 