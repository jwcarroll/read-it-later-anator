# Deployment Guide

This guide covers deploying the Read-It-Later-Anator infrastructure using AWS CDK and GitHub Actions.

## Overview

The infrastructure uses AWS CDK v2 for Infrastructure as Code (IaC) and GitHub Actions for continuous deployment. Deployments are automatic when you push to specific branches.

## Infrastructure Components

The CDK app deploys three main stacks:

1. **Database Stack**: DynamoDB table with GSIs for single-table design
2. **Storage Stack**: S3 bucket for article content storage
3. **Queue Stack**: SQS queues for async processing with dead-letter queues

## Deployment Environments

- **dev**: Development environment (auto-deploys on push to `main` or `claude/**` branches)
- **staging**: Staging environment (manual deploy via workflow dispatch)
- **prod**: Production environment (manual deploy or commit with `[deploy-prod]` in message)

## Prerequisites

### AWS Account Setup

1. **Create AWS Account** (if you don't have one)
   - Go to https://aws.amazon.com
   - Sign up for an account

2. **Create IAM User for Deployments**
   ```bash
   # Using AWS CLI (if you have it)
   aws iam create-user --user-name github-actions-deployer
   ```

3. **Create Access Keys**
   - Go to IAM Console → Users → github-actions-deployer
   - Security credentials → Create access key
   - Choose "Application running outside AWS"
   - Save the Access Key ID and Secret Access Key

4. **Attach Required Policies**

   The user needs permissions to create/manage:
   - DynamoDB tables
   - S3 buckets
   - SQS queues
   - CloudWatch alarms
   - CloudFormation stacks
   - IAM roles (for CDK bootstrap)

   **Recommended Policies:**
   - `AdministratorAccess` (for initial setup, can be restricted later)

   **Or create a custom policy with minimum permissions:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "cloudformation:*",
           "dynamodb:*",
           "s3:*",
           "sqs:*",
           "cloudwatch:*",
           "iam:*",
           "ssm:GetParameter"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

5. **Bootstrap CDK** (one-time per account/region)
   ```bash
   # Install AWS CDK CLI
   npm install -g aws-cdk

   # Configure AWS credentials
   aws configure

   # Bootstrap CDK
   cd infrastructure
   cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

## GitHub Secrets Configuration

You need to configure the following secrets in your GitHub repository:

### Navigate to Secrets
1. Go to your repo: https://github.com/YOUR_USERNAME/read-it-later-anator
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"

### Required Secrets (Dev/Staging)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID for dev/staging | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key for dev/staging | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS Region to deploy to | `us-east-1` |
| `AWS_ACCOUNT_ID` | Your AWS Account ID | `123456789012` |

### Additional Secrets (Production)

For production deployments, use separate credentials:

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID_PROD` | AWS Access Key ID for production |
| `AWS_SECRET_ACCESS_KEY_PROD` | AWS Secret Access Key for production |
| `AWS_ACCOUNT_ID_PROD` | Production AWS Account ID |

### Finding Your AWS Account ID

```bash
# Using AWS CLI
aws sts get-caller-identity --query Account --output text

# Or visit IAM Console, it's shown in the top right
```

## Deployment Workflows

### Automatic Deployment to Dev

**Triggers:**
- Push to `main` branch with changes in `infrastructure/` folder
- Push to any `claude/**` branch with infrastructure changes

**What happens:**
1. Validates CDK code and runs synth
2. Deploys to dev environment
3. Creates/updates: DynamoDB table, S3 bucket, SQS queues

**How to trigger:**
```bash
# Make changes to infrastructure
cd infrastructure
# ... make changes ...

git add .
git commit -m "Update infrastructure"
git push origin main  # or your claude/xxx branch
```

### Manual Deployment (Any Environment)

**Triggers:**
- Manual workflow dispatch from GitHub Actions UI

**Steps:**
1. Go to Actions tab in GitHub
2. Select "Deploy Infrastructure" workflow
3. Click "Run workflow"
4. Select environment (dev, staging, prod)
5. Click "Run workflow"

### Production Deployment

**Method 1: Commit message trigger**
```bash
git commit -m "Infrastructure updates [deploy-prod]"
git push origin main
```

**Method 2: Manual workflow dispatch**
- Use the GitHub Actions UI and select "prod" environment

**Note:** Production deployments require GitHub environment protection rules (recommended):
1. Go to Settings → Environments → prod
2. Enable "Required reviewers"
3. Add yourself as a reviewer

## Local Development and Testing

### Install Dependencies

```bash
cd infrastructure
npm install
```

### Build TypeScript

```bash
npm run build
```

### Synthesize CloudFormation

```bash
npm run synth
```

This outputs CloudFormation templates to `cdk.out/` for review.

### Deploy Locally

```bash
# Deploy all stacks to dev
npm run deploy:dev

# Deploy all stacks to prod
npm run deploy:prod

# Deploy specific stack
npm run cdk deploy ReadItLater-Database-dev

# View diff before deploying
npm run diff
```

### Destroy Infrastructure

```bash
# Destroy all stacks in dev
npm run destroy

# Or use CDK directly
cdk destroy --all -c environment=dev
```

**Warning:** Be careful with destroy commands, especially in production!

## Stack Outputs

After deployment, CDK outputs important values you'll need for your application:

### Database Stack
- `TableName`: DynamoDB table name (e.g., `read-it-later-dev`)
- `TableArn`: Table ARN
- `TableStreamArn`: DynamoDB stream ARN

### Storage Stack
- `ContentBucketName`: S3 bucket name
- `ContentBucketArn`: S3 bucket ARN

### Queue Stack
- `ArticleProcessingQueueUrl`: SQS queue URL for article processing
- `ArticleProcessingQueueArn`: Queue ARN
- `DigestGenerationQueueUrl`: Digest queue URL
- `DigestGenerationQueueArn`: Digest queue ARN

### Viewing Outputs

```bash
# View outputs from AWS CLI
aws cloudformation describe-stacks \
  --stack-name ReadItLater-Database-dev \
  --query 'Stacks[0].Outputs'

# Or in AWS Console
# CloudFormation → Stacks → Select Stack → Outputs tab
```

## Environment Configuration

The CDK app reads the environment from context:

```bash
# Deploy to dev (default)
cdk deploy --all

# Deploy to staging
cdk deploy --all -c environment=staging

# Deploy to prod
cdk deploy --all -c environment=prod
```

## Cost Estimation

### Development Environment

**Estimated Monthly Cost: ~$5-10**

- DynamoDB: $0-5 (pay-per-request, depends on usage)
- S3: $0-2 (depends on storage and requests)
- SQS: $0-1 (1M requests free tier)
- CloudWatch: $0-2 (basic monitoring)

### Production Environment

Will scale with usage. Key cost drivers:
- DynamoDB read/write operations
- S3 storage and data transfer
- SQS requests
- Data transfer out

**Cost optimization tips:**
- Use DynamoDB on-demand pricing for unpredictable workloads
- Enable S3 lifecycle policies (already configured)
- Monitor CloudWatch costs

## Monitoring

### CloudWatch Alarms

The infrastructure includes alarms for:
- DLQ message visibility (alerts when messages fail processing)

### View in AWS Console

1. CloudWatch → Alarms
2. Look for alarms prefixed with `read-it-later-`

## Troubleshooting

### Deployment Fails: "Stack is in ROLLBACK_COMPLETE state"

```bash
# Delete the failed stack and try again
aws cloudformation delete-stack --stack-name ReadItLater-Database-dev
# Wait for deletion, then deploy again
```

### CDK Bootstrap Issues

```bash
# Re-bootstrap the environment
cdk bootstrap aws://ACCOUNT-ID/REGION --force
```

### Permission Denied Errors

Check that your IAM user has the required permissions. You may need to add more policies.

### GitHub Actions Fails

1. Check secrets are configured correctly
2. Verify AWS credentials are valid
3. Check CloudWatch Logs in AWS Console
4. Review GitHub Actions logs for detailed errors

## Security Best Practices

1. **Use separate AWS accounts for dev/prod** (recommended)
2. **Enable MFA** on AWS root account
3. **Rotate access keys** regularly
4. **Use least-privilege IAM policies** (refine from AdministratorAccess)
5. **Enable CloudTrail** for audit logging
6. **Review S3 bucket policies** before production
7. **Set up GitHub environment protection** for production

## Next Steps

After infrastructure is deployed:

1. **Note the stack outputs** (table names, bucket names, queue URLs)
2. **Update backend configuration** with these values
3. **Deploy backend application** (NestJS API)
4. **Deploy frontend application** (Next.js)
5. **Set up monitoring and alerts**
6. **Configure domain and SSL certificates** (for production)

## CI/CD Pipeline Flow

```
┌─────────────────┐
│  Push to GitHub │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   Triggered     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validate CDK   │
│  - npm ci       │
│  - npm build    │
│  - cdk synth    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Deploy CDK    │
│  - Configure    │
│    AWS creds    │
│  - cdk deploy   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AWS Creates    │
│  - DynamoDB     │
│  - S3           │
│  - SQS          │
└─────────────────┘
```

## Support

For issues or questions:
1. Check CloudFormation events in AWS Console
2. Review GitHub Actions logs
3. Check AWS CloudWatch Logs
4. Create an issue in the repository
