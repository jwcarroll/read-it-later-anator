import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  environment: string;
}

export class DatabaseStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // Main DynamoDB table with single-table design
    this.table = new dynamodb.Table(this, 'ReadItLaterTable', {
      tableName: `read-it-later-${environment}`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: environment === 'prod',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: 'ttl',
    });

    // GSI1: For status-based queries
    // Example: Get all unread articles for a user
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: {
        name: 'GSI1PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI1SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI2: For date-based queries
    // Example: Get articles saved in a specific date range
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: {
        name: 'GSI2PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI2SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI3: For tag-based queries and search
    // Example: Get all articles with a specific tag
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI3',
      partitionKey: {
        name: 'GSI3PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI3SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Outputs
    new cdk.CfnOutput(this, 'TableName', {
      value: this.table.tableName,
      description: 'DynamoDB table name',
      exportName: `${environment}-TableName`,
    });

    new cdk.CfnOutput(this, 'TableArn', {
      value: this.table.tableArn,
      description: 'DynamoDB table ARN',
      exportName: `${environment}-TableArn`,
    });

    new cdk.CfnOutput(this, 'TableStreamArn', {
      value: this.table.tableStreamArn || 'N/A',
      description: 'DynamoDB table stream ARN',
      exportName: `${environment}-TableStreamArn`,
    });

    // Tags
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('Project', 'read-it-later-anator');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}
