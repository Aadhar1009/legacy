import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigw2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigw2_authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export interface ApiStackProps extends cdk.StackProps {
  stage: string;
  table: dynamodb.Table;
  bucket: s3.Bucket;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const apiHandler = new nodejs.NodejsFunction(this, 'ApiHandlerFunction', {
      entry: path.join(__dirname, '../../api/src/index.ts'), // Assuming hono app
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        TABLE_NAME: props.table.tableName,
        BUCKET_NAME: props.bucket.bucketName,
        STAGE: props.stage,
        BEDROCK_REGION: process.env.CDK_DEFAULT_REGION || 'us-east-1',
        BEDROCK_MODEL_SONNET: 'anthropic.claude-3-sonnet-20240229-v1:0',
        BEDROCK_MODEL_HAIKU: 'anthropic.claude-3-haiku-20240307-v1:0'
      }
    });

    props.table.grantReadWriteData(apiHandler);
    props.bucket.grantReadWrite(apiHandler);
    apiHandler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*']
    }));

    const authorizer = new apigw2_authorizers.HttpJwtAuthorizer('CognitoAuthorizer', props.userPool.userPoolProviderUrl, {
      jwtAudience: [props.userPoolClient.userPoolClientId]
    });

    const httpApi = new apigw2.HttpApi(this, 'DukaanOsHttpApi', {
      corsPreflight: {
        allowHeaders: ['Authorization', 'Content-Type'],
        allowMethods: [
          apigw2.CorsHttpMethod.GET,
          apigw2.CorsHttpMethod.POST,
          apigw2.CorsHttpMethod.PUT,
          apigw2.CorsHttpMethod.DELETE,
          apigw2.CorsHttpMethod.OPTIONS
        ],
        allowOrigins: ['*'],
      }
    });

    const apiIntegration = new apigw2_integrations.HttpLambdaIntegration('ApiIntegration', apiHandler);

    httpApi.addRoutes({
      path: '/api/{proxy+}',
      methods: [apigw2.HttpMethod.ANY],
      integration: apiIntegration,
      authorizer: authorizer
    });
  }
}
