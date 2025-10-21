# Read-It-Later-Anator Architecture

## Overview

A modern read-it-later application with AI-powered article analysis, categorization, and personalized recommendations.

## Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **API Style**: REST (API-first design)
- **Database**: DynamoDB (Single-table design)
- **Message Queue**: AWS SQS (for async AI processing)
- **Storage**: S3 (for article content/snapshots)

### Frontend
- **Framework**: Next.js (React with TypeScript)
- **Rendering**: Server-Side Rendering (SSR) + Static Generation
- **API Communication**: REST client

### AI/ML
- **Content Analysis**: Anthropic Claude API
- **Embeddings**: OpenAI/Claude embeddings for semantic search
- **Processing**: Async workers for background analysis

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Save Article │  │  Browse/     │  │   Digests/   │      │
│  │     View     │  │  Search      │  │Recommendations│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/REST
┌──────────────────────────┴──────────────────────────────────┐
│                     NestJS API Gateway                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Authentication Module                    │   │
│  │         (JWT, User Management, API Keys)             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   Articles  │  │    Tags     │  │  Recommendations │   │
│  │   Module    │  │   Module    │  │      Module      │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   Content   │  │     AI      │  │     Digest       │   │
│  │   Fetcher   │  │   Analysis  │  │     Generator    │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└──────────────┬──────────────┬────────────────┬─────────────┘
               │              │                │
               │              │                └──────────┐
               │              │                           │
    ┌──────────▼─────┐   ┌───▼────────┐      ┌──────────▼────────┐
    │   DynamoDB     │   │  AWS SQS   │      │  Anthropic Claude │
    │ (Single-table) │   │  (Queues)  │      │       API         │
    └────────────────┘   └────────────┘      └───────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   AI Worker Pool   │
                    │  (Background Jobs) │
                    └────────────────────┘
```

## Core Modules

### 1. Articles Module
**Responsibilities:**
- CRUD operations for saved articles
- URL validation and normalization
- Article metadata management
- Search and filtering

**Key Endpoints:**
- `POST /api/articles` - Save new URL
- `GET /api/articles` - List articles (with filters)
- `GET /api/articles/:id` - Get article details
- `PATCH /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### 2. Content Fetcher Service
**Responsibilities:**
- Fetch article content from URLs
- Extract metadata (title, author, publish date)
- Extract main content (remove ads, navigation)
- Store snapshots in S3
- Handle different content types (articles, videos, PDFs)

**Technologies:**
- Puppeteer/Playwright for JavaScript-heavy sites
- Mercury Parser / Readability for content extraction
- S3 for content storage

### 3. AI Analysis Service
**Responsibilities:**
- Analyze article content
- Extract topics and themes
- Generate tags automatically
- Categorize articles
- Extract key insights
- Calculate content embeddings for similarity

**Processing Flow:**
1. Receive article from queue
2. Fetch content
3. Send to Claude API for analysis
4. Parse AI response
5. Update DynamoDB with analysis results

### 4. Tags Module
**Responsibilities:**
- Manage tag taxonomy
- Auto-tagging from AI analysis
- Manual tag management
- Tag suggestions

### 5. Recommendations Module
**Responsibilities:**
- Generate personalized article recommendations
- Track user reading patterns
- Use embeddings for semantic similarity
- Suggest related articles

### 6. Digest Generator
**Responsibilities:**
- Create periodic summaries (daily, weekly)
- Group articles by topic
- Generate AI summaries
- Email/push notification delivery

## DynamoDB Single-Table Design

### Access Patterns
1. Get user by ID
2. Get all articles for a user
3. Get articles by status (read/unread)
4. Get articles by tag
5. Get articles by date range
6. Get user's tags
7. Get recommended articles
8. Get digest history

### Table Schema

**Table Name:** `read-it-later`

**Primary Key:**
- PK (Partition Key): String
- SK (Sort Key): String

**GSIs:**
- GSI1: GSI1PK, GSI1SK (for tag queries)
- GSI2: GSI2PK, GSI2SK (for date-based queries)
- GSI3: GSI3PK, GSI3SK (for status queries)

### Entity Patterns

#### User Entity
```
PK: USER#<userId>
SK: PROFILE
Type: User
Attributes:
  - userId
  - email
  - name
  - createdAt
  - preferences
```

#### Article Entity
```
PK: USER#<userId>
SK: ARTICLE#<timestamp>#<articleId>
Type: Article
Attributes:
  - articleId
  - url
  - title
  - author
  - publishedDate
  - savedAt
  - status (unread/reading/read/archived)
  - contentS3Key
  - excerpt
  - estimatedReadTime
GSI1PK: USER#<userId>
GSI1SK: STATUS#<status>#<timestamp>
GSI2PK: USER#<userId>
GSI2SK: DATE#<YYYY-MM-DD>
```

#### Tag Entity
```
PK: USER#<userId>
SK: TAG#<tagName>
Type: Tag
Attributes:
  - tagName
  - articleCount
  - createdAt
  - isAuto (AI-generated vs manual)
```

