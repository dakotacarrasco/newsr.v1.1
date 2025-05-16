# News Platform Backend

A Node.js/Express backend for a news platform with articles, polls, user authentication, and location-based content.

## Features

- User authentication with Supabase Auth
- Article management (CRUD operations)
- Poll creation and voting system
- Location-based content filtering
- Response caching for improved performance

## Tech Stack

- Node.js & Express
- TypeScript
- Supabase (PostgreSQL + Auth)
- Node-Cache for caching

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # External services and utilities
│   ├── types/            # TypeScript type definitions
│   └── app.ts            # Main Express application
├── .env                  # Environment variables
└── package.json          # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Supabase credentials and other configuration.

5. Set up the database schema:
   - Run the SQL scripts in the `supabase/migrations` directory in your Supabase SQL editor

### Development

Start the development server:

```bash
npm run dev
```

The server will be available at http://localhost:8000.

### Production Build

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (requires authentication)
- `PATCH /api/auth/profile` - Update user profile (requires authentication)

### Articles

- `GET /api/articles` - Get all articles (with filtering options)
- `GET /api/articles/:id` - Get a specific article
- `POST /api/articles` - Create a new article (requires authentication)
- `PATCH /api/articles/:id` - Update an article (requires authentication)
- `DELETE /api/articles/:id` - Delete an article (requires authentication)

### Polls

- `GET /api/polls` - Get all polls
- `GET /api/polls/:id` - Get a specific poll
- `POST /api/polls` - Create a new poll (requires authentication)
- `POST /api/polls/:id/vote` - Vote on a poll (requires authentication)
- `DELETE /api/polls/:id` - Delete a poll (requires authentication)

### Locations

- `GET /api/locations` - Get all locations
- `GET /api/locations/:locationId/articles` - Get articles for a specific location
- `GET /api/locations/preferences` - Get user location preferences (requires authentication)
- `PUT /api/locations/preferences` - Update user location preferences (requires authentication)

## License

[MIT](LICENSE) 