import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ulid } from 'ulid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { queryByPrefix, getEntity, putEntity } from '../db/operations';
import { logAuditEvent } from '../services/auditLog';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
const BUCKET_NAME = process.env.DOCUMENTS_BUCKET || 'dukaanos-documents';

export const documentRoutes = new Hono<{ Variables: { tenantId: string, userId: string, requestId: string } }>();

const uploadUrlSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().positive().max(10 * 1024 * 1024) // 10MB max
});

documentRoutes.post('/upload-url', zValidator('json', uploadUrlSchema), async (c) => {
  const { filename, contentType, size } = c.req.valid('json');
  const tenantId = c.var.tenantId;
  const documentId = ulid();
  
  const key = `tenants/${tenantId}/uploads/${documentId}/${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Metadata: {
      'tenant-id': tenantId,
      'document-id': documentId
    }
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  await logAuditEvent({
    tenantId,
    userId: c.var.userId,
    action: 'GENERATE_UPLOAD_URL',
    resourceType: 'DOCUMENT',
    resourceId: documentId,
    details: { filename, size }
  });

  return c.json({
    success: true,
    data: {
      uploadUrl: url,
      documentId,
      key
    },
    requestId: c.var.requestId
  });
});

documentRoutes.get('/', async (c) => {
  const tenantId = c.var.tenantId;
  const limit = parseInt(c.req.query('limit') || '50');
  const lastKey = c.req.query('lastKey');
  
  const options: any = { limit };
  if (lastKey) {
    try {
      options.lastEvaluatedKey = JSON.parse(Buffer.from(lastKey, 'base64').toString());
    } catch (e) {
      // ignore invalid token
    }
  }

  const result = await queryByPrefix(tenantId, 'DOC#', options);
  
  let nextKey = undefined;
  if (result.lastEvaluatedKey) {
    nextKey = Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64');
  }

  return c.json({
    success: true,
    data: result.items,
    pagination: {
      nextKey
    },
    requestId: c.var.requestId
  });
});

documentRoutes.get('/:id', async (c) => {
  const tenantId = c.var.tenantId;
  const docId = c.req.param('id');
  
  const doc = await getEntity(tenantId, `DOC#${docId}`);
  if (!doc) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' }, requestId: c.var.requestId }, 404);
  }
  
  return c.json({
    success: true,
    data: doc,
    requestId: c.var.requestId
  });
});

const correctionSchema = z.object({
  field: z.string(),
  oldValue: z.any(),
  newValue: z.any(),
  reason: z.string().optional()
});

documentRoutes.patch('/:id/corrections', zValidator('json', correctionSchema), async (c) => {
  const tenantId = c.var.tenantId;
  const docId = c.req.param('id');
  const body = c.req.valid('json');
  
  const correctionId = ulid();
  const correction = {
    id: correctionId,
    type: 'CORRECTION',
    documentId: docId,
    ...body,
    userId: c.var.userId,
    timestamp: new Date().toISOString()
  };

  await putEntity(tenantId, `DOC#${docId}#CORRECTION#${correctionId}`, correction);
  
  await logAuditEvent({
    tenantId,
    userId: c.var.userId,
    action: 'HUMAN_CORRECTION',
    resourceType: 'DOCUMENT',
    resourceId: docId,
    details: { field: body.field, correctionId }
  });

  return c.json({
    success: true,
    data: correction,
    requestId: c.var.requestId
  });
});
