# SkillProof

**Verify developer skills through real code analysis, not resume claims.**

SkillProof is an AI-powered recruiting tool that analyzes GitHub profiles to extract verified technical skills and match candidates to job descriptions.

## The Problem

Tech recruiting relies on self-reported skills that can't be verified. Resumes are filled with buzzwords, but how do you know if someone actually has "5 years of React experience"?

**SkillProof solves this by analyzing real code contributions.**

## Features

### Core Analysis
- **GitHub Profile Analysis** - Extract skills from actual repositories
- **Skill Verification Scores** - Confidence ratings based on code frequency, recency, and project complexity
- **Recent Activity Weighting** - Skills from the last 6 months count 3x more

### Job Matching
- **AI-Powered Matching** - Compare candidates to job descriptions
- **Match Scores** - Get hire/interview/pass recommendations
- **Skill Gap Analysis** - See matching and missing skills

### Advanced Features
- **Interview Question Generator** - Targeted questions for skill gaps
- **Open Source Contributions** - Track contributions to external projects
- **Code DNA Fingerprint** - Analyze coding style, collaboration patterns, career evolution
- **Batch Comparison** - Compare up to 20 candidates at once
- **Developer Search** - Find developers by skills, location, and activity
- **PDF Export** - Download professional reports

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS + Shadcn/ui
- TanStack Query (state management)
- Wouter (routing)

### Backend
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Anthropic Claude API (AI analysis)

### External APIs
- GitHub REST API
- Anthropic Claude API

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
│  React + TypeScript + Tailwind + Shadcn/ui              │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/JSON
┌─────────────────────▼───────────────────────────────────┐
│                   Express API                            │
│  /api/analyze-github  - Profile analysis                │
│  /api/match-job       - Job matching                    │
│  /api/interview-questions - Question generation         │
│  /api/contributions   - Open source contributions       │
│  /api/code-dna        - Developer fingerprint           │
│  /api/batch-compare   - Multi-candidate comparison      │
│  /api/search-developers - GitHub developer search       │
│  /api/export-pdf      - PDF report generation           │
└──────────┬─────────────────────────────┬────────────────┘
           │                             │
┌──────────▼──────────┐     ┌────────────▼────────────────┐
│    GitHub API       │     │     Anthropic Claude        │
│  - User profiles    │     │  - Skill extraction         │
│  - Repositories     │     │  - Job matching             │
│  - Events/Activity  │     │  - Question generation      │
└─────────────────────┘     └─────────────────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze-github` | POST | Analyze a GitHub profile |
| `/api/match-job` | POST | Match profile to job description |
| `/api/interview-questions` | POST | Generate interview questions |
| `/api/contributions` | POST | Fetch open source contributions |
| `/api/code-dna` | POST | Generate developer fingerprint |
| `/api/batch-compare` | POST | Compare multiple candidates |
| `/api/search-developers` | POST | Search GitHub for developers |
| `/api/export-pdf` | POST | Generate PDF report |
| `/api/analyses` | GET/POST | Save/retrieve analyses |

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- GitHub Token (optional, increases rate limits)
- Anthropic API Key

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
AI_INTEGRATIONS_ANTHROPIC_API_KEY=your_key

# Optional (increases GitHub rate limits)
GITHUB_TOKEN=your_github_token

# Session
SESSION_SECRET=your_session_secret
```

### Installation

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app runs on `http://localhost:5000`

## How It Works

### Skill Verification Scoring

Each skill receives a verification score (0-100) based on:

- **Frequency** (40 points max) - Number of repos using the skill
- **Recency Bonus** (30 points max) - Recent activity weighted higher
- **Complexity Bonus** (30 points max) - Stars, forks, project size
- **Language Bonus** (10 points max) - Primary languages ranked higher

### Recent Activity Weighting

Language statistics weight recent work more heavily:
- Last 6 months: 3x weight
- Last 12 months: 1.5x weight
- Older: 1x weight

### Job Matching Scores

- **90-100**: Perfect match - hire recommendation
- **75-89**: Strong match - interview recommendation
- **60-74**: Good match - interview recommendation
- **40-59**: Partial match - pass recommendation
- **0-39**: Poor match - pass recommendation

## Pages

- `/` - Home (profile analysis + job matching)
- `/compare` - Batch candidate comparison
- `/search` - Developer search
- `/saved` - Saved analyses

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**SkillProof** - Stop hiring based on what people say. Start hiring based on what they've built.
