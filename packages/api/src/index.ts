import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { ulid } from 'ulid';
import { logger } from 'hono/logger';

import { healthRoutes } from './routes/health';
import { businessRoutes } from './routes/businesses';
import { documentRoutes } from './routes/documents';
import { entityRoutes } from './routes/entities';
import { memoryRoutes } from './routes/memory';
import { supplierRoutes } from './routes/suppliers';
import { alertRoutes } from './routes/alerts';
import { taskRoutes } from './routes/tasks';
import { tenantContext } from './middleware/tenantContext';

type Variables = {
  tenantId: string;
  userId: string;
  role: string;
  permissions: string[];
  requestId: string;
};

const app = new Hono<{ Variables: Variables }>();

app.use('*', logger());
app.use('*', async (c, next) => {
  const reqId = ulid();
  c.set('requestId', reqId);
  await next();
});

// Apply tenant context middleware to API routes
app.use('/api/v1/*', tenantContext);

// Routes
app.route('/', healthRoutes);
app.route('/api/v1/businesses', businessRoutes);
app.route('/api/v1/documents', documentRoutes);
app.route('/api/v1/entities', entityRoutes);
app.route('/api/v1/memory', memoryRoutes);
app.route('/api/v1/suppliers', supplierRoutes);
app.route('/api/v1/alerts', alertRoutes);
app.route('/api/v1/tasks', taskRoutes);

// Global Error Handler
app.onError((err, c) => {
  const requestId = c.get('requestId');
  console.error(JSON.stringify({
    level: 'error',
    message: err.message,
    requestId,
    tenantId: c.var.tenantId,
  }));
  return c.json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: 'INTERNAL_ERROR'
    },
    requestId,
  }, 500);
});

app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      message: 'Not Found',
      code: 'NOT_FOUND'
    },
    requestId: c.get('requestId')
  }, 404);
});

export const handler = handle(app);
