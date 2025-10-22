# Read-It-Later-Anator Setup Guide

This guide walks through setting up the development environment and implementing the initial project structure.

## Prerequisites

- Node.js 18+ and npm/yarn
- AWS Account (for DynamoDB, SQS, S3)
- Anthropic API key (for Claude)
- Git

## Project Structure

```
read-it-later-anator/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── articles/
│   │   │   ├── auth/
│   │   │   ├── tags/
│   │   │   ├── recommendations/
│   │   │   ├── digests/
│   │   │   └── ai/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── pipes/
│   │   ├── config/
│   │   ├── database/
│   │   │   └── dynamodb/
│   │   ├── queues/
│   │   └── main.ts
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/                # Next.js app
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── styles/
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
├── workers/                 # Background job processors
│   ├── src/
│   │   ├── content-fetcher/
│   │   ├── ai-analyzer/
│   │   └── digest-generator/
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                  # Shared types and utilities
│   ├── src/
│   │   ├── types/
│   │   ├── constants/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
│
├── infrastructure/          # IaC (Terraform/CDK)
│   ├── dynamodb.tf
│   ├── sqs.tf
│   ├── s3.tf
│   └── iam.tf
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DYNAMODB_QUERIES.md
│   └── API_SPEC.md
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml       # Local development
├── .env.example
├── package.json             # Root workspace
└── README.md
```

## Step 1: Initialize Monorepo

```bash
# Initialize root package.json
npm init -y

# Set up workspaces
# Edit package.json to add:
{
  "name": "read-it-later-anator",
  "private": true,
  "workspaces": [
    "backend",
    "frontend",
    "workers",
    "shared"
  ],
  "scripts": {
    "dev:backend": "npm run start:dev --workspace=backend",
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:workers": "npm run start:dev --workspace=workers",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  }
}
```

## Step 2: Set Up Backend (NestJS)

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize NestJS project
npx @nestjs/cli new . --skip-git

# Install dependencies
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
npm install @aws-sdk/client-s3 @aws-sdk/client-sqs
npm install @anthropic-ai/sdk
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install passport passport-jwt bcrypt
npm install class-validator class-transformer
npm install @nestjs/throttler

# Install dev dependencies
npm install -D @types/passport-jwt @types/bcrypt
```

### Backend Configuration

Create `backend/src/config/configuration.ts`:

```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    tableName: process.env.DYNAMODB_TABLE || 'read-it-later',
    region: process.env.AWS_REGION || 'us-east-1',
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.S3_BUCKET || 'read-it-later-content',
    sqsQueueUrl: process.env.SQS_QUEUE_URL,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },
});
```

## Step 3: Set Up Frontend (Next.js)

```bash
# From root directory
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir

cd frontend

# Install additional dependencies
npm install @tanstack/react-query
npm install axios
npm install zustand
npm install @headlessui/react @heroicons/react
npm install date-fns
```

### Frontend Configuration

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Step 4: Set Up Shared Package

```bash
# From root directory
mkdir shared
cd shared

# Initialize package
npm init -y

# Install TypeScript
npm install -D typescript

# Create tsconfig.json
npx tsc --init
```

Create `shared/src/types/index.ts`:

```typescript
export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  digestFrequency: 'daily' | 'weekly' | 'monthly';
  emailNotifications: boolean;
  autoTag: boolean;
}

export interface Article {
  articleId: string;
  userId: string;
  url: string;
  title: string;
  author?: string;
  publishedDate?: string;
  savedAt: string;
  status: ArticleStatus;
  contentS3Key?: string;
  excerpt?: string;
  estimatedReadTime?: number;
  tags?: string[];
  readAt?: string;
}

export type ArticleStatus = 'pending' | 'processing' | 'ready' | 'unread' | 'reading' | 'read' | 'archived';

export interface Tag {
  tagName: string;
  articleCount: number;
  createdAt: string;
  isAuto: boolean;
}

export interface ArticleTag {
  articleId: string;
  tagName: string;
  confidence?: number;
  addedAt: string;
}

export interface Analysis {
  summary: string;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  keyInsights: string[];
  category: string;
  contentType: string;
  embedding?: number[];
  processedAt: string;
}

export interface Digest {
  digestId: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  articleIds: string[];
  summary: string;
  topTopics: string[];
  createdAt: string;
  sentAt?: string;
}

