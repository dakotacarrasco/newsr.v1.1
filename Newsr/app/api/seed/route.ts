import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/app/lib/seed';

export async function GET(request: NextRequest) {
  try {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Seeding is only allowed in development mode' },
        { status: 403 }
      );
    }

    const result = await seedDatabase();
    
    if (result.success) {
      return NextResponse.json({ message: 'Database seeded successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to seed database', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in seed route:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
} 