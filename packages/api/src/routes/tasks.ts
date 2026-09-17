import { Hono } from 'hono';
import { queryByPrefix, updateEntity } from '../db/operations';
import { logAuditEvent } from '../services/auditLog';

export const taskRoutes = new Hono<{ Variables: { tenantId: string, requestId: string, userId: string } }>();

taskRoutes.get('/', async (c) => {
  const tenantId = c.var.tenantId;
  const result = await queryByPrefix(tenantId, 'TASK#');
  
  return c.json({
    success: true,
    data: result.items,
    requestId: c.var.requestId
  });
});

taskRoutes.patch('/:id/approve', async (c) => {
  const tenantId = c.var.tenantId;
  const id = c.req.param('id');
  
  const updated = await updateEntity(tenantId, `TASK#${id}`, {
    status: 'APPROVED',
    actedBy: c.var.userId,
    actedAt: new Date().toISOString()
  });

  await logAuditEvent({
    tenantId,
    userId: c.var.userId,
    action: 'APPROVE_TASK',
    resourceType: 'TASK',
    resourceId: id
  });
  
  return c.json({
    success: true,
    data: updated,
    requestId: c.var.requestId
  });
});

taskRoutes.patch('/:id/reject', async (c) => {
  const tenantId = c.var.tenantId;
  const id = c.req.param('id');
  
  const updated = await updateEntity(tenantId, `TASK#${id}`, {
    status: 'REJECTED',
    actedBy: c.var.userId,
    actedAt: new Date().toISOString()
  });

  await logAuditEvent({
    tenantId,
    userId: c.var.userId,
    action: 'REJECT_TASK',
    resourceType: 'TASK',
    resourceId: id
  });
  
  return c.json({
    success: true,
    data: updated,
    requestId: c.var.requestId
  });
});
