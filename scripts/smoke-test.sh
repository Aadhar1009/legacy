#!/bin/bash
set -e

# Set defaults if not provided in environment
API_URL=${NEXT_PUBLIC_API_URL:-"http://localhost:3001/api/v1"}

echo "💨 Running Smoke Tests against $API_URL"

# 1. Health Check
echo "Testing / health route..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/../health || echo "Failed")
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed with status: $HTTP_STATUS"
  exit 1
fi

# 2. Since other routes are authenticated, we stop here for the basic unauthenticated smoke test
echo "Auth routes require Cognito tokens. Smoke test passed!"
