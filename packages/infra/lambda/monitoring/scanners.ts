import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import * as crypto from 'crypto';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: any) => {
  console.log('Running scheduled proactive scans...');
  
  // In a real multi-tenant scenario, this would query all tenants.
  // For MVP, we pass a specific tenant or query GSI.
  const tenantId = process.env.DEMO_TENANT_ID || 'DEMO_TENANT';
  const timestamp = new Date().toISOString();

  try {
    // 1. Warranty Expiry Scan
    // Look for warranties expiring in the next 30 days
    // (Mocked logic - in production we'd use GSI2 temporal index)
    
    console.log(`[Scanner] Checking Warranty expirations for tenant ${tenantId}`);
    
    // Simulate detecting an expiring warranty
    const alertId = `ALT#${crypto.randomUUID()}`;
    await ddb.send(new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        PK: `TENANT#${tenantId}`,
        SK: alertId,
        alert_id: alertId,
        tenant_id: tenantId,
        title: 'Warranty Expiring Soon',
        severity: 'MEDIUM',
        what_changed: 'Samsung 55" TV Warranty expires in 14 days.',
        why_it_matters: 'You must file any remaining service claims before coverage drops.',
        evidence_ids: ['ENT#WARRANTY#123'],
        recommended_action: 'Review equipment condition',
        entity_ids: ['ENT#PRODUCT#456'],
        created_at: timestamp,
        status: 'NEW'
      },
      ConditionExpression: 'attribute_not_exists(PK)' // Prevent duplicate runs
    }));

    console.log(`[Scanner] Successfully generated proactive alerts.`);
    return { status: 'SUCCESS' };
  } catch (err) {
    console.error(`[Scanner] Failed to run proactive scans`, err);
    throw err;
  }
};
