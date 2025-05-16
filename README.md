# Newsr v1.1

A comprehensive news aggregation and analysis platform.

## Project Structure

- **Newsr/**: Frontend application
- **Newsr_Backend/**: Backend server and API
- **wrangler/**: Deployment and infrastructure tools
- **Droplet/**: Digital Ocean configuration

## Application Structure

```
/app
├── (auth)/                  # Authentication route group
│   ├── login/
│   ├── signup/
│   └── reset-password/
│
├── (dashboard)/             # Dashboard route group
│   ├── dashboard/
│   └── preferences/
│
├── api/                     # API routes
│   ├── articles/
│   ├── auth/
│   ├── categories/
│   └── polls/
│
├── articles/                # Article pages
│   └── [id]/
│
├── topics/                  # Topic-specific pages
│   ├── business/
│   ├── culture/
│   ├── lifestyle/
│   ├── local/
│   ├── politics/
│   ├── sports/
│   └── technology/
│
├── components/              # Component library
│   ├── layout/              # Layout components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── index.ts
│   │
│   ├── ui/                  # Base UI components
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleList.tsx
│   │   ├── Button.tsx
│   │   └── index.ts
│   │
│   └── features/            # Feature-specific components
│       ├── articles/
│       ├── polls/
│       └── categories/
│
├── context/                 # Application context providers
│   ├── AuthContext.tsx
│   ├── PreferencesContext.tsx
│   └── index.ts
│
├── lib/                     # Utilities and services
│   ├── api/                 # API clients
│   │   ├── client.ts
│   │   ├── supabase.ts
│   │   └── weatherApi.ts
│   │
│   ├── auth/                # Auth utilities
│   │   ├── auth.ts
│   │   └── useAuth.tsx
│   │
│   ├── constants/           # App constants
│   │   ├── categories.ts
│   │   ├── routes.ts
│   │   └── mockData.ts
│   │
│   ├── hooks/               # React hooks
│   │   ├── useArticles.ts
│   │   ├── usePolls.ts
│   │   └── useUserPreferences.ts
│   │
│   ├── services/            # Data services
│   │   ├── articleService.ts
│   │   ├── pollService.ts
│   │   └── userService.ts
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── article.ts
│   │   ├── user.ts
│   │   ├── poll.ts
│   │   └── index.ts
│   │
│   └── utils/               # Utility functions
│       ├── date.ts
│       └── formatters.ts
│
├── styles/                  # Global styles
│   └── globals.css
│
├── ClientProviders.tsx      # Client provider wrappers
├── layout.tsx               # Root layout
└── page.tsx                 # Home page
```

## Setup and Installation

Instructions for setting up and running the project locally...

## Development

Guidelines for contributing to the project...

## Deployment

Information about deployment processes...

## License

TBD 