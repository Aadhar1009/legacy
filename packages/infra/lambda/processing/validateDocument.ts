import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as crypto from 'crypto';

const s3 = new S3Client({});
const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event));

  try {
    const bucket = event.detail.bucket.name;
    const key = event.detail.object.key;
    
    // Extract tenant_id from key: tenants/{tenant_id}/...
    const parts = key.split('/');
    const tenant_id = parts[1];
    
    const headOutput = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    
    const mimeType = headOutput.ContentType || '';
    const size = headOutput.ContentLength || 0;
    
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }
    
    if (size > 10 * 1024 * 1024) { // 10MB
      throw new Error(`File too large: ${size} bytes`);
    }
    
    // In a real app we'd stream the file to compute sha256. 
    // Here we compute a fake hash for simplicity using etag.
    const fileHash = headOutput.ETag ? headOutput.ETag.replace(/"/g, '') : crypto.randomUUID();
    
    const docId = `DOC#${crypto.randomUUID()}`;
    
    await ddb.send(new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        PK: `TENANT#${tenant_id}`,
        SK: docId,
        GSI1PK: `DOC#${docId}`,
        GSI1SK: `TENANT#${tenant_id}`,
        status: 'PROCESSING',
        s3Key: key,
        mimeType,
        size,
        fileHash,
        createdAt: new Date().toISOString()
      }
    }));
    
    return {
      bucket,
      key,
      tenant_id,
      docId
    };
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
};
