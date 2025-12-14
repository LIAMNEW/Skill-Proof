# SkillProof

## Overview

SkillProof is a recruiting tool that analyzes GitHub profiles to extract real technical skills and match candidates to job descriptions using AI. The application solves the tech recruiting problem of hiring based on resumes rather than actual coding ability by analyzing real code contributions.

The platform allows users to:
- Enter a GitHub username to analyze their coding profile
- View language distribution, technical skills, and AI-generated experience summaries
- Paste job descriptions to calculate match scores between candidates and positions
- Get hiring recommendations (hire/interview/pass) based on skill alignment
- **Batch Candidate Comparison**: Compare up to 20 GitHub profiles against a job description and view a ranked leaderboard
- **Developer Search**: Search GitHub for developers by skills, location, minimum repos, and minimum followers, then select candidates to compare

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for development and production builds
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state and caching
- **Styling**: Tailwind CSS with Noir & Gold theme (charcoal gradient #0a0a0f to #1a1a24)
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Design System**: Glass morphism effects with white/5 opacity backgrounds, gold/amber accent colors (amber-400, amber-500)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix
- **Build Process**: Custom esbuild script for server bundling, Vite for client

### AI Integration
- **Provider**: Anthropic Claude API for skill analysis and job matching
- **Usage**: Generates experience summaries, extracts skills from repositories, calculates job match scores

### External APIs
- **GitHub REST API**: Fetches user profiles, repositories, and language statistics (unauthenticated requests)

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Current Schema**: Basic users table with id, username, password
- **In-Memory Fallback**: MemStorage class for development without database

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components (ProfileCard, JobMatcher, etc.)
│       ├── pages/        # Route pages (home, compare, search, not-found)
│       ├── hooks/        # Custom React hooks
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API endpoints
│   ├── storage.ts    # Data access layer
│   └── vite.ts       # Dev server integration
├── shared/           # Shared types and schema
└── migrations/       # Database migrations
```

### Key Design Decisions
1. **Monorepo Structure**: Client and server in single repository with shared types for type safety across the stack
2. **Path Aliases**: `@/` for client source, `@shared/` for shared code, `@assets/` for attached files
3. **Component Examples**: Each component has an example file in `components/examples/` for isolated testing
4. **API Design**: POST endpoints for analysis operations (`/api/analyze-github`, `/api/match-job`, `/api/batch-compare`, `/api/search-developers`)
5. **Multi-page Navigation**: Three main pages - Home (/), Batch Compare (/compare), Developer Search (/search) with navigation between them

## External Dependencies

### AI Services
- **Anthropic Claude**: Uses Replit AI Integrations (claude-sonnet-4-5 model) via `AI_INTEGRATIONS_ANTHROPIC_API_KEY` and `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` environment variables (auto-configured)

### External APIs
- **GitHub API**: Public REST API for fetching user data and repositories (rate-limited for unauthenticated requests)

### Database
- **PostgreSQL**: Requires `DATABASE_URL` environment variable for Drizzle ORM connection

### Key NPM Packages
- `@anthropic-ai/sdk`: Anthropic Claude API client
- `axios`: HTTP client for GitHub API calls
- `drizzle-orm` / `drizzle-kit`: Database ORM and migration tools
- `@tanstack/react-query`: Async state management
- `@radix-ui/*`: Accessible UI primitives
- `tailwindcss`: Utility-first CSS framework