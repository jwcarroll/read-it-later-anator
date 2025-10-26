import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface QueueStackProps extends cdk.StackProps {
  environment: string;
}

export class QueueStack extends cdk.Stack {
  public readonly articleProcessingQueue: sqs.Queue;
  public readonly articleProcessingDLQ: sqs.Queue;
  public readonly digestGenerationQueue: sqs.Queue;
  public readonly digestGenerationDLQ: sqs.Queue;

  constructor(scope: Construct, id: string, props: QueueStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // Dead Letter Queue for article processing
    this.articleProcessingDLQ = new sqs.Queue(this, 'ArticleProcessingDLQ', {
      queueName: `read-it-later-article-processing-dlq-${environment}`,
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
    });

    // Main queue for article processing (content fetch + AI analysis)
    this.articleProcessingQueue = new sqs.Queue(this, 'ArticleProcessingQueue', {
      queueName: `read-it-later-article-processing-${environment}`,
      visibilityTimeout: cdk.Duration.minutes(15), // Enough time for AI processing
      receiveMessageWaitTime: cdk.Duration.seconds(20), // Long polling
      retentionPeriod: cdk.Duration.days(4),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      deadLetterQueue: {
        queue: this.articleProcessingDLQ,
        maxReceiveCount: 3,
      },
    });

    // Dead Letter Queue for digest generation
    this.digestGenerationDLQ = new sqs.Queue(this, 'DigestGenerationDLQ', {
      queueName: `read-it-later-digest-generation-dlq-${environment}`,
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
    });

    // Queue for digest generation
    this.digestGenerationQueue = new sqs.Queue(this, 'DigestGenerationQueue', {
      queueName: `read-it-later-digest-generation-${environment}`,
      visibilityTimeout: cdk.Duration.minutes(10),
      receiveMessageWaitTime: cdk.Duration.seconds(20),
      retentionPeriod: cdk.Duration.days(4),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      deadLetterQueue: {
        queue: this.digestGenerationDLQ,
        maxReceiveCount: 2,
      },
    });

    // CloudWatch Alarms for DLQ monitoring (only in production to save costs)
    if (environment === 'prod') {
      const articleDlqAlarm = this.articleProcessingDLQ.metricApproximateNumberOfMessagesVisible()
        .createAlarm(this, 'ArticleDLQAlarm', {
          alarmName: `read-it-later-article-dlq-alarm-${environment}`,
          alarmDescription: 'Alert when messages appear in article processing DLQ',
          threshold: 1,
          evaluationPeriods: 1,
          treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
        });

      const digestDlqAlarm = this.digestGenerationDLQ.metricApproximateNumberOfMessagesVisible()
        .createAlarm(this, 'DigestDLQAlarm', {
          alarmName: `read-it-later-digest-dlq-alarm-${environment}`,
          alarmDescription: 'Alert when messages appear in digest generation DLQ',
          threshold: 1,
          evaluationPeriods: 1,
          treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
        });
    }

    // Outputs
    new cdk.CfnOutput(this, 'ArticleProcessingQueueUrl', {
      value: this.articleProcessingQueue.queueUrl,
      description: 'Article processing queue URL',
      exportName: `${environment}-ArticleProcessingQueueUrl`,
    });

    new cdk.CfnOutput(this, 'ArticleProcessingQueueArn', {
      value: this.articleProcessingQueue.queueArn,
      description: 'Article processing queue ARN',
      exportName: `${environment}-ArticleProcessingQueueArn`,
    });

    new cdk.CfnOutput(this, 'DigestGenerationQueueUrl', {
      value: this.digestGenerationQueue.queueUrl,
      description: 'Digest generation queue URL',
      exportName: `${environment}-DigestGenerationQueueUrl`,
    });

    new cdk.CfnOutput(this, 'DigestGenerationQueueArn', {
      value: this.digestGenerationQueue.queueArn,
      description: 'Digest generation queue ARN',
      exportName: `${environment}-DigestGenerationQueueArn`,
    });

    // Tags
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('Project', 'read-it-later-anator');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}
