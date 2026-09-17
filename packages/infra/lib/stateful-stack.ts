import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export interface StatefulStackProps extends cdk.StackProps {
  stage: string;
}

export class StatefulStack extends cdk.Stack {
  public readonly table: dynamodb.Table;
  public readonly bucket: s3.Bucket;
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: StatefulStackProps) {
    super(scope, id, props);

    // DynamoDB Table
    this.table = new dynamodb.Table(this, 'DukaanOsTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      timeToLiveAttribute: 'TTL'
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING }
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING }
    });

    // S3 Bucket
    this.bucket = new s3.Bucket(this, 'DukaanOsBucket', {
      eventBridgeEnabled: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
        allowedOrigins: ['*'],
        allowedHeaders: ['*']
      }],
      lifecycleRules: [
        {
          id: 'MoveRawToGlacier',
          prefix: 'raw/',
          transitions: [{
            storageClass: s3.StorageClass.GLACIER,
            transitionAfter: cdk.Duration.days(90)
          }]
        },
        {
          id: 'ExpireTemp',
          prefix: 'temp/',
          expiration: cdk.Duration.days(1)
        }
      ]
    });

    // Pre Token Lambda
    const preTokenGenerationLambda = new nodejs.NodejsFunction(this, 'PreTokenGenerationFunction', {
      entry: path.join(__dirname, '../lambda/auth/preTokenGeneration.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      environment: {
        STAGE: props.stage
      }
    });

    // Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'DukaanOsUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      customAttributes: {
        'tenant_id': new cognito.StringAttribute({ mutable: true }),
        'role': new cognito.StringAttribute({ mutable: true })
      },
      lambdaTriggers: {
        preTokenGeneration: preTokenGenerationLambda
      }
    });

    this.userPoolClient = new cognito.UserPoolClient(this, 'DukaanOsUserPoolClient', {
      userPool: this.userPool,
      authFlows: {
        userSrp: true,
        userPassword: true
      },
      idTokenValidity: cdk.Duration.hours(1),
      accessTokenValidity: cdk.Duration.hours(1)
    });
  }
}
