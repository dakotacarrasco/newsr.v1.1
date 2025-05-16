import { NextResponse } from 'next/server';
import { createCityDigests } from '@/lib/utils/createCityDigests';

export async function GET() {
  try {
    const result = await createCityDigests();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Digests API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create city digests' },
      { status: 500 }
    );
  }
} 