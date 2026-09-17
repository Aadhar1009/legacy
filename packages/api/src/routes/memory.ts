import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { routeQuery } from '../agents/router';

export const memoryRoutes = new Hono<{ Variables: { tenantId: string, userId: string, requestId: string } }>();

const querySchema = z.object({
  query: z.string().min(1)
});

memoryRoutes.post('/query', zValidator('json', querySchema), async (c) => {
  const { query } = c.req.valid('json');
  const tenantId = c.var.tenantId;
  const requestId = c.var.requestId;

  const result = await routeQuery({
    tenantId,
    query,
    requestId
  });

  return c.json({
    success: true,
    data: result,
    requestId
  });
});
