# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Git installed
- Vercel CLI (optional): `npm i -g vercel`

## Environment Variables

Create a `.env` file in the project root:

\`\`\`bash
VITE_API_BASE_URL=https://your-api-url.com/api
\`\`\`

## Development Deployment

### Local Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
\`\`\`

## Production Deployment

### Option 1: Vercel (Recommended)

**Via Vercel Dashboard:**
1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Configure environment variables
4. Deploy

**Via Vercel CLI:**
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
\`\`\`

### Option 2: Docker

\`\`\`bash
# Build image
docker build -t coeec-admin .

# Run container
docker run -p 80:80 coeec-admin

# Access at http://localhost
\`\`\`

### Option 3: Static Hosting (Netlify, AWS S3, etc.)

\`\`\`bash
# Build for production
npm run build

# Upload dist/ folder to your hosting provider
\`\`\`

## CI/CD Setup

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs linter and tests on every push
- Builds the application
- Deploys to Vercel on main branch

**Required GitHub Secrets:**
- `VERCEL_TOKEN`: From Vercel account settings
- `VERCEL_ORG_ID`: From Vercel project settings
- `VERCEL_PROJECT_ID`: From Vercel project settings

## Performance Optimization

1. **Enable caching**: Configure CDN caching for static assets
2. **Compression**: Enable gzip/brotli compression (included in nginx.conf)
3. **Image optimization**: Use optimized image formats (WebP, AVIF)
4. **Code splitting**: Already configured in Vite build

## Security Checklist

- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting on API
- [ ] Enable security headers (CSP, HSTS, etc.)
- [ ] Regular dependency updates
- [ ] Environment variables properly secured

## Monitoring

Consider integrating:
- **Sentry**: Error tracking
- **Google Analytics**: User analytics
- **Uptime Robot**: Uptime monitoring
- **LogRocket**: Session replay

## Backup Strategy

- Database: Daily automated backups
- File uploads: Cloud storage with versioning
- Configuration: Version controlled in Git
