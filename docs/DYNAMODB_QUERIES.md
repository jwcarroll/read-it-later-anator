# DynamoDB Query Examples

This document provides practical query examples for the single-table design.

## Table Definition

```typescript
// DynamoDB Table Configuration
{
  TableName: 'read-it-later',
  KeySchema: [
    { AttributeName: 'PK', KeyType: 'HASH' },
    { AttributeName: 'SK', KeyType: 'RANGE' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'PK', AttributeType: 'S' },
    { AttributeName: 'SK', AttributeType: 'S' },
    { AttributeName: 'GSI1PK', AttributeType: 'S' },
    { AttributeName: 'GSI1SK', AttributeType: 'S' },
    { AttributeName: 'GSI2PK', AttributeType: 'S' },
    { AttributeName: 'GSI2SK', AttributeType: 'S' },
    { AttributeName: 'GSI3PK', AttributeType: 'S' },
    { AttributeName: 'GSI3SK', AttributeType: 'S' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'GSI1',
      KeySchema: [
        { AttributeName: 'GSI1PK', KeyType: 'HASH' },
        { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
      ],
      Projection: { ProjectionType: 'ALL' }
    },
    {
      IndexName: 'GSI2',
      KeySchema: [
        { AttributeName: 'GSI2PK', KeyType: 'HASH' },
        { AttributeName: 'GSI2SK', KeyType: 'RANGE' }
      ],
      Projection: { ProjectionType: 'ALL' }
    },
    {
      IndexName: 'GSI3',
      KeySchema: [
        { AttributeName: 'GSI3PK', KeyType: 'HASH' },
        { AttributeName: 'GSI3SK', KeyType: 'RANGE' }
      ],
      Projection: { ProjectionType: 'ALL' }
    }
  ],
  BillingMode: 'PAY_PER_REQUEST'
}
```

## Common Query Patterns

### 1. Get User Profile

```typescript
// Get user by ID
const params = {
  TableName: 'read-it-later',
  Key: {
    PK: 'USER#123',
    SK: 'PROFILE'
  }
};

const result = await dynamoDB.get(params);
```

### 2. Save New Article

```typescript
const timestamp = Date.now();
const articleId = generateId(); // UUID or similar

const params = {
  TableName: 'read-it-later',
  Item: {
    PK: 'USER#123',
    SK: `ARTICLE#${timestamp}#${articleId}`,
    Type: 'Article',
    articleId: articleId,
    userId: '123',
    url: 'https://example.com/article',
    title: 'Example Article',
    status: 'pending',
    savedAt: new Date().toISOString(),

    // GSI1: For status-based queries
    GSI1PK: 'USER#123',
    GSI1SK: `STATUS#pending#${timestamp}`,

    // GSI2: For date-based queries
    GSI2PK: 'USER#123',
    GSI2SK: `DATE#${new Date().toISOString().split('T')[0]}#${timestamp}`,

    // GSI3: For full-text search (if needed)
    GSI3PK: 'USER#123',
    GSI3SK: `ARTICLE#${articleId}`
  }
};

await dynamoDB.put(params);
```

### 3. Get All Articles for a User

```typescript
// Get all articles, sorted by save time (newest first)
const params = {
  TableName: 'read-it-later',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': 'USER#123',
    ':sk': 'ARTICLE#'
  },
  ScanIndexForward: false, // Descending order (newest first)
  Limit: 20 // Pagination
};

const result = await dynamoDB.query(params);
```

### 4. Get Articles by Status (Unread, Read, etc.)

```typescript
// Get all unread articles using GSI1
const params = {
  TableName: 'read-it-later',
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': 'USER#123',
    ':sk': 'STATUS#unread#'
  },
  ScanIndexForward: false
};

const result = await dynamoDB.query(params);
```

### 5. Get Articles by Date Range

```typescript
// Get articles saved in a specific date range using GSI2
const params = {
  TableName: 'read-it-later',
  IndexName: 'GSI2',
  KeyConditionExpression: 'GSI2PK = :pk AND GSI2SK BETWEEN :start AND :end',
  ExpressionAttributeValues: {
    ':pk': 'USER#123',
    ':start': 'DATE#2025-10-01',
    ':end': 'DATE#2025-10-31'
  }
};

const result = await dynamoDB.query(params);
```

### 6. Update Article Status

```typescript
// Update article from unread to read
const oldTimestamp = 1729500000000;
const newTimestamp = Date.now();
const articleId = 'abc-123';

