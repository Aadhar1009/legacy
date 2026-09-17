import { Hono } from 'hono';
import { queryByPrefix, updateEntity } from '../db/operations';

export const alertRoutes = new Hono<{ Variables: { tenantId: string, requestId: string, userId: string } }>();

alertRoutes.get('/', async (c) => {
  const tenantId = c.var.tenantId;
  // In a real app we might use a GSI sorted by severity or date
  const result = await queryByPrefix(tenantId, 'ALERT#');
  
  return c.json({
    success: true,
    data: result.items,
    requestId: c.var.requestId
  });
});

alertRoutes.patch('/:id/acknowledge', async (c) => {
  const tenantId = c.var.tenantId;
  const id = c.req.param('id');
  
  const updated = await updateEntity(tenantId, `ALERT#${id}`, {
    status: 'ACKNOWLEDGED',
    acknowledgedBy: c.var.userId,
    acknowledgedAt: new Date().toISOString()
  });
  
  return c.json({
    success: true,
    data: updated,
    requestId: c.var.requestId
  });
});
