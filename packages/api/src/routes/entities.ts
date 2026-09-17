import { Hono } from 'hono';
import { queryByPrefix, getEntity, queryGSI } from '../db/operations';

export const entityRoutes = new Hono<{ Variables: { tenantId: string, requestId: string } }>();

entityRoutes.get('/', async (c) => {
  const tenantId = c.var.tenantId;
  const entityType = c.req.query('entity_type');
  const limit = parseInt(c.req.query('limit') || '50');
  const lastKey = c.req.query('lastKey');
  
  const options: any = { limit };
  if (lastKey) {
    try {
      options.lastEvaluatedKey = JSON.parse(Buffer.from(lastKey, 'base64').toString());
    } catch (e) {}
  }

  let result;
  if (entityType) {
    result = await queryGSI('GSI2', `TENANT#${tenantId}#TYPE#${entityType}`, undefined, options);
  } else {
    result = await queryByPrefix(tenantId, 'ENTITY#', options);
  }

  let nextKey = undefined;
  if (result.lastEvaluatedKey) {
    nextKey = Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64');
  }

  return c.json({
    success: true,
    data: result.items,
    pagination: { nextKey },
    requestId: c.var.requestId
  });
});

entityRoutes.get('/:id', async (c) => {
  const tenantId = c.var.tenantId;
  const id = c.req.param('id');
  
  const entity = await getEntity(tenantId, `ENTITY#${id}`);
  if (!entity) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Entity not found' }, requestId: c.var.requestId }, 404);
  }
  
  return c.json({
    success: true,
    data: entity,
    requestId: c.var.requestId
  });
});

entityRoutes.get('/:id/timeline', async (c) => {
  const tenantId = c.var.tenantId;
  const id = c.req.param('id');
  const limit = parseInt(c.req.query('limit') || '50');
  
  const result = await queryByPrefix(tenantId, `ENTITY#${id}#EVENT#`, { limit });
  
  return c.json({
    success: true,
    data: result.items,
    requestId: c.var.requestId
  });
});

entityRoutes.get('/:id/relationships', async (c) => {
  const tenantId = c.var.tenantId;
  const id = c.req.param('id');
  
  // Outgoing edges
  const outgoing = await queryByPrefix(tenantId, `ENTITY#${id}#REL#`);
  
  // Incoming edges (via GSI1)
  const incoming = await queryGSI('GSI1', `TENANT#${tenantId}#TARGET#${id}`);
  
  return c.json({
    success: true,
    data: {
      outgoing: outgoing.items,
      incoming: incoming.items
    },
    requestId: c.var.requestId
  });
});
