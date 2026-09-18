import { Hono } from 'hono';
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const demoRoutes = new Hono<{ Variables: { tenantId: string, role: string, requestId: string } }>();

demoRoutes.post('/reset', async (c) => {
  const tenantId = c.var.tenantId;

  // SAFETY MEASURE: Only allow resetting if it's explicitly a demo tenant or they are OWNER
  // In a real app, you'd check a strict "is_demo" flag on the tenant entity.
  if (c.var.role !== 'OWNER' && !tenantId.startsWith('DEMO')) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  try {
    // 1. Fetch all items for the tenant
    const items = await ddb.send(new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': `TENANT#${tenantId}` }
    }));

    // 2. Delete all items (For a hackathon demo reset, this is fine)
    // Note: DDB BatchWrite is limited to 25 items, doing sequentially for simplicity here
    for (const item of (items.Items || [])) {
      await ddb.send(new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: `TENANT#${tenantId}`, SK: item.SK }
      }));
    }

    return c.json({
      success: true,
      message: 'Demo environment reset successfully.',
      request_id: c.var.requestId
    });
  } catch (err) {
    console.error('Demo reset failed:', err);
    return c.json({ error: 'Failed to reset demo environment' }, 500);
  }
});