export interface SaveArticleDto {
  url: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateArticleDto {
  status?: ArticleStatus;
  tags?: string[];
  notes?: string;
}

export interface ArticleListQuery {
  status?: ArticleStatus;
  tag?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  lastKey?: string;
}
```

## Step 5: Local Development with DynamoDB Local

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  dynamodb-local:
    image: amazon/dynamodb-local:latest
    container_name: dynamodb-local
    ports:
      - "8000:8000"
    command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"
    volumes:
      - ./data/dynamodb:/home/dynamodblocal/data
    working_dir: /home/dynamodblocal

  dynamodb-admin:
    image: aaronshaf/dynamodb-admin:latest
    container_name: dynamodb-admin
    ports:
      - "8001:8001"
    environment:
      - DYNAMO_ENDPOINT=http://dynamodb-local:8000
    depends_on:
      - dynamodb-local

  localstack:
    image: localstack/localstack:latest
    container_name: localstack
    ports:
      - "4566:4566"  # LocalStack edge port
      - "4571:4571"  # S3
    environment:
      - SERVICES=s3,sqs
      - DEBUG=1
      - DATA_DIR=/tmp/localstack/data
    volumes:
      - "./data/localstack:/tmp/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"
```

Start local services:

```bash
docker-compose up -d
```

## Step 6: Create DynamoDB Table Locally

Create `backend/scripts/create-table.ts`:

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
});

const createTable = async () => {
  const command = new CreateTableCommand({
    TableName: 'read-it-later',
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'GSI1PK', AttributeType: 'S' },
      { AttributeName: 'GSI1SK', AttributeType: 'S' },
      { AttributeName: 'GSI2PK', AttributeType: 'S' },
      { AttributeName: 'GSI2SK', AttributeType: 'S' },
      { AttributeName: 'GSI3PK', AttributeType: 'S' },
      { AttributeName: 'GSI3SK', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'GSI1PK', KeyType: 'HASH' },
          { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
      {
        IndexName: 'GSI2',
        KeySchema: [
          { AttributeName: 'GSI2PK', KeyType: 'HASH' },
          { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
      {
        IndexName: 'GSI3',
        KeySchema: [
          { AttributeName: 'GSI3PK', KeyType: 'HASH' },
          { AttributeName: 'GSI3SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  });

  try {
    const response = await client.send(command);
    console.log('Table created successfully:', response);
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

createTable();
```

Add to `backend/package.json`:

```json
{
  "scripts": {
    "db:create": "ts-node scripts/create-table.ts"
  }
}
```

## Step 7: Environment Variables

Create `.env.example`:

```env
# Application
NODE_ENV=development
PORT=3000

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
DYNAMODB_TABLE=read-it-later
DYNAMODB_ENDPOINT=http://localhost:8000
S3_BUCKET=read-it-later-content
S3_ENDPOINT=http://localhost:4566
SQS_QUEUE_URL=http://localhost:4566/000000000000/article-processing

# Anthropic
ANTHROPIC_API_KEY=your-api-key-here

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Step 8: Development Workflow

```bash
# Start local services
docker-compose up -d

# Create DynamoDB table
cd backend
npm run db:create

# Start backend
npm run start:dev

# In another terminal, start frontend
cd frontend
npm run dev

# Visit:
# - Frontend: http://localhost:3001
# - Backend API: http://localhost:3000
# - DynamoDB Admin: http://localhost:8001
```

## Step 9: Testing Setup

### Backend Testing

```bash
cd backend
npm install -D @nestjs/testing jest @types/jest ts-jest
```

Create `backend/test/articles.e2e-spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ArticlesController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/articles (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/articles')
      .send({ url: 'https://example.com/article' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Step 10: CI/CD Setup

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      dynamodb:
        image: amazon/dynamodb-local
        ports:
          - 8000:8000

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
```

## Next Steps

1. **Implement Core Modules**: Start with authentication and articles modules
2. **Set Up Content Fetching**: Integrate Puppeteer/Playwright for web scraping
3. **Integrate Claude API**: Implement AI analysis service
4. **Build Frontend Components**: Create UI for saving and browsing articles
5. **Set Up Queue Processing**: Implement SQS workers
6. **Deploy to AWS**: Set up production infrastructure

## Useful Commands

```bash
# Development
npm run dev:backend          # Start backend
npm run dev:frontend         # Start frontend
npm run dev:workers          # Start workers

# Database
npm run db:create            # Create DynamoDB table
npm run db:seed              # Seed test data
npm run db:migrate           # Run migrations

# Testing
npm test                     # Run all tests
npm run test:watch          # Watch mode
npm run test:e2e            # E2E tests
npm run test:cov            # Coverage

# Building
npm run build               # Build all workspaces
npm run build:backend       # Build backend only
npm run build:frontend      # Build frontend only

# Linting
npm run lint                # Lint all
npm run lint:fix            # Fix linting issues
```

## Troubleshooting

### DynamoDB Connection Issues
```bash
# Check if DynamoDB Local is running
docker ps | grep dynamodb

# Restart DynamoDB Local
docker-compose restart dynamodb-local

# View DynamoDB Admin
open http://localhost:8001
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS SDK v3 for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [DynamoDB Single-Table Design](https://www.alexdebrie.com/posts/dynamodb-single-table/)
- [Anthropic Claude API](https://docs.anthropic.com)
