import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ulid } from 'ulid';
import { putEntity } from '../db/operations';
import { logAuditEvent } from '../services/auditLog';

export const businessRoutes = new Hono<{ Variables: { tenantId: string, userId: string, requestId: string } }>();

const createBusinessSchema = z.object({
  name: z.string().min(1),
  gstin: z.string().optional(),
  address: z.string().optional()
});

businessRoutes.post('/', zValidator('json', createBusinessSchema), async (c) => {
  const body = c.req.valid('json');
  const userId = c.var.userId;
  const requestId = c.var.requestId;
  
  // Create new tenant if not already tied to one
  let tenantId = c.var.tenantId;
  if (!tenantId || tenantId === 'default-tenant') {
    tenantId = ulid();
  }
  
  const business = {
    id: tenantId,
    type: 'BUSINESS',
    name: body.name,
    gstin: body.gstin,
    address: body.address,
    createdBy: userId
  };

  await putEntity(tenantId, 'METADATA', business);
  
  await logAuditEvent({
    tenantId,
    userId,
    action: 'CREATE',
    resourceType: 'BUSINESS',
    resourceId: tenantId,
    details: { name: body.name }
  });

  return c.json({
    success: true,
    data: business,
    requestId
  }, 201);
});