const params = {
  TableName: 'read-it-later',
  Key: {
    PK: 'USER#123',
    SK: `ARTICLE#${oldTimestamp}#${articleId}`
  },
  UpdateExpression: 'SET #status = :status, GSI1SK = :gsi1sk, readAt = :readAt',
  ExpressionAttributeNames: {
    '#status': 'status'
  },
  ExpressionAttributeValues: {
    ':status': 'read',
    ':gsi1sk': `STATUS#read#${newTimestamp}`,
    ':readAt': new Date().toISOString()
  }
};

await dynamoDB.update(params);
```

### 7. Add Tags to Article

```typescript
// Create article-tag relationship
const params = {
  TableName: 'read-it-later',
  Item: {
    PK: 'ARTICLE#abc-123',
    SK: 'TAG#javascript',
    Type: 'ArticleTag',
    articleId: 'abc-123',
    tagName: 'javascript',
    userId: '123',
    confidence: 0.95, // AI confidence score
    addedAt: new Date().toISOString(),
    isAuto: true,

    // GSI1: For getting all articles with a specific tag
    GSI1PK: 'USER#123#TAG#javascript',
    GSI1SK: `ARTICLE#${Date.now()}#abc-123`
  }
};

await dynamoDB.put(params);

// Also update or create the tag entity
const tagParams = {
  TableName: 'read-it-later',
  Key: {
    PK: 'USER#123',
    SK: 'TAG#javascript'
  },
  UpdateExpression: 'SET articleCount = if_not_exists(articleCount, :zero) + :inc, #type = :type',
  ExpressionAttributeNames: {
    '#type': 'Type'
  },
  ExpressionAttributeValues: {
    ':zero': 0,
    ':inc': 1,
    ':type': 'Tag'
  }
};

await dynamoDB.update(tagParams);
```

### 8. Get All Articles with Specific Tag

```typescript
// Using GSI1 to find all articles tagged with "javascript"
const params = {
  TableName: 'read-it-later',
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': 'USER#123#TAG#javascript',
    ':sk': 'ARTICLE#'
  },
  ScanIndexForward: false
};

const result = await dynamoDB.query(params);
```

### 9. Get All Tags for User

```typescript
const params = {
  TableName: 'read-it-later',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': 'USER#123',
    ':sk': 'TAG#'
  }
};

const result = await dynamoDB.query(params);
```

### 10. Get All Tags for an Article

```typescript
const params = {
  TableName: 'read-it-later',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': 'ARTICLE#abc-123',
    ':sk': 'TAG#'
  }
};

const result = await dynamoDB.query(params);
```

### 11. Store AI Analysis

```typescript
const params = {
  TableName: 'read-it-later',
  Item: {
    PK: 'ARTICLE#abc-123',
    SK: 'ANALYSIS',
    Type: 'Analysis',
    summary: 'This article discusses...',
    topics: ['JavaScript', 'Web Development', 'TypeScript'],
    sentiment: 'positive',
    keyInsights: [
      'TypeScript improves code quality',
      'Static typing catches errors early',
      'Better IDE support'
    ],
    category: 'Technology',
    contentType: 'Tutorial',
    embedding: [0.123, 0.456, ...], // Vector embedding
    processedAt: new Date().toISOString(),
    processingTimeMs: 1234
  }
};

await dynamoDB.put(params);
```

### 12. Get Article with Analysis

```typescript
// Batch get to fetch article and analysis together
const params = {
  RequestItems: {
    'read-it-later': {
      Keys: [
        {
          PK: 'USER#123',
          SK: 'ARTICLE#1729500000000#abc-123'
        },
        {
          PK: 'ARTICLE#abc-123',
          SK: 'ANALYSIS'
        }
      ]
    }
  }
};

const result = await dynamoDB.batchGet(params);
```

### 13. Create Digest

```typescript
const params = {
  TableName: 'read-it-later',
  Item: {
    PK: 'USER#123',
    SK: 'DIGEST#2025-10-21',
    Type: 'Digest',
    digestId: generateId(),
    period: 'weekly',
    articleIds: ['abc-123', 'def-456', 'ghi-789'],
    summary: 'This week you saved 15 articles...',
    topTopics: ['JavaScript', 'AI', 'DevOps'],
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString()
  }
};

await dynamoDB.put(params);
```

### 14. Get User's Digests

```typescript
const params = {
  TableName: 'read-it-later',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': 'USER#123',
    ':sk': 'DIGEST#'
  },
  ScanIndexForward: false,
  Limit: 10
};

const result = await dynamoDB.query(params);
```

### 15. Delete Article (and related data)

```typescript
// Need to delete multiple items:
// 1. Article itself
// 2. All tags
// 3. Analysis

