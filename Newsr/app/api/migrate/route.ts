import { NextResponse } from 'next/server';
import { migrateArticlesToSupabase } from '@/lib/utils/migrateArticles';

export async function GET() {
  try {
    const result = await migrateArticlesToSupabase();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to migrate articles' },
      { status: 500 }
    );
  }
} 