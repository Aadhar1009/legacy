#!/bin/bash
set -e

echo "⚠️ WARNING: This will destroy all DukaanOS infrastructure!"
echo "DynamoDB tables and S3 buckets with RETAIN policy will NOT be deleted."
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🗑️ Destroying DukaanOS infrastructure..."
    cd packages/infra
    npx cdk destroy --all --force
    echo "✅ Teardown complete."
else
    echo "🛑 Teardown cancelled."
fi
