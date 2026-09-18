import { Hono } from 'hono';
import { queryByPrefix, updateEntity } from '../db/operations';
import { logAuditEvent } from '../services/auditLog';
import { verifyActionExecution } from '../services/actionVerifier';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const taskRoutes = new Hono<{ Variables: { tenantId: string, requestId: string, userId: string } }>();

taskRoutes.get('/', async (c) => {
  const tenantId = c.var.tenantId;
  const result = await queryByPrefix(tenantId, 'ACT#'); // Actions use ACT#
  
  return c.json({
    data: result.items,
    request_id: c.var.requestId,
    timestamp: new Date().toISOString()
  });
});

taskRoutes.patch('/:id/approve', async (c) => {
  const tenantId = c.var.tenantId;
  const id = c.req.param('id');
  const timestamp = new Date().toISOString();
  
  // 1. Mark as Approved
  await updateEntity(tenantId, `ACT#${id}`, {
    status: 'APPROVED',
    approved_by: c.var.userId,
    approved_at: timestamp
  });

  // 2. Simulate Execution (In a real system, this would push to an SQS Queue)
  await updateEntity(tenantId, `ACT#${id}`, {
    status: 'EXECUTED',
    executed_at: timestamp
  });

  // 3. Independent Read-After-Write Verification
  // We simulate expecting the task's status field to now be 'EXECUTED'
  const isVerified = await verifyActionExecution(
    ddb, 
    process.env.TABLE_NAME || '', 
    tenantId, 
    `ACT#${id}`, 
    `ACT#${id}`, 
    { field: 'status', expectedValue: 'EXECUTED' }
  );

  await logAuditEvent({
    tenantId,
    userId: c.var.userId,
    action: 'APPROVE_ACTION',
    resourceType: 'ACTION',
    resourceId: id
  });
  
  return c.json({
    data: { id, status: isVerified ? 'VERIFIED_COMPLETED' : 'VERIFICATION_FAILED' },
    request_id: c.var.requestId,
    timestamp
  });
});

taskRoutes.patch('/:id/reject', async (c) => {
  const tenantId = c.var.tenantId;
  const id = c.req.param('id');
  
  const updated = await updateEntity(tenantId, `ACT#${id}`, {
    status: 'REJECTED',
    acted_by: c.var.userId,
    acted_at: new Date().toISOString()
  });

  await logAuditEvent({
    tenantId,
    userId: c.var.userId,
    action: 'REJECT_ACTION',
    resourceType: 'ACTION',
    resourceId: id
  });
  
  return c.json({
    data: updated,
    request_id: c.var.requestId,
    timestamp: new Date().toISOString()
  });
});
