#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StatefulStack } from '../lib/stateful-stack';
import { ProcessingStack } from '../lib/processing-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();
const env = { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
};
const stage = process.env.STAGE || 'dev';

const statefulStack = new StatefulStack(app, `DukaanOsStatefulStack-${stage}`, { env, stage });

const processingStack = new ProcessingStack(app, `DukaanOsProcessingStack-${stage}`, {
    env,
    stage,
    table: statefulStack.table,
    bucket: statefulStack.bucket
});

const apiStack = new ApiStack(app, `DukaanOsApiStack-${stage}`, {
    env,
    stage,
    table: statefulStack.table,
    bucket: statefulStack.bucket,
    userPool: statefulStack.userPool,
    userPoolClient: statefulStack.userPoolClient
});
