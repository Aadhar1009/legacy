import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export interface ProcessingStackProps extends cdk.StackProps {
  stage: string;
  table: dynamodb.Table;
  bucket: s3.Bucket;
}

export class ProcessingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ProcessingStackProps) {
    super(scope, id, props);

    const validateLambda = new nodejs.NodejsFunction(this, 'ValidateDocumentFunction', {
      entry: path.join(__dirname, '../lambda/processing/validateDocument.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      environment: {
        TABLE_NAME: props.table.tableName,
        BUCKET_NAME: props.bucket.bucketName
      }
    });

    const extractLambda = new nodejs.NodejsFunction(this, 'ExtractAndEnrichFunction', {
      entry: path.join(__dirname, '../lambda/processing/extractAndEnrich.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(300),
      environment: {
        TABLE_NAME: props.table.tableName,
        BUCKET_NAME: props.bucket.bucketName
      }
    });

    props.bucket.grantRead(validateLambda);
    props.table.grantReadWriteData(validateLambda);

    props.bucket.grantRead(extractLambda);
    props.table.grantReadWriteData(extractLambda);
    extractLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['textract:AnalyzeExpense'],
      resources: ['*']
    }));
    extractLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*']
    }));

    const validateTask = new tasks.LambdaInvoke(this, 'Validate Document', {
      lambdaFunction: validateLambda,
      outputPath: '$.Payload'
    });

    const extractTask = new tasks.LambdaInvoke(this, 'Extract and Enrich', {
      lambdaFunction: extractLambda,
      outputPath: '$.Payload'
    });

    const definition = validateTask.next(extractTask);

    const stateMachine = new sfn.StateMachine(this, 'DocumentProcessingStateMachine', {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
      timeout: cdk.Duration.minutes(5)
    });

    const dlq = new sqs.Queue(this, 'DocumentProcessingDLQ');

    new events.Rule(this, 'S3ObjectCreatedRule', {
      eventPattern: {
        source: ['aws.s3'],
        detailType: ['Object Created'],
        detail: {
          bucket: {
            name: [props.bucket.bucketName]
          },
          object: {
            key: [{ prefix: 'tenants/' }]
          }
        }
      },
      targets: [new targets.SfnStateMachine(stateMachine, {
        deadLetterQueue: dlq
      })]
    });
  }
}
