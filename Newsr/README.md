# 📰 NewsR - Modern News Platform

A comprehensive, high-performance news platform built with Next.js 14, featuring advanced accessibility, security, and user experience enhancements.

## ✨ Features

### 🔧 Core Features
- **Modern Next.js 14** with App Router and Server Components
- **Real-time News** with category-based organization
- **Dark/Light Theme** with system preference detection
- **Responsive Design** optimized for all devices
- **Progressive Web App (PWA)** with offline support
- **Full-text Search** with advanced filtering
- **User Authentication** via Supabase
- **Personalized Dashboard** with saved articles and preferences

### 🎯 Advanced Features
- **Accessibility First** - WCAG 2.1 AA compliant
- **Performance Optimized** - Web Vitals monitoring and optimization
- **Security Hardened** - CSP headers, rate limiting, and OWASP compliance
- **SEO Optimized** - Structured data, sitemaps, and meta management
- **Error Boundaries** - Graceful error handling with recovery options
- **Toast Notifications** - User-friendly feedback system
- **Loading States** - Skeleton screens and progressive loading

### 🛡️ Security & Performance
- **Content Security Policy** with strict rules
- **Rate Limiting** per IP and endpoint
- **Input Validation** with Zod schemas
- **XSS Protection** and CSRF prevention
- **Performance Monitoring** with Web Vitals tracking
- **Lazy Loading** and code splitting
- **Image Optimization** with Next.js Image component

### ♿ Accessibility Features
- **Screen Reader Support** with ARIA live regions
- **Keyboard Navigation** with focus management
- **Skip Links** for easy content access
- **High Contrast Mode** detection
- **Reduced Motion** preference support
- **Focus Trapping** in modals and dialogs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/newsr.git
   cd newsr
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required variables in `.env.local`

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Start the backend (optional)**
   ```bash
   cd Newsr_Backend
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
Newsr/
├── app/                          # Next.js App Router
│   ├── components/              # Reusable components
│   │   ├── ui/                 # UI components
│   │   ├── layout/             # Layout components
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   ├── Toast.tsx          # Notification system
│   │   ├── AccessibilityProvider.tsx # A11y features
│   │   └── PerformanceMonitor.tsx # Performance tracking
│   ├── lib/                    # Utilities and configurations
│   │   ├── utils.ts           # Helper functions
│   │   ├── validation.ts      # Zod schemas
│   │   ├── ratelimit.ts       # Rate limiting
│   │   └── env.ts             # Environment validation
│   ├── hooks/                  # Custom React hooks
│   ├── context/               # React contexts
│   ├── styles/                # Global styles
│   └── (pages)/               # App routes
├── public/                     # Static assets
├── middleware.ts              # Security middleware
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS config
└── package.json
```

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. See `.env.example` for all available options:

- **Required**: Supabase URL and keys
- **Optional**: Analytics, email, cache, external APIs

### Security Headers

The application includes comprehensive security headers:
- Content Security Policy (CSP)
- X-Frame-Options, X-Content-Type-Options
- Strict Transport Security (HSTS)
- Rate limiting per IP

### Performance Optimization

- **Web Vitals Monitoring**: Tracks LCP, FID, CLS, FCP, TTFB
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image with responsive srcsets
- **Caching**: Aggressive caching with proper invalidation

## 🎨 Customization

### Theme Configuration

Modify `tailwind.config.js` to customize:
- Color palette
- Typography scales
- Spacing system
- Responsive breakpoints

### Component Styling

The app uses:
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theme switching
- **Tailwind Merge** for conditional classes

### Content Management

Articles are managed through:
- Supabase database
- Rich text editor support
- Image upload and optimization
- SEO metadata management

## 📱 PWA Features

The application is a full Progressive Web App:
- **Offline Support** with service worker
- **App Shortcuts** for quick navigation
- **Install Prompts** on supported devices
- **Background Sync** for offline actions
- **Push Notifications** (configurable)

## 🔍 SEO Features

Comprehensive SEO optimization:
- **Structured Data** (JSON-LD) for articles
- **Open Graph** and Twitter Cards
- **Dynamic Sitemaps** with article inclusion
- **Meta Tag Management** per page
- **Canonical URLs** and hreflang

## ♿ Accessibility

WCAG 2.1 AA compliant features:
- **Screen Reader Support** with proper ARIA labels
- **Keyboard Navigation** throughout the app
- **Focus Management** in modals and menus
- **Color Contrast** meeting AA standards
- **Text Scaling** support up to 200%
- **Motion Preferences** respect

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Deployment
npm run deploy       # Deploy to production
npm run analyze      # Analyze bundle size
```

### Code Quality

The project includes:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **Zod** for runtime validation

### Testing Strategy

- **Unit Tests** with Jest and React Testing Library
- **Integration Tests** for API endpoints
- **E2E Tests** with Playwright
- **Performance Tests** with Lighthouse CI
- **Accessibility Tests** with axe-core

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker

```bash
# Build Docker image
docker build -t newsr .

# Run container
docker run -p 3000:3000 newsr
```

### Manual Deployment

```bash
npm run build
npm run start
```

## 📊 Monitoring

### Performance Monitoring
- Web Vitals tracking
- Real User Monitoring (RUM)
- Bundle size analysis
- Lighthouse CI integration

### Error Tracking
- Error boundaries with recovery
- Client-side error reporting
- Server-side error logging
- User feedback collection

### Analytics
- Google Analytics 4 integration
- Custom event tracking
- User behavior analysis
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Ensure accessibility compliance
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Supabase](https://supabase.com/) for backend services
- [Lucide React](https://lucide.dev/) for beautiful icons
- [Zod](https://zod.dev/) for type-safe validation

## 📞 Support

- 📧 Email: support@newsr.com
- 💬 Discord: [Join our community](https://discord.gg/newsr)
- 📖 Documentation: [docs.newsr.com](https://docs.newsr.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/newsr/issues)

---

Made with ❤️ by the NewsR Team 