#### Article-Tag Relationship
```
PK: ARTICLE#<articleId>
SK: TAG#<tagName>
Type: ArticleTag
Attributes:
  - confidence (for AI tags)
  - addedAt
GSI1PK: USER#<userId>#TAG#<tagName>
GSI1SK: ARTICLE#<timestamp>#<articleId>
```

#### AI Analysis Entity
```
PK: ARTICLE#<articleId>
SK: ANALYSIS
Type: Analysis
Attributes:
  - summary
  - topics[]
  - sentiment
  - keyInsights[]
  - embedding (for similarity)
  - processedAt
```

#### Digest Entity
```
PK: USER#<userId>
SK: DIGEST#<date>
Type: Digest
Attributes:
  - digestId
  - period (daily/weekly)
  - articleIds[]
  - summary
  - sentAt
```

## API Design

### RESTful Endpoints

#### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/profile
```

#### Articles
```
POST   /api/articles                    # Save new URL
GET    /api/articles                    # List (query params: status, tag, search)
GET    /api/articles/:id                # Get details
PATCH  /api/articles/:id                # Update (status, tags, notes)
DELETE /api/articles/:id                # Delete
GET    /api/articles/:id/content        # Get full content
GET    /api/articles/:id/similar        # Get similar articles
POST   /api/articles/:id/reanalyze      # Trigger re-analysis
```

#### Tags
```
GET    /api/tags                        # List all tags
POST   /api/tags                        # Create tag
GET    /api/tags/:name/articles         # Articles with tag
DELETE /api/tags/:name                  # Delete tag
```

#### Recommendations
```
GET    /api/recommendations             # Get personalized recommendations
GET    /api/recommendations/trending    # Trending in user's interests
```

#### Digests
```
GET    /api/digests                     # List past digests
GET    /api/digests/:id                 # Get digest
POST   /api/digests/generate            # Generate new digest
PATCH  /api/digests/settings            # Update digest preferences
```

#### Search
```
GET    /api/search?q=<query>            # Full-text and semantic search
```

## AI Processing Pipeline

### 1. URL Ingestion Flow
```
User saves URL
    ↓
API receives request
    ↓
Create article record (status: pending)
    ↓
Return articleId to user
    ↓
Queue for processing (SQS)
    ↓
Worker picks up job
    ↓
Fetch content
    ↓
Store in S3
    ↓
Update status: processing
    ↓
Send to Claude API
    ↓
Parse AI response
    ↓
Store analysis results
    ↓
Update status: ready
    ↓
Trigger recommendation refresh
```

### 2. AI Analysis Prompt Structure
```typescript
{
  task: "analyze-article",
  content: "<article text>",
  instructions: [
    "Summarize the main points in 2-3 sentences",
    "Identify 3-7 relevant topics/themes",
    "Generate 5-10 descriptive tags",
    "Suggest a category from: [Technology, Science, Business, etc.]",
    "Extract 3-5 key insights",
    "Rate the content type: [Tutorial, Opinion, News, Research, etc.]"
  ]
}
```

### 3. Recommendation Algorithm
- Calculate article embeddings using Claude/OpenAI
- Use cosine similarity for related articles
- Weight by user's reading history
- Factor in recency and popularity
- Diversify by topic to avoid echo chamber

## Data Flow Examples

### Example 1: Save New Article
```
1. POST /api/articles
   Body: { url: "https://example.com/article" }

2. NestJS validates & creates record
   DynamoDB: Insert with status="pending"

3. Return response immediately
   { articleId: "123", status: "pending" }

4. Queue message to SQS
   { articleId: "123", url: "..." }

5. Worker processes:
   - Fetch content
   - Upload to S3
   - Call Claude API
   - Store analysis
   - Update status="ready"

6. Frontend polls or uses WebSocket for updates
```

### Example 2: Generate Weekly Digest
```
1. Scheduled job (cron) triggers
   Every Sunday at 9 AM

2. For each user:
   - Query articles from past week
   - Group by topic/tag
   - Generate summary with Claude
   - Create digest record
   - Send email/notification

3. Store digest for later viewing
```

## Security Considerations

- JWT-based authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- URL allowlist/blocklist
- Content security policy
- API key rotation
- Encryption at rest (DynamoDB, S3)
- HTTPS only

## Scalability Considerations

- Async processing via SQS
- DynamoDB auto-scaling
- S3 for unlimited content storage
- CDN for static assets (Next.js)
- Worker pool auto-scaling based on queue depth
- Caching layer (Redis) for frequently accessed data

## Monitoring & Observability

- CloudWatch for logs and metrics
- Custom metrics:
  - Articles saved per day
  - Processing time per article
  - AI API costs
  - User engagement metrics
- Error tracking (Sentry)
- Performance monitoring (New Relic/DataDog)

## Future Enhancements

1. **Browser Extension**: Quick-save from any webpage
2. **Mobile Apps**: iOS/Android native apps
3. **Social Features**: Share recommendations, collaborative collections
4. **RSS Integration**: Auto-import from RSS feeds
5. **Highlights & Annotations**: In-app reading with notes
6. **Audio Summaries**: Text-to-speech digests
7. **Integration APIs**: Zapier, IFTTT, Slack
8. **Collaborative Collections**: Share article lists with others
