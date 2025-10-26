import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface StorageStackProps extends cdk.StackProps {
  environment: string;
}

export class StorageStack extends cdk.Stack {
  public readonly contentBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // Content storage bucket for article snapshots and media
    this.contentBucket = new s3.Bucket(this, 'ContentBucket', {
      bucketName: `read-it-later-content-${environment}-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: environment === 'prod',
      removalPolicy: environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
      lifecycleRules: [
        {
          id: 'DeleteOldVersions',
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(90),
        },
        {
          id: 'TransitionToIA',
          enabled: environment === 'prod',
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(90),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(180),
            },
          ],
        },
      ],
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
          ],
          allowedOrigins: ['*'], // TODO: Restrict in production
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // Outputs
    new cdk.CfnOutput(this, 'ContentBucketName', {
      value: this.contentBucket.bucketName,
      description: 'S3 bucket for article content storage',
      exportName: `${environment}-ContentBucketName`,
    });

    new cdk.CfnOutput(this, 'ContentBucketArn', {
      value: this.contentBucket.bucketArn,
      description: 'S3 bucket ARN',
      exportName: `${environment}-ContentBucketArn`,
    });

    // Tags
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('Project', 'read-it-later-anator');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}
