import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return a static list of categories
    // In a real app, you might fetch this from your database
    const categories = [
      { id: 'politics', name: 'Politics', description: 'Political news and analysis' },
      { id: 'business', name: 'Business', description: 'Business and economic news' },
      { id: 'sports', name: 'Sports', description: 'Sports news and updates' },
      { id: 'entertainment', name: 'Entertainment', description: 'Entertainment news' },
      { id: 'technology', name: 'Technology', description: 'Tech news and reviews' },
      { id: 'health', name: 'Health', description: 'Health and wellness news' },
      { id: 'science', name: 'Science', description: 'Science news and discoveries' },
      { id: 'local', name: 'Local', description: 'Local news in your area' },
      { id: 'lifestyle', name: 'Lifestyle', description: 'Lifestyle content' },
      { id: 'culture', name: 'Culture', description: 'Arts and culture' },
      { id: 'environment', name: 'Environment', description: 'Environmental news' }
    ];
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}