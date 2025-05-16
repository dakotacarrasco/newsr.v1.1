import { supabase } from '../config/supabaseClient';

export async function setupMonitoringTables() {
  // Create user activity table if it doesn't exist
  const { error } = await supabase.rpc('create_user_activity_table', {});
  
  if (error) {
    console.error('Error setting up monitoring tables:', error.message);
  } else {
    console.log('Monitoring tables created or already exist');
  }
}

// Function to create stored procedure for creating the table
export async function createStoredProcedure() {
  // Run this SQL in Supabase SQL Editor once
  const sql = `
  create or replace function create_user_activity_table()
  returns void as $$
  begin
    create table if not exists public.user_activity (
      id uuid default uuid_generate_v4() primary key,
      user_id uuid references auth.users(id),
      activity_type text not null,
      ip_address text,
      user_agent text,
      created_at timestamp with time zone default now()
    );
    
    -- Add row level security
    alter table public.user_activity enable row level security;
    
    -- Create policy for admins
    create policy "Admins can see all user activity"
      on public.user_activity
      for select
      to authenticated
      using (auth.jwt() ->> 'role' = 'admin');
      
    -- Create policy for user to see their own activity
    create policy "Users can see their own activity"
      on public.user_activity
      for select
      to authenticated
      using (auth.uid() = user_id);
  end;
  $$ language plpgsql;
  `;
  
  console.log('Run this SQL in Supabase SQL Editor to create the stored procedure:');
  console.log(sql);
} 