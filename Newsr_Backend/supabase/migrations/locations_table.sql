-- Locations table
create table public.locations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  country text,
  region text,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add location_id to articles table
alter table public.articles add column location_id uuid references public.locations(id);

-- Create index for faster location-based queries
create index idx_articles_location on public.articles(location_id);

-- Sample locations data
insert into public.locations (name, country, region, latitude, longitude)
values 
  ('New York', 'USA', 'North America', 40.7128, -74.0060),
  ('London', 'UK', 'Europe', 51.5074, -0.1278),
  ('Tokyo', 'Japan', 'Asia', 35.6762, 139.6503),
  ('Sydney', 'Australia', 'Oceania', -33.8688, 151.2093),
  ('Cape Town', 'South Africa', 'Africa', -33.9249, 18.4241); 