// First, get all tags for the article
const tagsResult = await dynamoDB.query({
  TableName: 'read-it-later',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': 'ARTICLE#abc-123',
    ':sk': 'TAG#'
  }
});

// Build batch delete
const deleteRequests = [
  // Delete article
  {
    DeleteRequest: {
      Key: {
        PK: 'USER#123',
        SK: 'ARTICLE#1729500000000#abc-123'
      }
    }
  },
  // Delete analysis
  {
    DeleteRequest: {
      Key: {
        PK: 'ARTICLE#abc-123',
        SK: 'ANALYSIS'
      }
    }
  },
  // Delete all tags
  ...tagsResult.Items.map(tag => ({
    DeleteRequest: {
      Key: {
        PK: tag.PK,
        SK: tag.SK
      }
    }
  }))
];

// Execute batch delete (max 25 items at a time)
const params = {
  RequestItems: {
    'read-it-later': deleteRequests
  }
};

await dynamoDB.batchWrite(params);
```

## Advanced Queries

### Search by Multiple Filters

```typescript
// Get unread articles with specific tag from last week
// This requires combining results from multiple queries
// or using filter expressions (less efficient)

const params = {
  TableName: 'read-it-later',
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
  FilterExpression: 'contains(tags, :tag)',
  ExpressionAttributeValues: {
    ':pk': 'USER#123',
    ':sk': 'STATUS#unread#',
    ':tag': 'javascript'
  }
};

const result = await dynamoDB.query(params);
```

### Get Reading Statistics

```typescript
// Count articles by status
const statuses = ['unread', 'reading', 'read', 'archived'];
const counts = {};

for (const status of statuses) {
  const params = {
    TableName: 'read-it-later',
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': 'USER#123',
      ':sk': `STATUS#${status}#`
    },
    Select: 'COUNT'
  };

  const result = await dynamoDB.query(params);
  counts[status] = result.Count;
}
```

## Best Practices

### 1. Use Batch Operations
When fetching multiple items, use `batchGet` instead of multiple `get` calls:

```typescript
const params = {
  RequestItems: {
    'read-it-later': {
      Keys: articleIds.map(id => ({
        PK: 'USER#123',
        SK: `ARTICLE#${timestamps[id]}#${id}`
      }))
    }
  }
};
```

### 2. Pagination
Always implement pagination for list queries:

```typescript
let items = [];
let lastEvaluatedKey = null;

do {
  const params = {
    TableName: 'read-it-later',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': 'USER#123',
      ':sk': 'ARTICLE#'
    },
    Limit: 20,
    ExclusiveStartKey: lastEvaluatedKey
  };

  const result = await dynamoDB.query(params);
  items = items.concat(result.Items);
  lastEvaluatedKey = result.LastEvaluatedKey;
} while (lastEvaluatedKey);
```

### 3. Projection Expressions
Only fetch needed attributes to reduce cost:

```typescript
const params = {
  TableName: 'read-it-later',
  Key: { PK: 'USER#123', SK: 'ARTICLE#123' },
  ProjectionExpression: 'title, url, savedAt, #status',
  ExpressionAttributeNames: {
    '#status': 'status' // status is a reserved word
  }
};
```

### 4. Conditional Writes
Prevent race conditions:

```typescript
const params = {
  TableName: 'read-it-later',
  Item: { ... },
  ConditionExpression: 'attribute_not_exists(PK)'
};
```

### 5. TTL for Temporary Data
Enable TTL for items that should auto-expire:

```typescript
const params = {
  TableName: 'read-it-later',
  Item: {
    PK: 'SESSION#abc',
    SK: 'DATA',
    ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Expire in 24h
  }
};
```

## TypeScript Helper Functions

```typescript
// Generate partition key for user
export const userPK = (userId: string) => `USER#${userId}`;

// Generate sort key for article
export const articleSK = (timestamp: number, articleId: string) =>
  `ARTICLE#${timestamp}#${articleId}`;

// Generate GSI1SK for status queries
export const statusGSI1SK = (status: string, timestamp: number) =>
  `STATUS#${status}#${timestamp}`;

// Generate GSI2SK for date queries
export const dateGSI2SK = (date: string, timestamp: number) =>
  `DATE#${date}#${timestamp}`;

// Parse article SK to extract metadata
export const parseArticleSK = (sk: string) => {
  const [, timestamp, articleId] = sk.split('#');
  return { timestamp: parseInt(timestamp), articleId };
};
```
