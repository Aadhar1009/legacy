import { Hono } from 'hono';
import { queryByPrefix, getEntity, queryGSI } from '../db/operations';

export const supplierRoutes = new Hono<{ Variables: { tenantId: string, requestId: string } }>();

supplierRoutes.get('/', async (c) => {
  const tenantId = c.var.tenantId;
  const result = await queryGSI('GSI2', `TENANT#${tenantId}#TYPE#SUPPLIER`);
  
  return c.json({
    success: true,
    data: result.items,
    requestId: c.var.requestId
  });
});

supplierRoutes.get('/:id', async (c) => {
  const tenantId = c.var.tenantId;
  const id = c.req.param('id');
  
  const supplier = await getEntity(tenantId, `ENTITY#${id}`);
  if (!supplier || supplier.type !== 'SUPPLIER') {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } }, 404);
  }
  
  return c.json({
    success: true,
    data: supplier,
    requestId: c.var.requestId
  });
});

supplierRoutes.get('/:id/prices', async (c) => {
  const tenantId = c.var.tenantId;
  const id = c.req.param('id');
  
  const result = await queryByPrefix(tenantId, `ENTITY#${id}#PRICE#`);
  
  return c.json({
    success: true,
    data: result.items,
    requestId: c.var.requestId
  });
});
