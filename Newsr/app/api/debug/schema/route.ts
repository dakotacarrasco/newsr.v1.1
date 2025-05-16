import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase/client'

export async function GET() {
  try {
    // First get one row to determine what columns exist
    const { data: sampleRow, error: sampleError } = await supabase
      .from('topic_articles')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.error('Error fetching sample row:', sampleError);
      return NextResponse.json({ error: sampleError.message }, { status: 500 });
    }
    
    // Extract column information from the sample row
    const columnInfo = sampleRow ? Object.keys(sampleRow).map(key => ({
      name: key,
      type: typeof sampleRow[key],
      value: sampleRow[key],
      is_null: sampleRow[key] === null
    })) : [];
    
    // Query for more information about the table
    const { data: tableCount, error: countError } = await supabase
      .from('topic_articles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting table count:', countError);
    }
    
    return NextResponse.json({
      table: 'topic_articles',
      columns: columnInfo,
      count: tableCount?.count || 'unknown',
      sample: sampleRow
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 