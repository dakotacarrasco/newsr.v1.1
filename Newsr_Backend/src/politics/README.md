# Politics Module

This module handles political news articles and polls. It includes functionality to:

1. Scrape political news from various sources
2. Process and rewrite articles using Mixtral AI
3. Store articles and political polls in Supabase
4. Provide API endpoints for CRUD operations

## Setup

1. Install Python dependencies:


3. Create the required tables in Supabase using the SQL in `models/supabase_schema.sql`

## Usage

### API Endpoints

#### Articles
- GET `/politics/articles` - Get all political articles
- GET `/politics/articles/:id` - Get a specific political article
- POST `/politics/articles` - Create a new political article (protected)
- PATCH `/politics/articles/:id` - Update a political article (protected)
- DELETE `/politics/articles/:id` - Delete a political article (protected)
- POST `/politics/articles/scrape` - Trigger scraping of political news (protected)

#### Political Polls
- GET `/politics/polls` - Get all political polls
- GET `/politics/polls/:id` - Get a specific political poll
- POST `/politics/polls` - Create a new political poll (protected)
- PATCH `/politics/polls/:id` - Update a political poll (protected)
- DELETE `/politics/polls/:id` - Delete a political poll (protected)

### Scraping Political News

The scraping process:
1. Fetches articles from configured news sources
2. Extracts content using newspaper3k
3. Rewrites content using Mixtral AI
4. Stores the processed articles in Supabase

To manually trigger scraping, make a POST request to `/politics/articles/scrape` (requires authentication).

