#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { StorageStack } from '../lib/storage-stack';
import { QueueStack } from '../lib/queue-stack';

const app = new cdk.App();

// Get environment from context or default to 'dev'
const environment = app.node.tryGetContext('environment') || 'dev';

// Validate environment
const validEnvironments = ['dev', 'staging', 'prod'];
if (!validEnvironments.includes(environment)) {
  throw new Error(`Invalid environment: ${environment}. Must be one of: ${validEnvironments.join(', ')}`);
}

// Get AWS account and region from environment variables or CDK defaults
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || 'us-east-1';

console.log(`Deploying to environment: ${environment}`);
console.log(`AWS Account: ${account}`);
console.log(`AWS Region: ${region}`);

const stackProps = {
  env: {
    account,
    region,
  },
  environment,
  description: `Read-It-Later-Anator ${environment} infrastructure`,
};

// Database Stack
const databaseStack = new DatabaseStack(app, `ReadItLater-Database-${environment}`, stackProps);

// Storage Stack
const storageStack = new StorageStack(app, `ReadItLater-Storage-${environment}`, stackProps);

// Queue Stack
const queueStack = new QueueStack(app, `ReadItLater-Queue-${environment}`, stackProps);

// Add stack dependencies if needed
// queueStack.addDependency(databaseStack);

// Add global tags
cdk.Tags.of(app).add('Application', 'read-it-later-anator');
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'AWS-CDK');

app.synth();
