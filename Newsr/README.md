# Newsr

A modern news aggregation platform built with Next.js and Supabase.

## Features

- Authentication with Supabase Auth
- User preferences storage
- Article saving functionality
- Topic-based navigation
- Responsive design with Tailwind CSS
- Dark/light mode support

## Tech Stack

- Next.js 14
- Supabase for authentication and database
- Tailwind CSS for styling
- TypeScript for type safety

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env.local` file with your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

This project is configured for deployment on Vercel. The following files are included for seamless deployment:

- `vercel.json` - Vercel configuration
- Custom build commands in `package.json`

## Build

```bash
npm run build
```

## License

MIT 