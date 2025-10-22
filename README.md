# Read-It-Later-Anator

An intelligent read-it-later application powered by AI that analyzes, categorizes, and helps you make sense of your saved articles.

## Overview

Read-It-Later-Anator is more than just a bookmark manager. It's an AI-powered reading companion that:

- **Saves URLs** for later reading with a single click or API call
- **Analyzes content** automatically using Claude AI
- **Tags and categorizes** articles intelligently
- **Generates personalized digests** to keep you informed
- **Recommends new content** based on your interests
- **Tracks your reading** patterns and preferences

## Key Features

### Core Functionality
- Save articles from any source (web, mobile, browser extension)
- Automatic content extraction and archiving
- Full-text search across all saved articles
- Status tracking (unread, reading, read, archived)
- Manual and AI-generated tagging

### AI-Powered Intelligence
- Automatic article analysis and summarization
- Topic extraction and categorization
- Sentiment analysis
- Key insights extraction
- Semantic search using embeddings
- Personalized content recommendations

### Digest & Notifications
- Daily, weekly, or monthly digests
- AI-generated summaries of saved content
- Topic-based grouping
- Email delivery (coming soon)

## Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: DynamoDB (Single-table design)
- **Storage**: AWS S3 (Article content)
- **Queue**: AWS SQS (Async processing)
- **AI**: Anthropic Claude API

### Frontend
- **Framework**: Next.js (React with TypeScript)
- **Styling**: Tailwind CSS
- **State**: Zustand + React Query

### Infrastructure
- **Cloud**: AWS
- **IaC**: Terraform/AWS CDK (planned)
- **CI/CD**: GitHub Actions

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and component overview
- [Setup Guide](docs/SETUP_GUIDE.md) - Development environment setup
- [DynamoDB Queries](docs/DYNAMODB_QUERIES.md) - Database query examples

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- AWS Account (for production)
- Anthropic API key

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/read-it-later-anator.git
   cd read-it-later-anator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start local services**
   ```bash
   docker-compose up -d
   ```

5. **Create DynamoDB table**
   ```bash
   cd backend
   npm run db:create
   ```

6. **Start development servers**
   ```bash
   # Backend (http://localhost:3000)
   npm run dev:backend

   # Frontend (http://localhost:3001)
   npm run dev:frontend
   ```

For detailed setup instructions, see the [Setup Guide](docs/SETUP_GUIDE.md).

## Project Structure

```
read-it-later-anator/
├── backend/          # NestJS API server
├── frontend/         # Next.js web application
├── workers/          # Background job processors
├── shared/           # Shared types and utilities
├── infrastructure/   # IaC configuration
└── docs/            # Documentation
```

## Development Roadmap

### Phase 1: Core Features (Current)
- [x] Architecture design
- [ ] User authentication
- [ ] Article saving and storage
- [ ] Content extraction
- [ ] Basic UI for browsing articles

### Phase 2: AI Integration
- [ ] Claude API integration
- [ ] Automatic tagging
- [ ] Content analysis
- [ ] Embedding generation

### Phase 3: Advanced Features
- [ ] Semantic search
- [ ] Recommendations engine
- [ ] Digest generation
- [ ] Email notifications

### Phase 4: Extensions
- [ ] Browser extension
- [ ] Mobile apps
- [ ] RSS feed integration
- [ ] Social sharing

## API Example

```typescript
// Save an article
POST /api/articles
{
  "url": "https://example.com/article",
  "tags": ["javascript", "web-dev"]
}

// Get all articles
GET /api/articles?status=unread&tag=javascript

// Get article details with AI analysis
GET /api/articles/:id
{
  "articleId": "123",
  "title": "Understanding TypeScript",
  "url": "https://example.com/article",
  "status": "unread",
  "analysis": {
    "summary": "This article covers...",
    "topics": ["TypeScript", "JavaScript", "Types"],
    "tags": ["tutorial", "typescript", "beginner"],
    "keyInsights": [...]
  }
}

// Get personalized recommendations
GET /api/recommendations
```

## Contributing

Contributions are welcome! Please read our contributing guidelines (coming soon) before submitting PRs.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with [NestJS](https://nestjs.com) and [Next.js](https://nextjs.org)
- AI powered by [Anthropic Claude](https://anthropic.com)
- Inspired by Pocket, Instapaper, and similar services 
