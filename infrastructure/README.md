# Read-It-Later-Anator Infrastructure

AWS CDK v2 infrastructure for the Read-It-Later-Anator application.

## Overview

This directory contains the AWS CDK code that provisions all infrastructure for the application:

- **DynamoDB**: Single-table design with Global Secondary Indexes
- **S3**: Content storage for article snapshots
- **SQS**: Message queues for async processing
- **CloudWatch**: Monitoring and alarms

## Quick Start

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Synthesize CloudFormation

```bash
npm run synth
```

### Deploy to Dev

```bash
npm run deploy:dev
```

### Deploy to Production

```bash
npm run deploy:prod
```

## Stacks

### DatabaseStack
- DynamoDB table: `read-it-later-{environment}`
- 3 Global Secondary Indexes for efficient querying
- Streams enabled for change data capture
- TTL enabled for temporary data

### StorageStack
- S3 bucket: `read-it-later-content-{environment}-{account-id}`
- Encryption at rest
- Lifecycle policies for cost optimization
- CORS configuration for frontend access

### QueueStack
- Article processing queue with DLQ
- Digest generation queue with DLQ
- CloudWatch alarms for failed messages

## Environments

- **dev**: Development environment (default)
- **staging**: Staging environment
- **prod**: Production environment

Specify environment with context:
```bash
cdk deploy --all -c environment=prod
```

## Project Structure

```
infrastructure/
├── bin/
│   └── app.ts              # CDK app entry point
├── lib/
│   ├── database-stack.ts   # DynamoDB table
│   ├── storage-stack.ts    # S3 buckets
│   └── queue-stack.ts      # SQS queues
├── cdk.json               # CDK configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Useful Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile
- `npm run synth` - Synthesize CloudFormation templates
- `npm run deploy` - Deploy all stacks
- `npm run deploy:dev` - Deploy to dev environment
- `npm run deploy:prod` - Deploy to prod environment
- `npm run diff` - Compare deployed stack with current state
- `npm run destroy` - Destroy all stacks

## CDK Bootstrap

Before first deployment, bootstrap your AWS account:

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

## Deployment

### Automatic (GitHub Actions)

Infrastructure deploys automatically via GitHub Actions when:
- Pushing to `main` or `claude/**` branches (deploys to dev)
- Manual workflow dispatch (any environment)
- Commit message contains `[deploy-prod]` (deploys to prod)

See [DEPLOYMENT.md](../docs/DEPLOYMENT.md) for full details.

### Manual

```bash
# Deploy to dev
npm run deploy:dev

# Deploy to staging
cdk deploy --all -c environment=staging

# Deploy to prod
npm run deploy:prod
```

## Stack Outputs

After deployment, note these outputs for application configuration:

- `TableName`: DynamoDB table name
- `ContentBucketName`: S3 bucket name
- `ArticleProcessingQueueUrl`: SQS queue URL
- `DigestGenerationQueueUrl`: Digest queue URL

View outputs:
```bash
aws cloudformation describe-stacks \
  --stack-name ReadItLater-Database-dev \
  --query 'Stacks[0].Outputs'
```

## Cost Considerations

### Development
- DynamoDB: Pay-per-request (minimal cost for testing)
- S3: First 5GB free
- SQS: 1M requests/month free
- **Estimated**: $5-10/month

### Production
- Costs scale with usage
- Monitor via AWS Cost Explorer
- S3 lifecycle rules reduce storage costs
- DynamoDB on-demand suitable for variable traffic

## Monitoring

CloudWatch alarms are automatically created for:
- Dead Letter Queue message visibility
- Queue depth thresholds

View alarms in AWS Console → CloudWatch → Alarms

## Security

- All data encrypted at rest
- S3 blocks public access by default
- IAM policies follow least-privilege principle
- Separate AWS accounts recommended for prod

## Development

### Adding a New Stack

1. Create new stack in `lib/`
2. Import in `bin/app.ts`
3. Instantiate with proper props
4. Test with `npm run synth`
5. Deploy with `npm run deploy:dev`

### Modifying Existing Stacks

1. Make changes to stack file
2. View diff: `npm run diff`
3. Deploy changes: `npm run deploy:dev`
4. Verify in AWS Console

## Troubleshooting

### CDK Version Mismatch
```bash
npm install -g aws-cdk@latest
npm update
```

### Bootstrap Issues
```bash
cdk bootstrap --force
```

### Stack in Rollback State
```bash
aws cloudformation delete-stack --stack-name STACK-NAME
# Then deploy again
```

## Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)
- [Deployment Guide](../docs/DEPLOYMENT.md)
