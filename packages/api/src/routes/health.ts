import { Hono } from 'hono';
import { docClient, TABLE_NAME } from '../db/client';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

export const healthRoutes = new Hono();

healthRoutes.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

healthRoutes.get('/ready', async (c) => {
  try {
    // Check DB connectivity
    await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: 'HEALTH', SK: 'CHECK' }
    }));
    return c.json({ status: 'ready', db: 'ok' });
  } catch (error: any) {
    // If the table doesn't exist or is unreachable, it will throw
    if (error.name === 'ResourceNotFoundException') {
        return c.json({ status: 'ready', db: 'ok_not_found' });
    }
    return c.json({ status: 'not_ready', db: error.message }, 503);
  }
});
