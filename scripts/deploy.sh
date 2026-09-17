#!/bin/bash
set -e

echo "🚀 Deploying DukaanOS infrastructure..."

cd packages/infra

# Ensure dependencies are installed
echo "📦 Installing infrastructure dependencies..."
npm install

# Synthesize CloudFormation template
echo "🔨 Synthesizing CDK template..."
npx cdk synth

# Deploy all stacks without requiring manual approval for IAM changes
echo "☁️ Deploying CDK stacks to AWS..."
npx cdk deploy --all --require-approval never

echo "✅ Deployment complete!"
echo "Check the outputs above for API Gateway URL and Cognito User Pool IDs."
